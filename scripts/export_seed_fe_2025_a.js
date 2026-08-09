// Export questions.js → seed/fe-2025-a-public.json for the Oracle/Postgres import.
//
// Source of truth: ../questions.js (authored data). Run: node scripts/export_seed_fe_2025_a.js
//
// SHAPE WARNING (see docs/SEED_DATA_PLAN.md §1): questions.js authors each option as
// { jp, romaji, en }, then a forEach FLATTENS q.options to jp-strings for app.js and
// moves the authored structure to q.optionTranslations. So after loading, the authored
// per-option data lives in q.optionTranslations, NOT q.options. We read optionTranslations.
//
// questions.js is a plain script (no exports), so we wrap its source in a Function that
// returns the globals it defines. ponytail: no extra dep, no build — eval the file we own.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "questions.js");
const OUT_DIR = path.join(ROOT, "seed");
const OUT = path.join(OUT_DIR, "fe-2025-a-public.json");

const EXAM_SET = {
  id: "fe-2025-a-public",
  title: "令和7年度 基本情報技術者試験 科目A 公開問題",
  description:
    "Practice with Japanese questions, romaji support, English translation, and explanations.",
  question_count: 20,
};

// Load questions.js by evaluating its source and returning its globals.
function loadSource() {
  const code = fs.readFileSync(SRC, "utf8");
  // questions.js declares QUESTIONS/QUIZ/OPTION_LABELS with const; append a return.
  const fn = new Function(`${code}\nreturn { QUESTIONS, QUIZ, OPTION_LABELS };`);
  return fn();
}

function buildQuestion(q, OPTION_LABELS) {
  // Authored per-option {jp,romaji,en} survives in optionTranslations after the forEach.
  const authored = q.optionTranslations;
  const options = authored.map((o, i) => ({
    label: OPTION_LABELS[i], // ア / イ / ウ / エ
    jp: o.jp,
    romaji: o.romaji,
    en: o.en,
  }));
  return {
    number: q.id, // 1..20
    jp: q.jp,
    romaji: q.romaji,
    en: q.en,
    options,
    correct_answer: OPTION_LABELS[q.correctAnswer], // index 0-3 -> ア/イ/ウ/エ
    explanation: q.explanation,
    imagePath: q.imagePath, // null when absent
  };
}

// Validation — abort on any failure, no partial export (SEED_DATA_PLAN §6).
function validate(questions, OPTION_LABELS) {
  const fail = (m) => {
    throw new Error(`Validation failed: ${m}`);
  };
  if (questions.length !== 20) fail(`expected 20 questions, got ${questions.length}`);

  questions.forEach((q, i) => {
    const tag = `Q${q.id}`;
    if (q.id !== i + 1) fail(`${tag}: numbers must be 1-20 in order (got id ${q.id} at slot ${i})`);
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3)
      fail(`${tag}: correctAnswer must be 0-3, got ${q.correctAnswer}`);
    const opts = q.optionTranslations;
    if (!Array.isArray(opts) || opts.length !== 4) fail(`${tag}: must have 4 options`);
    if (!q.explanation || !q.explanation.startsWith("ELI5:"))
      fail(`${tag}: explanation must start with "ELI5:"`);
    if (/TODO/.test(q.explanation)) fail(`${tag}: explanation contains TODO`);
  });

  // q03 and q14 image paths preserved.
  const img = (id) => questions.find((q) => q.id === id).imagePath;
  if (img(3) !== "public/questions/fe-2025-a/q03.png") fail("Q3 image path not preserved");
  if (img(14) !== "public/questions/fe-2025-a/q14.png") fail("Q14 image path not preserved");
}

function main() {
  const { QUIZ, OPTION_LABELS } = loadSource();
  const questions = QUIZ.questions;

  validate(questions, OPTION_LABELS);

  const seed = {
    exam_set: EXAM_SET,
    questions: questions.map((q) => buildQuestion(q, OPTION_LABELS)),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(seed, null, 2) + "\n", "utf8");
  console.log(`Wrote ${seed.questions.length} questions -> ${path.relative(ROOT, OUT)}`);
}

main();
