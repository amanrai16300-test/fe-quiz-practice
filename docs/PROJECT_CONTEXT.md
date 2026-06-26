# FE Quiz App — Project Context

## Project Name
FE Quiz Practice

## Goal
A local, no-build study app for the Japanese **基本情報技術者試験 (FE) 科目A** exam.
Each question is presented in Japanese with romaji and English study aids, plus a
detailed ELI5-first explanation. The app helps a non-native learner practice real
past-exam questions and understand both the correct answer and why each wrong option
is wrong.

## Current Folder Path
`c:\my space\Projects\fe-quiz-app`

## Current Stable Features
- Home / paper selection screen (mutually exclusive with the quiz screen).
- Single-paper quiz flow: render question → select option → submit → feedback + explanation → next.
- Translation panel: Japanese / Romaji / English for the question and for each option (ア〜エ).
  Does not reveal the correct answer.
- Question chip navigator (問1〜問20) for direct jump to any question.
- In-memory per-question answer state, scoped by paper ID.
- Progress summary (answered / correct / wrong) near the progress bar.
- "Back to papers" returns to the home screen without erasing in-memory state.
- Paper-tone design, touch-friendly, works on desktop and iPhone width, no horizontal scroll.

## Current Data Source Files
- `questions.js` — all question/option/translation/explanation data, plus `QUIZ` and
  `OPTION_LABELS`. Single source of truth for content.
- `app.js` — quiz controller (render, select, submit, next, jump, summary, paper selection).
- `index.html` — markup (home screen + quiz shell).
- `style.css` — all styling.

## Current Question Set
- One paper: **令和7年度 基本情報技術者試験 科目A 公開問題**
  - Paper ID: `fe-2025-a-public`
  - 20 questions (問1〜問20).

## Answer Key Status
All 20 `correctAnswer` values validated against the official answer sheet:

| Q | Ans | Q | Ans |
|---|-----|---|-----|
| 問1 | エ | 問11 | ウ |
| 問2 | イ | 問12 | エ |
| 問3 | イ | 問13 | エ |
| 問4 | ウ | 問14 | エ |
| 問5 | ア | 問15 | ウ |
| 問6 | ウ | 問16 | エ |
| 問7 | エ | 問17 | イ |
| 問8 | エ | 問18 | エ |
| 問9 | ウ | 問19 | エ |
| 問10 | ア | 問20 | イ |

## Translation Status
Complete for all 20 questions. Each question and each of its four options has
Japanese, Hepburn romaji, and simple English. Surfaced via the translation panel
(collapsed by default, reset per question).

## Explanation Status
Complete for all 20 questions. Every explanation:
- Starts with an `ELI5:` section.
- Contains `Technical breakdown:` and `Wrong answer analysis:` sections.
- Ends with `Correct answer: X`.
- No `TODO` remains. No literal `\n` artifacts (real newlines via template literals).

## Image Paths
- 問3: `public/questions/fe-2025-a/q03.png`
- 問14: `public/questions/fe-2025-a/q14.png`
- All other questions: no image (`imagePath: null`).

## Current UI Flow
1. **Home screen** — title "FE Quiz Practice", one paper card (title, description,
   "20 questions", Start Practice button).
2. **Start Practice** → shows quiz screen only, renders 問1 fresh.
3. **Quiz screen** — progress bar, summary, question chips, question card, translation
   toggle, options, submit.
4. **Submit** → locks options, marks correct/incorrect, reveals explanation, swaps to
   "次の問題 →" (last question shows "最初に戻る ↺").
5. **Chips / Next** → navigate between questions.
6. **Back to papers** → returns to home screen (in-memory state preserved).

## Current In-Memory Progress Behavior
- Answer state stored in a plain JS object keyed by paper ID:
  `answers[paperId][index] = { selected, submitted, isCorrect }`.
- Jumping away from an answered question and returning restores the selected option,
  correct/incorrect feedback, explanation, and locked options.
- Unanswered questions render fresh; Submit stays disabled until an option is selected.
- Summary (answered / correct / wrong) derives from this store and updates on submit
  and on every render (including jumps).
- State is per paper; different paper IDs use separate state.
- "Back to papers" does not clear state; starting the same paper again resumes it.
- **Refresh resets everything** — there is no persistent storage yet.

