// Import seed/fe-2025-a-public.json into the Oracle/Postgres database.
//
//   REQUIRES `pg`:  npm install pg   (before running this script)
//   REQUIRES env:   FE_QUIZ_DATABASE_URL=postgresql://user:pass@host:5432/fe_quiz
//
//   Run (later, on the VM):  node scripts/import_seed_oracle.js [seedPath]
//     default seedPath: seed/fe-2025-a-public.json
//     科目B example:    node scripts/import_seed_oracle.js seed/fe-2025-b-public.json
//
// Imports content only: exam_sets + questions. Does NOT touch users,
// question_progress, quiz_sessions, or the schema. Idempotent: upserts on the
// schema unique keys (exam_sets.id and questions(exam_set_id, number)), so
// re-running updates rows instead of duplicating them. All work in ONE
// transaction; any error rolls back the whole import.
//
// Schema mapping (oracle/schema.sql):
//   exam_set.id/title/description/question_count -> public.exam_sets
//   question.jp/romaji/en  -> questions.body  (jsonb {jp,romaji,en[,optionMode][,supplementalHtml][,imagePaths]})
//   question.options       -> questions.options (jsonb, labels preserved)
//   question.correct_answer-> questions.correct_answer (ア/イ/ウ/エ)
//   question.explanation   -> questions.explanation
//   question.number        -> questions.number
//   question.imagePath     -> questions.image_path (null stays null)

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// Optional CLI arg: path to the seed JSON (relative to cwd or absolute).
// `--validate-only` exercises the authored contract without pg or database writes.
const VALIDATE_ONLY = process.argv.includes("--validate-only");
const seedArg = process.argv.slice(2).find((arg) => arg !== "--validate-only");
const SEED = seedArg
  ? path.resolve(seedArg)
  : path.join(ROOT, "seed", "fe-2025-a-public.json");

// --- Validation (abort before any DB write) -------------------------------
function validate(seed) {
  const fail = (m) => {
    throw new Error(`Validation failed: ${m}`);
  };
  if (!seed.exam_set || !seed.exam_set.id) fail("exam_set missing in JSON");

  const qs = seed.questions;
  // Expected count comes from the seed itself (exam_set.question_count), so any
  // paper size works (科目A=20, 科目B=6, ...).
  const expected = seed.exam_set.question_count;
  if (!Array.isArray(qs) || qs.length !== expected) {
    fail(`expected ${expected} questions, got ${qs ? qs.length : 0}`);
  }

  // The one intentional 科目B placeholder, allowed verbatim in explanation only.
  const PLACEHOLDER =
    "TODO: Add manual explanation in this format:\nELI5:\nTechnical breakdown:\nWrong answer analysis:\nCorrect answer: ___";
  const OPTION_MODES = new Set(["labels-only", "structured-text"]);

  qs.forEach((q, i) => {
    const tag = `Q${q.number}`;
    if (q.number !== i + 1) fail(`${tag}: numbers must be 1-${expected} in order (got ${q.number} at slot ${i})`);
    if (!Array.isArray(q.options) || q.options.length < 1) fail(`${tag}: must have at least 1 option`);
    const labels = q.options.map((option) =>
      typeof option.label === "string" ? option.label.trim() : ""
    );
    if (labels.some((label) => !label)) fail(`${tag}: option labels must be non-empty`);
    if (new Set(labels).size !== labels.length) fail(`${tag}: option labels must be unique`);
    if (!labels.includes(q.correct_answer)) fail(`${tag}: correct_answer must match an option label`);
    if (q.optionMode != null && !OPTION_MODES.has(q.optionMode)) {
      fail(`${tag}: optionMode must be labels-only or structured-text`);
    }
    const hasSourceImage = !!q.imagePath || (Array.isArray(q.imagePaths) && q.imagePaths.length > 0);
    if (q.optionMode === "labels-only" && !hasSourceImage) {
      fail(`${tag}: labels-only requires imagePath or imagePaths`);
    }
    if (typeof q.explanation !== "string") fail(`${tag}: explanation missing`);
    // Strict: reject stray TODO, except the exact intentional placeholder.
    if (q.explanation !== PLACEHOLDER && /TODO/.test(q.explanation)) fail(`${tag}: explanation contains TODO`);
    // TODO must never leak into any other field (text/options/answer/html/images).
    const others = JSON.stringify([q.jp, q.romaji, q.en, q.options, q.correct_answer, q.optionMode, q.supplementalHtml, q.imagePaths]);
    if (/TODO/.test(others)) fail(`${tag}: TODO not allowed outside explanation`);
  });
}

// --- Import ---------------------------------------------------------------
async function main() {
  const seed = JSON.parse(fs.readFileSync(SEED, "utf8"));
  validate(seed);
  if (VALIDATE_ONLY) {
    console.log(`Validated seed: ${seed.exam_set.id} (${seed.questions.length} questions)`);
    return;
  }

  let Client;
  try {
    ({ Client } = require("pg"));
  } catch {
    throw new Error("Missing dependency 'pg'. Run: npm install pg");
  }
  const DB_URL = process.env.FE_QUIZ_DATABASE_URL;
  if (!DB_URL) {
    throw new Error("Missing env FE_QUIZ_DATABASE_URL (postgresql://user:pass@host:5432/fe_quiz).");
  }

  const { exam_set, questions } = seed;
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO public.exam_sets (id, title, description, question_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             description = EXCLUDED.description,
             question_count = EXCLUDED.question_count`,
      [exam_set.id, exam_set.title, exam_set.description, exam_set.question_count]
    );

    let imported = 0;
    for (const q of questions) {
      const body = { jp: q.jp, romaji: q.romaji, en: q.en };
      if (q.optionMode) body.optionMode = q.optionMode;
      // supplementalHtml (科目B program blocks / tables) only when present.
      if (q.supplementalHtml) body.supplementalHtml = q.supplementalHtml;
      // imagePaths (科目B original exam crops) only when present.
      if (q.imagePaths) body.imagePaths = q.imagePaths;
      await client.query(
        `INSERT INTO public.questions
           (exam_set_id, number, body, options, correct_answer, explanation, image_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (exam_set_id, number) DO UPDATE
           SET body = EXCLUDED.body,
               options = EXCLUDED.options,
               correct_answer = EXCLUDED.correct_answer,
               explanation = EXCLUDED.explanation,
               image_path = EXCLUDED.image_path`,
        [
          exam_set.id,
          q.number,
          JSON.stringify(body),
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation,
          q.imagePath, // null stays null
        ]
      );
      imported++;
    }

    await client.query("COMMIT");
    console.log(`Imported exam set: ${exam_set.id}`);
    console.log(`Questions imported: ${imported}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import failed, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
} else {
  module.exports = { validate };
}
