# Seed Data Plan — questions.js → Supabase

> Planning only. No seed scripts, no SQL inserts, no code changes yet.
> Schema target: `supabase/schema.sql`. Source of truth: `questions.js`.

## 1. Current Source of Truth for Question Content

- `questions.js` holds all content. One paper: 令和7年度 (2025) 基本情報技術者試験 科目A, 20 questions.
- Authored array `QUESTIONS`, then exported as:
  ```js
  const QUIZ = { examSet: "基本情報技術者試験 科目A", year: "令和7年度 (2025)", questions: QUESTIONS };
  ```
- **Authored** per-question shape (this is what seed reads from):
  | field | type | notes |
  |-------|------|-------|
  | `id` | int | 1–20 |
  | `number` | string | "問1"…"問20" |
  | `jp` | string | question text (Japanese) |
  | `romaji` | string | Hepburn romaji of question |
  | `en` | string | English of question |
  | `options` | array of `{jp, romaji, en}` | 4 options, order = ア,イ,ウ,エ |
  | `correctAnswer` | **int 0–3** | index into options (ア=0, イ=1, ウ=2, エ=3) |
  | `imagePath` | string \| null | e.g. `public/questions/fe-2025-a/q03.png` |
  | `explanation` | string | multiline template literal (ELI5 / Technical / Wrong answer / Correct answer) |

- **Important shape gotcha:** after authoring, a `QUESTIONS.forEach` post-processor *mutates* the objects for `app.js` — flattens `options` to jp-string array, moves the structured `{jp,romaji,en}` to `optionTranslations`, adds `text` and `translation`. **Seed extraction must use the authored structure (`options[].{jp,romaji,en}`), not the post-processed shape.** Easiest: read the authored literal, or read before the forEach runs.

## 2. Mapping QUIZ → exam_sets and questions

### exam_sets (one row for this paper)
| schema column | value / source |
|---------------|----------------|
| `id` | `fe-2025-a-public` — **NOT present in questions.js**; defined in PROJECT_CONTEXT. See §10. |
| `title` | derive from `QUIZ.year` + `QUIZ.examSet` → "令和7年度 (2025) 基本情報技術者試験 科目A 公開問題" |
| `description` | author manually (home-card copy) |
| `question_count` | `QUIZ.questions.length` (= 20) |

### questions (one row per QUESTIONS[i])
| schema column | source field | transform |
|---------------|--------------|-----------|
| `id` | — | generate uuid at import (DB default) |
| `exam_set_id` | constant | `fe-2025-a-public` |
| `number` | `number` | strip "問" → int (e.g. "問3"→3). `id` already equals this int; use `id`. |
| `body` | `jp`,`romaji`,`en` | `{ jp, romaji, en }` jsonb |
| `options` | `options` | authored `[{jp,romaji,en}×4]` jsonb, order preserved |
| `correct_answer` | `correctAnswer` | **int→letter** via `OPTION_LABELS[correctAnswer]` (0→ア). Schema `correct_answer` is text. |
| `explanation` | `explanation` | as-is text |
| `image_path` | `imagePath` | as-is (null stays null) |

## 3. Field-by-Field Handling

- **Japanese question text** → `body.jp` (jsonb). Keep raw, no normalization (full-width chars, 「」, “” intact).
- **Options** → `options` jsonb array, length 4, order = ア,イ,ウ,エ. Preserve order; index carries the label.
- **correctAnswer** → convert index 0–3 to letter ア/イ/ウ/エ for `correct_answer` text column. Single conversion point; the index→letter map is `OPTION_LABELS`. (Alternative: store the int — but schema/plan use letter; keep letter, convert once.)
- **Question translation** (`romaji`,`en`) → `body.romaji`, `body.en`.
- **Option translations** → already inside each `options[i]` (`romaji`,`en`). No separate column/table needed.
- **explanations** → `explanation` text. Multiline preserved (real newlines). No `\n` escaping artifacts (PROJECT_CONTEXT confirms clean).
- **imagePath** → `image_path`. Null → null. Path is repo-relative (`public/...`); decide later whether image hosting moves to Supabase Storage (out of scope here).

## 4. Proposed Future Seed File Names

- `supabase/seed/exam_sets.seed.json` — the one paper row.
- `supabase/seed/questions.fe-2025-a-public.seed.json` — 20 question rows for this paper.
- One questions file **per paper**, named by `exam_set_id`, so adding papers = adding files, not editing existing ones.
- JSON (not SQL) so the importer is data-driven and the same script handles every paper. SQL insert files only if a no-script DB-console path is needed later.

## 5. Proposed Import Workflow

1. Extract authored `QUESTIONS` + `QUIZ` from `questions.js` (read authored literal, before post-process — §1 gotcha).
2. Emit the two seed JSON files (§4) applying the §2/§3 transforms.
3. Validate (§6). Abort on any failure — no partial import.
4. Upsert `exam_sets` row (on `id`).
5. Upsert `questions` rows (on `(exam_set_id, number)` — schema unique key) so re-running is idempotent.
6. Content tables only. **No** `question_progress` / `quiz_sessions` seeding — those are user-generated at runtime.

> Importer is a later phase. This doc only fixes the file layout + transforms it will use.

## 6. Validation Rules Before Import

- Exactly 20 questions; `number`/`id` cover 問1–問20 with no gaps/dupes.
- Each question: `options.length === 4`.
- `correctAnswer` ∈ {0,1,2,3}; resulting letter ∈ {ア,イ,ウ,エ}.
- `jp`,`romaji`,`en` non-empty for question and every option.
- `explanation` non-empty, contains "Correct answer:", no literal `\n` and no `TODO`.
- `imagePath` either null or a path under `public/`; if set, file exists in repo.
- `correct_answer` letter matches PROJECT_CONTEXT answer key (cross-check: 問1=エ … 問20=イ).
- `(exam_set_id, number)` unique across the seed file.

## 7. What Must NOT Change in questions.js Yet

- Do not touch `questions.js` — content, post-process forEach, or `QUIZ`/`OPTION_LABELS` exports.
- Do not add a paper `id` field, an `EXAM_SETS` structure, or Supabase fields to it now.
- It stays the single authoring source; seed generation reads from it, never rewrites it.

## 8. Supporting Multiple Future Papers

- Per-paper seed files (§4) — new paper = new `questions.<id>.seed.json` + one `exam_sets` row. Existing files untouched.
- Importer iterates all seed files, keyed by `exam_set_id`; same code path for every paper.
- Schema already scopes `questions` by `(exam_set_id, number)`, and progress/session by `exam_set_id` — multi-paper needs no schema change, just more seed rows.
- Authoring future papers can keep the same `questions.js` shape (or one module per paper); the extractor only needs the authored `{jp,romaji,en}` + `correctAnswer` index contract.

## 9. Out of Scope (explicitly not now)

- Seed scripts, SQL insert files, importer code.
- Supabase client / auth code.
- Image migration to Supabase Storage.
- Seeding user tables (`question_progress`, `quiz_sessions`).

## 10. Open Item

- **Paper ID `fe-2025-a-public` is not in `questions.js`** — only in `docs/PROJECT_CONTEXT.md`. Before import, decide the canonical home for the paper ID (likely a small `exam_sets` authoring step). Do not add it to `questions.js` yet (§7); resolve when the importer phase starts.