## What Is Intentionally NOT Added Yet
- GitHub repository
- localStorage (or any browser persistence)
- Supabase (or any backend/database)
- Authentication
- PWA (offline/installable)
- Backend sync
- Multiple real papers (data structure is prepared, but only one paper is wired)

## Next Planned Phases
1. **Persistence** — add localStorage so progress survives refresh.
2. **Multiple papers** — add real additional papers to the prepared `EXAM_SETS` structure.
3. **Backend sync** — Supabase for cross-device progress (requires auth).
4. **Auth** — user accounts to scope synced progress.
5. **PWA** — offline use and installability.

> The in-memory answer store is a plain serializable object by design, so persistence
> and sync layers can be added later without reworking the quiz logic.

## Latest Checkpoint

Current repo state:
- GitHub repository has been created.
- `README.md` has been created.
- `docs/SUPABASE_PLAN.md` has been created (backend-first sync planning doc).
- `supabase/schema.sql` has been created as a **draft schema only** (not run).
- `docs/SEED_DATA_PLAN.md` has been created (questions.js → Supabase seed plan).
- No Supabase app wiring added yet.
- No auth code added yet.
- No migrations run yet.

Seed-data warnings to carry forward:
- **questions.js has two shapes.** The authored shape and a runtime/post-processed
  shape (a `forEach` flattens `options` to jp strings and moves the structured data
  to `optionTranslations`). Future seed scripts MUST read the **authored**
  `options[].{jp, romaji, en}` data, not the flattened runtime shape.
- **correctAnswer is an index (0–3)** in questions.js. The database `correct_answer`
  should be converted to the option label/text (ア/イ/ウ/エ) per the schema plan.
- **Paper ID `fe-2025-a-public`** currently lives in planning/context docs only,
  not inside `questions.js`.

## Latest UI Checkpoint

- Responsive light/dark theme toggle added.
- Toggle is fixed top-right and works on both the Home and Quiz screens.
- Theme is controlled by `data-theme="dark"` on the `<html>` element.
- Dark mode uses CSS token overrides (same `:root` token names, dark values).
- Theme is memory-only for now; refresh resets to light (default).
- No localStorage, Supabase, auth, or PWA was added.
- App behavior, answer checking, progress state, `questions.js`, explanations,
  translations, `correctAnswer`, and image paths were not changed.

## Latest Backend Direction Checkpoint

- **Supabase project creation was blocked** — free project limit reached.
- **Oracle backend option is now planned** as the Supabase replacement.
- `docs/ORACLE_BACKEND_PLAN.md` has been created.
- **Recommended backend direction: Oracle VM + FastAPI + PostgreSQL.**
- This is a **hosting/backend swap, not a redesign** — the data model and sync
  rules from the Supabase plan stay; only the access/hosting layer changes.

Existing Supabase concepts that still carry over (unchanged):
- `exam_sets`
- `questions`
- `question_progress`
- `quiz_sessions`
- Per-user / per-paper / per-question progress scoping.
- `furthest_question_index` no-regress (monotonic high-water mark) rule.

Main changes from Supabase:
- Add a local `users` table instead of relying on `auth.users`.
- Remove RLS.
- Enforce user ownership inside FastAPI queries (`WHERE user_id = …` from the
  auth token, never the request body).
- Use `fetch()` API calls instead of the Supabase client.

Not done yet:
- No Oracle backend code has been created.
- No PostgreSQL schema for Oracle has been created.
- No app code has been connected to a backend.

## Latest Oracle Schema Checkpoint

- `oracle/schema.sql` has been created.
- Defines the Oracle/PostgreSQL backend schema for:
  - `users`
  - `exam_sets`
  - `questions`
  - `question_progress`
  - `quiz_sessions`
- Replaces Supabase `auth.users` with a **local `users` table** (FKs point at
  `public.users`, never `auth.users`).
- Does **not** use Supabase RLS.
- Keeps the `updated_at` triggers (`set_updated_at`).
- Keeps the `furthest_question_index` no-regress trigger (`guard_furthest_index`).
- **FastAPI must enforce user ownership in queries** (`WHERE user_id = …`) —
  there is no RLS to do it at the DB layer.
- `user_id` must come from the **authenticated server-side context/token**,
  never from the request body.

Not done yet:
- No backend code has been created.
- No Oracle database migration has been run.
- No app code has been connected to the backend.
