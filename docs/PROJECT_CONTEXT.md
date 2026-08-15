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
- Question images live under `public/questions/{exam_set_id}/`.
  - Example: `public/questions/fe-2025-a-public/q03.png`
- 問3: `public/questions/fe-2025-a-public/q03.png`
- 問14: `public/questions/fe-2025-a-public/q14.png`
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

## Latest Oracle Database Checkpoint

- **PostgreSQL 16 installed** on the Oracle VM.
- Database `fe_quiz` created.
- Database user `fe_quiz_app` created and tested.
- PostgreSQL listening **only on `127.0.0.1:5432`** (local-only, not public).
- `oracle/schema.sql` copied to the VM and **run successfully**.

Tables that now exist:
- `users`
- `exam_sets`
- `questions`
- `question_progress`
- `quiz_sessions`

Functions that now exist:
- `set_updated_at`
- `guard_furthest_index`

Triggers that now exist:
- `trg_users_updated_at`
- `trg_exam_sets_updated_at`
- `trg_questions_updated_at`
- `trg_question_progress_updated_at`
- `trg_quiz_sessions_updated_at`
- `trg_quiz_sessions_furthest_guard`

Not done yet:
- No seed data has been imported.
- No FastAPI backend has been created.
- No frontend app code has been connected to the database.

## Latest Oracle Seed/Import Checkpoint

- Node.js and npm installed on the Oracle VM.
- `pg` package installed in a temporary import folder.
- `seed/fe-2025-a-public.json` copied to the VM.
- `scripts/import_seed_oracle.js` copied to the VM and **run successfully**.

Import result:
- Imported exam set: `fe-2025-a-public`
- Questions imported: 20

Database verification passed:
- `exam_sets` contains `fe-2025-a-public`.
- `questions` count is 20.
- 問3 `image_path` is `public/questions/fe-2025-a/q03.png`.
- 問14 `image_path` is `public/questions/fe-2025-a/q14.png`.
- 問3 `correct_answer` is イ.
- 問14 `correct_answer` is エ.

Note:
- `FE_QUIZ_DATABASE_URL` worked for the Node import.
- For `psql` verification, `PGPASSWORD` + flags were safer — special characters
  in the password can break URL parsing.

Not done yet:
- No FastAPI backend has been created.
- No frontend app code has been connected to the backend.
- No user progress rows exist.

## Latest Oracle FastAPI Checkpoint

- Created the Oracle FE Quiz FastAPI backend skeleton:
  - `oracle/backend/main.py`
  - `oracle/backend/requirements.txt`
  - `oracle/backend/.env.example`
- Backend uses **FastAPI + psycopg v3**.
- Database URL read from `FE_QUIZ_DATABASE_URL`; no password hardcoded.
- Backend is **read-only** for now.
- Manual test on the Oracle VM succeeded with `uvicorn` on **port 8010**.

Verified endpoints:
- `GET /api/fe/health` returned `{"ok":true,"database":true}`.
- `GET /api/fe/exam-sets` returned `fe-2025-a-public`.
- `GET /api/fe/exam-sets/fe-2025-a-public/questions` returned the imported
  question JSON.

CORS currently allows:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Not done yet:
- No auth endpoints exist.
- No progress/session endpoints exist.
- No systemd service has been created.
- No nginx config has been created.
- No frontend app code has been connected to the backend.

## Latest Oracle systemd Checkpoint

- FE Quiz FastAPI backend now installed at `/opt/fe-quiz-api`.
- systemd service installed: `fe-quiz-api.service`.
- Service is **enabled and running**.
- Service runs uvicorn: `main:app`, host `127.0.0.1`, port `8010`.
- An existing manual uvicorn process on `0.0.0.0:8010` was killed because it
  blocked systemd from binding the port. **systemd now owns port 8010.**
- Verified listener: `127.0.0.1:8010`.

Verified endpoints through systemd:
- `GET /api/fe/health` returned `{"ok":true,"database":true}`.
- `GET /api/fe/exam-sets` returned `fe-2025-a-public`.

- `/etc/fe-quiz-api.env` stores `FE_QUIZ_DATABASE_URL`.
- PostgreSQL password needed **URL encoding** for the systemd/FastAPI connection.
- Backend remains **local-only**, not publicly exposed.

Not done yet:
- No nginx config has been created.
- No frontend app code has been connected.
- No auth/progress/session endpoints exist.

## Latest Oracle Nginx FE API Checkpoint

- Added an Nginx route on the **port 80 default server**: `/api/fe/`.
- Route proxies to `http://127.0.0.1:8010/api/fe/`.
- The FE Quiz FastAPI service remains bound locally at `127.0.0.1:8010`.
- Nginx config test passed; Nginx reloaded successfully.

Verified through localhost:
- `http://127.0.0.1/api/fe/health` returned `{"ok":true,"database":true}`.
- `http://127.0.0.1/api/fe/exam-sets` returned `fe-2025-a-public`.

Verified through Tailscale IP:
- `http://100.95.39.107/api/fe/health` returned `{"ok":true,"database":true}`.
- `http://100.95.39.107/api/fe/exam-sets` returned `fe-2025-a-public`.

Untouched by this change:
- Existing personal-cloud port `8090` app/files config.
- Existing downloader API/service.
- PostgreSQL remains local-only; port `5432` not exposed.

Not done yet:
- No frontend app code has been connected.
- No auth/progress/session endpoints exist.

## Latest Frontend Deployment Checkpoint

- Frontend files copied to the Oracle Nginx root:
  - `/var/www/html/index.html`
  - `/var/www/html/style.css`
  - `/var/www/html/app.js`
  - `/var/www/html/questions.js`
  - `/var/www/html/public`
- Previous Nginx default index page was backed up.
- Browser test succeeded at `http://100.95.39.107/`.
- App now loads instead of the Nginx welcome page.

Home screen shows:
- FE Quiz Practice
- 令和7年度 基本情報技術者試験 科目A 公開問題
- 20 questions
- Start Practice button

API route remains available through:
- `http://100.95.39.107/api/fe/health`
- `http://100.95.39.107/api/fe/exam-sets/fe-2025-a-public/questions`

- Frontend currently has **read-only** backend loading with `questions.js` fallback.

Not done yet:
- No auth/login/progress sync exists.
- No backend write endpoints exist.

## Latest Backend Progress Endpoints Checkpoint

- Added minimal backend progress endpoints in `oracle/backend/main.py`:
  - `GET /api/fe/progress/{exam_set_id}`
  - `POST /api/fe/progress/{exam_set_id}`

Auth approach for now:
- Client-generated `X-FE-User-Key` header.
- An unknown key creates/uses a `users.username` row.
- `user_id` is **server-derived only**.
- No `user_id` is accepted from the client body.
- Missing `X-FE-User-Key` returns **401**.

Progress saves:
- question `number`
- `selected_answer`
- `submitted`
- `is_correct`
- `current_question_index`
- `furthest_question_index`

Behavior:
- `completed` is **derived** from `furthest_question_index` and `question_count`.
- Writes use **transactions**.
- Existing schema was used **unchanged**.
- `furthest_question_index` no-regress behavior remains protected by the existing
  `guard_furthest_index` trigger (FastAPI also clamps with `GREATEST`).
- CORS now allows **POST**.

Bug fixed:
- `selected_answer` was initially returned as `null` because the API field and the
  model field differed.
- Corrected API field is `selected_answer`.

Verified on Oracle:
- `POST` `selected_answer` `"エ"`.
- `GET` returned `selected_answer` `"エ"`, `submitted` `true`, `is_correct` `true`.

Not done yet:
- No frontend progress sync has been connected yet.
- No password login / JWT / email auth exists yet.

## Latest Frontend Progress Sync Checkpoint

- Frontend now uses the backend progress endpoints:
  - `GET /api/fe/progress/fe-2025-a-public`
  - `POST /api/fe/progress/fe-2025-a-public`
- Frontend sends the `X-FE-User-Key` header.
- The browser generates and stores a local user key in localStorage:
  - `fe-quiz-user-key`
- No login UI was added.
- No email / password / JWT auth was added.

Progress load restores:
- answered question numbers
- `selected_answer`
- `submitted` state
- `is_correct`
- `current_question_index`
- `furthest_question_index`

Progress save:
- Posts **all** submitted answers plus the current/furthest indices after each
  answer submit.
- If sync fails, the app remains usable and shows a non-scary local/fallback
  status (no blocking error).

Browser test passed:
- `GET` progress returned **200**.
- `POST` progress returned **200**.
- After answering and refreshing, progress was restored.
- Restored counts showed answered / correct / incorrect state.
- Sync status showed **Synced**.
- iPhone SE responsive view worked.

Current limitation:
- This is **per-browser sync**, because `X-FE-User-Key` is stored locally.
- True cross-device sync requires a manual shared code or real login later.

## Latest Cross-Device Sync Code Checkpoint

- Added a simple shared **sync code** UI (home screen).
- Frontend stores the sync code in localStorage:
  - `fe-quiz-sync-code`
- If a sync code exists, it is used as the `X-FE-User-Key`.
- If the sync code is missing, the existing generated random local key fallback
  remains:
  - `fe-quiz-user-key`

Sync code validation:
- letters, numbers, hyphen, underscore only
- length 4–40

Behavior:
- The same sync code on desktop and iPhone shares the same backend progress.
- Changing the sync code reloads backend progress for that code and refreshes
  the current UI.
- No backend changes were made.
- No schema changes were made.
- No password / email / JWT login was added.
- Existing fallback / local behavior remains.

Current limitation:
- This is **shared-code sync, not secure real authentication**.
- Anyone with the same code can access the same progress.

## Latest Reload Viewed-Question Bugfix Checkpoint

- Fixed reload restoring **Q1** when the user had navigated to an unanswered later
  question before refreshing.

Root cause:
- Reopen logic used the backend `current_question_index` before the local viewed
  index.
- Backend `current_question_index` only updates after `saveProgress`, which usually
  runs only after answering a question.
- Navigating to Q19 without answering left the backend at Q1 while the local mirror
  already had Q19 — so the stale backend index won and reload returned to Q1.

Fix:
- Reopen index priority is now:
  - local viewed index
  - backend `current_question_index`
  - Q1 fallback
- `render()` mirrors the current viewed index to localStorage on every render, so
  plain navigation (qnav chips / next) to unanswered questions is tracked.
- Back / home now clears **both** the active paper and the active viewed index.

Expected behavior:
- Navigate to Q19 without answering, refresh → app reopens on Q19.
- Navigate to Q6 without answering, refresh → app reopens on Q6.
- Answered state is still restored from backend progress.
- Refresh from home stays on home.

Untouched by this change:
- Backend, schema, progress API, sync code behavior, and UI were not changed.

## Latest Year Selector & Theme Persistence Checkpoint

Home year selector:
- Home now shows a real **year selector** (labelled dropdown), not a single static
  group:
  - Label: **年度を選択 / Select year**
  - Dropdown currently contains: **令和7年度（2025）**
- The selected year drives which section cards are shown.
- **科目A 公開問題** — enabled; starts / resumes normally.
- **科目B 公開問題** — now **enabled**; starts / resumes normally. (Was previously
  disabled / Coming soon — superseded by the 科目B Completion & Live Checkpoint.)

Theme persistence (fixed):
- The previous theme toggle was in-memory only, so reload always reset to light.
- Selected theme is now stored in localStorage as **`fe-quiz-theme`**.
- The saved theme is applied at startup **before** rendering home/practice (no flash,
  no overwrite by render/buildPapers/init).
- Dark mode stays dark after refresh; light mode stays light after refresh.
- Works from both the home and practice screens (toggle lives outside both).

Existing behavior preserved:
- Selected `exam_set_id` flow (questions/progress URLs derived per paper).
- Progress sync (GET/POST).
- Shared sync code.
- Reload restore (viewed-question priority: local mirror → backend → Q1).
- Q6 / Q19 `supplementalHtml` table/SQL layout.
- `questions.js` fallback.
- Backend API question loading.

Untouched by this change:
- Backend, schema, progress API, Nginx, and systemd were not changed.

## Latest Image Path Convention & Deployment Checkpoint

- Question images now use **exam_set_id-based folders**:
  - `public/questions/{exam_set_id}/`
- Current working image folder:
  - `public/questions/fe-2025-a-public/`
- Current images:
  - `public/questions/fe-2025-a-public/q03.png`
  - `public/questions/fe-2025-a-public/q14.png`

Oracle deployment:
- Old deployed Oracle folder was:
  - `/var/www/html/public/questions/fe-2025-a/`
- Renamed on Oracle to:
  - `/var/www/html/public/questions/fe-2025-a-public/`
- Direct browser image test works:
  - `http://100.95.39.107/public/questions/fe-2025-a-public/q03.png`

Source updates:
- `questions.js` and `seed/fe-2025-a-public.json` were updated to use
  `fe-2025-a-public` paths.

Convention going forward:
- For **every** future paper / year / section, create an image folder named
  **exactly like its `exam_set_id`**.
  - Example: `public/questions/fe-2025-b-public/`
  - Example: `public/questions/fe-2024-a-public/`

Troubleshooting:
- If API-loaded images break, check the Oracle DB `questions.image_path` and
  `/var/www/html/public/questions/{exam_set_id}/`.

## Latest 科目B Source Checkpoint

- New branch: `feature/2025-part-b-source`
- Created source markdown: `2025_科目B.md`
- Added **令和7年度 科目B 問1** as source/preparation content.
- Source screenshot path:
  - `public/questions/fe-2025-b-public/2025_part_b_q01.png`
- Q1 is stored as **text + formatted program block + answer table**, not as a
  full-page image.

Q1 content:
- Correct answer: **カ**
- Correct blank values:
  - a = `i を1から3まで1つ増やす`
  - b = `j を tempN から始めて m を超えない範囲で4ずつ増やす`
- Filled: `正解`, `解説`, `翻訳`, `Romaji`, `English`.

Scope (at the time — now superseded by the 科目B Completion & Live Checkpoint):
- 科目B was not yet wired into the app.
- 科目B was disabled / Coming soon on home.
- No `app.js` / `questions.js` / seed / backend / schema changes were made for
  this Q1 source work.

## Latest 科目B Source Completion Checkpoint

- Branch: `feature/2025-part-b-source`
- Source markdown: `2025_科目B.md`
- **令和7年度 科目B 問1〜問6** have been added as source/preparation content.
- All questions are stored as **text + code blocks + markdown/HTML tables**
  where possible, not full-page screenshots.
- Screenshots / crops are stored under:
  - `public/questions/fe-2025-b-public/`

Correct answers:
- 問1: カ
- 問2: ア
- 問3: イ
- 問4: ク
- 問5: カ
- 問6: ク

- 問6 used three crops (at the time):
  - `q06_top_text.png`
  - `q06_tables.png`
  - `q06_answer_choices.png`
  - **Superseded:** 問6 now uses one recreated image `2025_part_b_q06.png` — see
    the 科目B Completion & Live Checkpoint.

Scope (at the time — now superseded by the 科目B Completion & Live Checkpoint):
- 科目B was not yet wired into the app.
- 科目B was disabled / Coming soon on home.
- No seed JSON had been created yet (seed `fe-2025-b-public.json` now exists with
  final explanations).
- No `app.js` / `questions.js` / `index.html` / `style.css` / backend / schema
  changes were made for 科目B source completion.

## Latest 科目B Completion & Live Checkpoint

- **科目B is now enabled in the app** — no longer disabled / Coming soon.
- Exam set ID: `fe-2025-b-public`.
- **6 questions imported into the Oracle PostgreSQL DB.**

Correct answers:
- 問1: カ
- 問2: ア
- 問3: イ
- 問4: ク
- 問5: カ
- 問6: ク

Display:
- 科目B uses **image-first display** from `public/questions/fe-2025-b-public/`.
- Current 科目B image files:
  - `2025_part_b_q01.png`
  - `2025_part_b_q02.png`
  - `2025_part_b_q03.png`
  - `2025_part_b_q04.png`
  - `2025_part_b_q05.png`
  - `2025_part_b_q06.png`
- **問6 now uses one recreated image** (`2025_part_b_q06.png`), not the old
  three-crop `imagePaths` (`q06_top_text.png` / `q06_tables.png` /
  `q06_answer_choices.png`).

Explanations:
- `seed/fe-2025-b-public.json` contains **final manual explanations for 問1〜問6**.
- **No `TODO` remains** in any 科目B explanation.
- Explanation source text files live under `seed/explanations/`:
  - `fe-2025-b-q01.txt`
  - `fe-2025-b-q02.txt`
  - `fe-2025-b-q03.txt`
  - `fe-2025-b-q04.txt`
  - `fe-2025-b-q05.txt`
  - `fe-2025-b-q06.txt`

Import script:
- `scripts/import_seed_oracle.js` now allows **only the exact intentional
  explanation placeholder** (strict TODO rejection otherwise), but 科目B no longer
  has any TODO placeholders.

Live data flow:
- The live app reads from the **Oracle DB / API**, so any `seed/` change requires a
  **re-import** with `scripts/import_seed_oracle.js` to take effect.
- Oracle VM IP remains `100.95.39.107` (Tailscale; PostgreSQL stays local-only,
  port 5432 not exposed).

Manual explanation workflow:
- Write long explanations in `seed/explanations/fe-2025-b-qXX.txt` instead of pasting
  into chat.
- Copy that text into `seed/fe-2025-b-public.json` for the **matching question only**.
- Preserve real paragraph breaks as JSON newlines.
- Final line must use **Japanese option labels**, e.g. `Correct answer: カ`, not
  romanized `ka`.
- After seed changes, copy `seed/fe-2025-b-public.json` to Oracle and **re-import**
  with `import_seed_oracle.js` because the live app reads the Oracle DB / API.
- If an explanation **contradicts the official answer label**, pause and fix the
  source `.txt` first before updating the seed JSON.

## Latest Reset Button & Explanation Readability Checkpoint

Per-paper reset:
- Each **enabled** paper card now has a **Reset progress** button (under
  Start/Resume), with a small confirm before deleting.
- Reset affects **only the selected `exam_set_id`/paper**.
- Reset clears that paper's local in-memory answers and local
  viewed/active-question state.
- Reset **keeps the sync code and theme**.
- Reset **does not affect other papers**.
- After reset, the paper shows fresh/unanswered and starts from 問1.

Backend reset endpoint:
- Added `DELETE /api/fe/progress/{exam_set_id}` in `oracle/backend/main.py`.
- Uses the `X-FE-User-Key` header; `user_id` is **derived server-side only**
  (never from the request body), same as the existing progress endpoints.
- Deletes **only that user's** `question_progress` and `quiz_sessions` rows for
  that `exam_set_id`.
- Deletes the `quiz_sessions` row outright (not zeroed) — the
  `guard_furthest_index` no-regress trigger would block lowering the index, so
  row removal is the clean reset.
- CORS `allow_methods` now includes `DELETE`.
- **No schema change.**

Explanation readability (UI):
- `renderExplanation()` now parses explanation text into **section cards/panels**
  instead of one dense text blob.
- Recognized sections (whole-line label **or** inline `Label: value`):
  - **ELI5**
  - **Technical breakdown**
  - **Wrong answer analysis**
  - **Correct answer**
- Each section renders as its own readable panel with a **badge-style heading**
  and a per-kind accent color (uses existing `--accent-soft` / `--correct-soft` /
  `--wrong-soft` tokens, so light + dark mode both stay readable).
- Inline `Correct answer: X` renders as a clear **answer panel** (larger, bolder).
- Each explanation **line is rendered as its own paragraph** (`<p class="exp-p">`)
  for visible spacing — both blank-line and single-newline breaks separate
  paragraphs.
- Text with **no recognized headings** falls back to plain separated paragraphs.
- **HTML escaping remains safe** (all text run through `escapeHtml`; no unescaped
  raw `innerHTML`).
- Works **generically for 科目A, 科目B, and future papers** — one renderer, no
  per-explanation edits.
- **No seed / explanation text content was changed.**

Deployment notes:
- The reset feature required a **backend redeploy/restart** (`oracle/backend/main.py`
  → VM, `fe-quiz-api.service` restart) **plus a frontend deploy** (`app.js`,
  `style.css` → `/var/www/html/`).
- The explanation UI changes require a **frontend deploy only**.
- The live app still reads from the **Oracle DB / API**.

## Latest Study Hub Phase 1 Checkpoint

Phase 1 of `docs/STUDY_ARCHITECTURE_PRD.md` is implemented as a frontend-only
information-architecture change.

Study Hub:
- Fresh/home state now shows **FE Study** with exactly three top-level categories:
  - **Past Exam Questions / 過去問題** — enabled.
  - **Textbook Practice — Book 1 / テキスト演習 1** — visible, disabled, Coming soon.
  - **Textbook Practice — Book 2 / テキスト演習 2** — visible, disabled, Coming soon.
- No textbook chapters, topics, question counts, progress, questions, or API calls
  were invented.
- The existing sync-code card remains on the Study Hub.

Past Exams:
- The existing year selector and 科目A/科目B paper cards now live on a separate
  **Past Exam Questions** screen.
- `令和7年度（2025）`, `fe-2025-a-public`, and `fe-2025-b-public` are unchanged.
- Existing paper start, answer state, progress sync, and per-paper reset functions
  are reused rather than duplicated.

Navigation:
- Study Hub → Past Exams uses the enabled category action.
- Past Exams → Study Hub uses a compact Back control.
- Past Exams → quiz still goes through the existing `startPaper()` boundary.
- Quiz Back now returns to Past Exams instead of skipping to the Study Hub.
- Screen navigation clears only the active quiz view/index localStorage keys, matching
  previous Back behavior; in-memory and backend answer progress remain intact.
- Refresh with a valid active paper still reopens that quiz/current viewed question.
  Otherwise, the app opens on the Study Hub.

Preserved scope:
- Quiz rendering, options, translation, explanation, submit/verdict, question chips,
  next behavior, images, 科目B supplemental rendering, API adapters, progress payloads,
  sync code, reset implementation, and all existing localStorage key names are unchanged.
- No backend, PostgreSQL schema, seed data, Nginx, or systemd change was made.
- `exam_set_id` remains the generic internal question-set identifier.

Verification:
- Local headless-browser interaction checks passed for Hub → Past Exams → 科目A,
  answer/translation/explanation, Quiz Back, resume, reset, and theme persistence.
- 科目B start, six-option translation, source image, explanation, Back, and resume
  passed using the checked-in 科目B seed as a local API fixture; the backend was not
  modified or deployed.
- Desktop Study Hub visual review passed.
- 320 px Hub, Past Exams, and quiz checks reported no page-level horizontal overflow.
- Light/dark theme application and dark-theme refresh persistence passed.
- No navigation-caused runtime errors were reported by the browser checks.

## Latest Shared Question Contract Phase 2A Checkpoint

Phase 2A of `docs/STUDY_ARCHITECTURE_PRD.md` is implemented without a relational
schema, progress/reset API, localStorage-key, sync, auth, Nginx, or systemd change.

Normalized runtime question model:
- `normalizeQuestion()` is the single boundary for static `questions.js` and API
  question shapes.
- The renderer consumes normalized `id`, display `number`, ordered
  `sourceImages[]`, `optionDisplayMode`, `optionLabels[]`, `structuredOptions[]`,
  `correctAnswerLabel`, `questionTranslation`, `optionTranslationsByLabel`,
  `explanation`, controlled legacy `supplementalHtml`, and `metadata`.
- `image_path`, `imagePath`, and ordered `imagePaths` become
  `{ path, alt, caption }` entries. A singular image becomes a one-item array and
  no image becomes an empty array.
- The original 科目A static source is normalized and retained independently, so
  API source switching cannot overwrite its fallback.

Answer identity and compatibility:
- Explicit option labels in API/seed data are authoritative, preserve authored
  order, and must be non-empty and unique.
- The positional `ア`–`コ` list is now only a legacy fallback for unlabeled static
  `questions.js` options. After normalization, rendering and controller code use
  the question's own labels.
- Correctness compares the selected label with `correctAnswerLabel`.
- Existing progress remains unchanged on the wire: `selected_answer` is still the
  Japanese label. Restore validates that the saved label belongs to the current
  question; save sends the canonical label directly. A temporary numeric in-memory
  value is still accepted as a compatibility fallback.
- Translation cards are rebuilt by `optionTranslationsByLabel[label]`, so their
  labels match the answer controls for 4, 6, 7, and 10-option questions.

Display policy and current content audit:
- Runtime supports `labels-only` and `structured-text` through the same semantic
  button, selection, submit, verdict, progress, Translation, explanation, and
  navigation logic.
- Missing legacy mode defaults safely to `structured-text`.
- `labels-only` hides the duplicate main Japanese transcription and option wording,
  displays substantial label buttons, and uses a four-column desktop/two-column
  narrow grid with existing selected/correct/wrong/locked/focus states.
- Actual image inspection found that 科目A Q3/Q14 are diagrams only and that the
  checked-in 科目B Q1–Q6 images do **not** include their complete answer groups.
  Therefore no current question safely qualifies for `labels-only`.
- 科目B Q1–Q6 are explicitly authored as `optionMode: "structured-text"`; hiding
  their seeded option wording would make them unanswerable. A controlled
  image-complete browser fixture verifies the `labels-only` path without changing
  real question content.
- 科目A Q6/Q19 controlled supplemental HTML and explanation behavior are preserved.

Seed/import/API metadata:
- `scripts/import_seed_oracle.js` validates non-empty unique labels, correct-answer
  membership, recognized `optionMode`, and the presence of an image for
  `labels-only`. `--validate-only` performs these checks without `pg` or DB writes.
- Optional `optionMode` is stored in existing `questions.body` JSONB and returned
  additively by the current question endpoint. PostgreSQL schema is unchanged.
- To make explicit 科目B mode metadata live, deploy the frontend and additive
  `oracle/backend/main.py` adapter, restart the API service, copy the updated B seed,
  and re-import it. Do not run a schema migration.

Verification:
- JavaScript syntax, Python compile, A/B JSON contracts, importer validation, and
  negative importer cases for duplicate/empty labels, bad correct answer, and bad
  mode passed.
- Headless Edge checks passed for 科目A structured options, restored/correct/wrong
  labels, Translation, explanation, Q3/Q14 images, and Q6/Q19 supplemental HTML.
- 科目B checks passed for 4/6/7/10-option label counts and order, correct/wrong
  verdicts, progress POST labels, Translation labels, source images, and restored
  answers.
- A controlled `labels-only` fixture passed duplicate-text removal, ordered
  multi-image rendering, label-only selection/verdict, and retained Translation
  Japanese data.
- Navigation, light-to-dark theme switching, desktop, typical iPhone width, and
  320 px no-page-overflow assertions passed with no runtime console errors.

Phase 2B remains separate:
- Add image loading/error states and the accessible lightbox/zoom behavior.
- Refine Language Help UX and accessibility after real image assets with complete
  embedded answer groups are prepared and individually re-audited for
  `labels-only` eligibility.

## Latest Image Viewer + Language Help + Explanation Phase 2B Checkpoint

Phase 2B of `docs/STUDY_ARCHITECTURE_PRD.md` is implemented as a frontend-only
presentation change. The Phase 2A normalized contract, answer identity, progress
payloads, reset behavior, sync/auth boundary, backend, schema, seeds, and importer
remain unchanged.

Source-image presentation:
- Every normalized `sourceImages[]` entry renders independently and in authored
  order, with a stable loading panel while its image decodes.
- The first image is eager/high-priority; later images retain browser-native lazy
  loading. Successful images expose a native **Enlarge image** button.
- A failed image shows a friendly inline message and **Retry** action. Failure never
  hides or disables answer controls.
- The presentation uses a neutral image canvas in light and dark themes. Source
  pixels are not inverted, filtered, recolored, or upscaled in the question card.

Accessible image viewer:
- Enlarge opens a modal dialog with a restrained backdrop, source alt text, image
  position, and a persistent **Close** button.
- Close button, Escape, and backdrop activation close the viewer. Opening moves
  focus into the dialog; Tab is trapped; closing returns focus to the exact opener.
- Background scrolling is locked while open. The image viewport supports natural
  two-axis scrolling and touch pan/pinch behavior, including narrow screens.
- Multi-image questions keep independent openers and announce `Image N of M`.

Language Help:
- The secondary disclosure is named **🌐 Language Help**, starts collapsed on each
  render, and exposes correct `aria-expanded` / `aria-controls` relationships.
- Content is grouped under **Question** and **Options**, with explicit Japanese
  option labels driving each option's Romaji and English help.
- Japanese source data remains in the normalized model. Its large duplicate help
  rows are visually omitted only when the selected paper declares that its source
  image is the primary Japanese question text (currently 科目B). 科目A diagram-only
  images keep the Japanese help row.

Explanation disclosure policy:
- The existing safe `renderExplanation()` content and section panels are reused.
- Past-exam correct answers show **Review explanation** collapsed by default.
- Past-exam wrong answers show **Understand why** expanded by default.
- A separate UI-only disclosure store remembers the learner's choice when moving
  away from and back to a submitted question. It does not alter answer/progress
  state or wire payloads.
- The declarative context policy includes an expanded-by-default textbook behavior
  for future textbook sets without branching the explanation renderer by source ID.

Verification:
- `node --check app.js`, DOM-ID reference validation, and `git diff --check` passed.
- Headless Edge interaction checks passed for 科目A and 科目B, including all eight
  current source images, light/dark non-inversion, modal open/close paths, Escape,
  focus trap/return, scroll lock, Language Help labeling/mapping, and correct/wrong
  explanation defaults.
- A controlled two-image fixture passed independent opening and source order.
- A controlled missing-image fixture passed loading, friendly error, Retry, and
  answer-control availability.
- 320 px and 390 px embedded viewport runs reported no page-level horizontal
  overflow, and a desktop lightbox screenshot received a visual QA pass.
- No unexpected application runtime errors were reported. No live API, deployment,
  Nginx, systemd, or production check was performed.

Next planned scope is **Textbook Practice — Book 1 / Phase 3**. Phase 2B does not
add textbook content, navigation, progress, or APIs.

## Phase 3A Textbook Book 1 Chapter 1 Practice Set 1 Checkpoint

Phase 3A adds the first real textbook vertical slice without creating another quiz
controller, route family, progress system, or relational catalog.

Catalog and navigation:
- **Textbook Practice — Book 1** is enabled on the Study Hub; Book 2 remains visible
  and unavailable.
- Book 1 opens a declarative catalog screen with overall progress and **Chapter 1**.
- Chapter 1 contains available **Practice Set 1** and unavailable **Practice Set 2 / Coming Soon**.
- Navigation is Study Hub → Book 1 → Chapter 1 → Practice Set 1 → shared quiz, and
  the configured Back destinations reverse that path.
- Only available descendant sets contribute to totals. Book, chapter, and action
  states are derived from submitted question progress: 0 = Start, 1–5 = Continue,
  and 6 = Review. No duplicate progress counters are stored.

Question set and presentation:
- Generic internal ID: `book1-ch01-set01`.
- Seed: `seed/book1-ch01-set01.json`, using the existing A/B envelope and importer.
- Six contiguous internal numbers use generic optional display numbers `1-1` through
  `1-6`; the question header and navigator render those identities. Past Exam display
  numbering is unchanged.
- All six questions are image-first, explicitly `labels-only`, with explicit labels
  `ア`, `イ`, `ウ`, `エ`. Source paths are
  `public/questions/book1/ch01/set01/q01.png` through `q06.png` in printed order.
- Japanese transcriptions remain structured data. Default question/option Japanese
  wording is not duplicated below the image; collapsed Language Help shows Romaji
  and English by explicit label when opened.
- Verified answer key: `1-1 エ`, `1-2 ア`, `1-3 イ`, `1-4 ウ`, `1-5 ア`, `1-6 ア`.
- Every explanation contains ELI5, technical breakdown, analysis for every wrong
  label, and the correct answer. Shared textbook policy expands explanations after
  both correct and wrong submissions. Past Exam correct/wrong defaults are unchanged.

Import/API/storage:
- The generic importer validates optional unique display numbers, non-empty real
  explanations, source paths beneath `public/questions`, and referenced file
  existence. Existing A/B seeds remain valid.
- Optional `displayNumber` is stored additively in the existing `questions.body`
  JSONB and flattened additively by the existing questions endpoint.
- The PostgreSQL schema is unchanged. Progress remains isolated by `exam_set_id`,
  selections remain Japanese labels, and the existing GET/POST/DELETE, resume,
  reset, and sync paths are reused.

Verification:
- JavaScript syntax, Python compile, Book 1/A/B seed validation, content-contract
  assertions, source-file checks, and whitespace checks passed locally.
- Headless Chrome fixture checks passed for catalog/reverse navigation, all six
  display numbers and images, labels-only duplication removal, Language Help label
  mapping, textbook correct/wrong explanation expansion, resume, Start/Continue/Review,
  book/chapter rollups, reset isolation, Past Exam explanation policy, 科目B 4/6/7/10
  option support, lightbox Escape, dark-mode image non-inversion, 320/390/desktop
  overflow, and zero runtime errors.
- No live API, database import, deployment, Nginx, systemd, or production check was performed.

Deployment requires copying the frontend changes and six PNG assets, deploying the
additive FastAPI adapter, copying/importing `seed/book1-ch01-set01.json` with the
existing importer, and restarting the API service. No migration is required.

Next recommended work: **Chapter 1 Practice Set 2 / Phase 3B**.

## Phase 3A Deployment and Live Verification Checkpoint

Phase 3A is complete, committed, pushed, deployed, imported, and manually
live-verified. Commit `f3b24a2` (`feat: add Book 1 chapter 1 practice set`) is on
`feature/2025-part-b-source` and was pushed to
`origin/feature/2025-part-b-source`.

Live product state:
- The Study Hub retains **Past Exam Questions → 2025 → 科目A / 科目B** and now
  exposes **Textbook Practice — Book 1 → Chapter 1 → Practice Set 1**.
- Practice Set 1 contains six questions, with internal contiguous numbers 1–6
  and user-facing display numbers `1-1` through `1-6`.
- **Practice Set 2** and **Textbook Practice — Book 2** remain visible as
  **Coming Soon**. No fake Topic layer or textbook-specific controller was added.
- Navigation and reverse Back navigation use the declarative catalog tree and
  the one shared quiz engine.

Book 1 Chapter 1 Practice Set 1 contract:
- Generic question-set ID and progress-isolation key: `book1-ch01-set01`.
- Seed: `seed/book1-ch01-set01.json`; title:
  **Book 1 — Chapter 1 — Practice Set 1**; `question_count`: 6.
- Generic optional `displayNumber` supplies textbook numbering without hard-coded
  Book 1 logic. Past Exam numbering remains unchanged.
- All six questions explicitly use `optionMode: "labels-only"` and labels `ア`,
  `イ`, `ウ`, `エ`. Each source image contains the full Japanese question and
  answer choices, so that wording is not duplicated beneath the image.
- Verified answer key: `1-1 エ`, `1-2 ア`, `1-3 イ`, `1-4 ウ`, `1-5 ア`,
  `1-6 ア` (compact: `エ ア イ ウ ア ア`).
- Every question has real Japanese transcription, Romaji, English, explicit
  Japanese option labels, option translations, correct answer, ELI5 explanation,
  technical breakdown, wrong-answer analysis, and correct-answer section. No
  placeholder explanation is used.

Source-image record:
- `public/questions/book1/ch01/set01/q01.png` through `q06.png` map in order to
  Problems `1-1` through `1-6`.
- Preparation uploads arrived in reverse order; the printed question number in
  each image was treated as authoritative rather than upload order or timestamp.
- The PNGs were not modified, regenerated, recompressed, or cropped.
- All six files are deployed beneath the live Nginx web root and each returned
  HTTP 200.

Shared presentation behavior:
- The shared Phase 2B image renderer provides loading/error states, Retry,
  responsive fitting, dark-theme-safe presentation, and the accessible lightbox
  with Escape/backdrop close, focus trap/restoration, and scroll lock. No separate
  textbook image viewer exists.
- Language Help begins collapsed. Japanese transcription remains in structured
  data; Romaji, English, and translations keyed by explicit Japanese option labels
  appear dynamically. Correct-answer information stays hidden until Submit.
- Shared quiz-context policy expands textbook explanations after either correct or
  wrong submissions. Past Exam policy remains unchanged: correct answers default
  collapsed under **Review explanation**; wrong answers default expanded under
  **Understand why**. No second explanation renderer exists.

Progress, resume, reset, and sync:
- The existing generic GET/POST/DELETE routes under
  `/api/fe/progress/{exam_set_id}` are reused with `X-FE-User-Key` and existing
  localStorage/sync behavior.
- Book and chapter progress is derived from submitted question progress. Practice
  Set 2 contributes zero while unavailable: 0 submitted = Start, 1–5 = Continue,
  and 6 = Review/completed.
- Reset is scoped to `book1-ch01-set01`; Past Exam 科目A/科目B progress is not
  affected.

Importer, API, and storage:
- The same generic importer, `scripts/import_seed_oracle.js`, is reused. It now
  validates optional non-empty unique `displayNumber` values, the source-image
  requirement for `labels-only`, paths beneath `public/questions`, physical file
  existence, non-empty/non-placeholder explanations outside the intentional
  legacy exception, and existing option-label/correct-answer rules.
- `displayNumber` is stored in the existing JSON body. The small additive adapter
  change in `oracle/backend/main.py` passes it through the existing generic route
  `GET /api/fe/exam-sets/{exam_set_id}/questions`; no Book/Textbook API was added.
- The production endpoint `/api/fe/exam-sets/book1-ch01-set01/questions` returned
  all six questions with display numbers `1-1`–`1-6`, `labels-only`, and labels
  `['ア','イ','ウ','エ']`.

Oracle production deployment:
- Repository: `/home/ubuntu/fe-quiz-src`, checked out at
  `feature/2025-part-b-source`, deployed commit `f3b24a2`.
- Frontend root: `/var/www/html`; backend: `/opt/fe-quiz-api/main.py`; systemd
  service: `fe-quiz-api.service`; FastAPI bind: `127.0.0.1:8010`.
- Deployment included `app.js`, `index.html`, `style.css`, the additive backend
  adapter, `q01.png` through `q06.png`, and the Book 1 seed import. Backend restart
  succeeded.
- Image validation requires repository-root-relative files, so validation/import
  ran from `/home/ubuntu/fe-quiz-src`, using the existing PostgreSQL module at
  `/home/ubuntu/fe-quiz-import/node_modules`:

  ```sh
  NODE_PATH=/home/ubuntu/fe-quiz-import/node_modules \
  node scripts/import_seed_oracle.js seed/book1-ch01-set01.json
  ```

- Import succeeded with `Imported exam set: book1-ch01-set01` and
  `Questions imported: 6`.
- API health passed directly and through Nginx at
  `http://127.0.0.1:8010/api/fe/health` and
  `http://127.0.0.1/api/fe/health`, returning
  `{"ok":true,"database":true}`.

Guardrails and regression state:
- PostgreSQL schema, Nginx configuration, systemd configuration, authentication,
  sync identity, and progress contract are unchanged. No migration, table,
  relational column, or route family was added; `exam_set_id` remains the generic
  internal question-set identifier.
- Existing 2025 科目A/科目B and shared Study Hub, navigation, Submit/Next/Back,
  progress/resume/reset/sync, theme, Language Help, lightbox, supplemental content,
  arbitrary option counts, explicit labels, explanation behavior, API loading,
  and Paper A fallback remain intact.
- Local/headless Phase 3A checks passed before deployment. Live Book 1 behavior was
  manually checked and reported working correctly.

Current architecture is proven for both official Past Exam content and image-first
textbook content while retaining one shared quiz engine. Future work must not add
separate Book 1 or Book 2 controllers.

Next recommended milestone: **Chapter 1 → Practice Set 2**. Obtain and map its real
source images by printed question number under
`public/questions/book1/ch01/set02/`, create generic set ID
`book1-ch01-set02`, author complete language/answer/explanation data, reuse the
shared importer and quiz engine, and enable the existing catalog node. Book 1 and
Chapter 1 progress should then aggregate both available sets. Do not redesign the
architecture unless real Set 2 content exposes a genuine limitation.

## Phase 3B Book 1 Chapter 1 Practice Set 2 Deployment and Live Verification Checkpoint

Phase 3B is complete, committed, pushed, deployed, imported, and live-verified.
The source branch is `feature/2025-part-b-source`; implementation commit
`c46accb424bc60decbd3aa13497a5d3b14e2277b` has subject
`feat: add Book 1 chapter 1 practice set 2`.

Practice Set 2 contract:
- Generic `exam_set_id`: `book1-ch01-set02`.
- Seed: `seed/book1-ch01-set02.json`; question count: 2.
- Source images:
  `public/questions/book1/ch01/set02/q01.png` and `q02.png`.
- Printed-number mapping is authoritative: `q01.png` = `1-7`; `q02.png` =
  `1-8`. Internal numbers 1 and 2 use display numbers `1-7` and `1-8`.
- Both questions are image-first `labels-only`, with explicit labels `ア`, `イ`,
  `ウ`, `エ`. Their complete Japanese question/options remain in the source
  images; structured Japanese, Romaji, English, and explicit-label Language Help
  data remain available through the shared contract.
- Verified answer key: `1-7 ウ`; `1-8 ア`. Textbook explanations reuse the shared
  renderer and textbook policy.

Catalog, navigation, and progress:
- The existing Practice Set 2 **Coming Soon** node was converted in place to an
  available generic question-set node; no duplicate node was created.
- Navigation is Study Hub → Textbook Practice — Book 1 → Chapter 1 → Practice
  Set 2 → shared quiz engine. Back navigation remains declarative; no fake Topic
  layer was added.
- Set IDs are `book1-ch01-set01` and `book1-ch01-set02`.
- Available totals are Set 1 = 6, Set 2 = 2, Chapter 1 = 8, and Book 1 = 8.
  Book/chapter totals remain derived from descendant submitted-question progress;
  no duplicate progress counter is stored.

Local verification before deployment:
- Local/headless checks passed for catalog navigation, no duplicate Set 2 node,
  0/8 through 8/8 rollups, Set 2 Start/Continue/Review states, display numbers,
  image mapping/order, labels-only, Language Help explicit-label mapping,
  correct/wrong submissions, Japanese-label progress POSTs, resume, reset
  isolation, reverse navigation, textbook explanation expansion, Past Exam policy,
  lightbox, dark image behavior, 320/390/desktop overflow, 科目A/科目B regressions,
  and zero unexpected runtime errors.
- Generic validation passed for `book1-ch01-set02` (2), `book1-ch01-set01` (6),
  `fe-2025-a-public` (20), and `fe-2025-b-public` (6). `node --check app.js` and
  `git diff --check` passed before commit.

Oracle production deployment and validation:
- Production source repository: `/home/ubuntu/fe-quiz-src`, branch
  `feature/2025-part-b-source`. It was clean at prior commit `f3b24a2`; after
  `git fetch origin` and `git pull --ff-only origin feature/2025-part-b-source`,
  HEAD became `c46accb`. This update also included the earlier Phase 3A
  documentation commit `245d8e6`.
- From `/home/ubuntu/fe-quiz-src`, validation-only returned
  `Validated seed: book1-ch01-set02 (2 questions)`.
- `q01.png` was verified as a readable 1021 × 337 RGBA PNG; `q02.png` as a
  readable 1017 × 257 RGBA PNG.
- Only `app.js` was copied to `/var/www/html/app.js`. The Set 2 image directory
  `/var/www/html/public/questions/book1/ch01/set02/` was created and received
  `q01.png` and `q02.png`. Repository and deployed SHA-256 hashes matched for all
  three files. Images were not modified, cropped, regenerated, resized, or
  recompressed.

Database and live API:
- Existing generic importer was reused, with the database URL loaded from
  `/etc/fe-quiz-api.env` and no credentials exposed:

  ```sh
  NODE_PATH=/home/ubuntu/fe-quiz-import/node_modules \
  node scripts/import_seed_oracle.js seed/book1-ch01-set02.json
  ```

- Import returned `Imported exam set: book1-ch01-set02` and
  `Questions imported: 2`. Set 1, 科目A, and 科目B required no re-import.
- Nginx health endpoint `GET /api/fe/health` returned
  `{"ok":true,"database":true}`.
- `GET /api/fe/exam-sets/book1-ch01-set02/questions` returned exactly two
  questions. Live contract confirmed `1-7` / internal 1 / `labels-only` /
  labels `ア` `イ` `ウ` `エ` / correct `ウ` / `q01.png`, and `1-8` / internal 2 /
  `labels-only` / same labels / correct `ア` / `q02.png`.
- Both live Nginx image URLs returned HTTP 200 with `Content-Type: image/png`.

Live browser verification:
- At `http://100.95.39.107/`, manual browser verification passed for FE Study →
  Textbook Practice — Book 1 → Chapter 1 → Practice Set 2.
- Practice Set 2 opened through the shared quiz engine. Both display numbers,
  source images, labels-only controls, Language Help, correct-answer behavior,
  explanations, and image-first presentation worked. The live Set 2 experience
  was manually reported working correctly.

Architecture and guardrails unchanged:
- No backend change or FastAPI restart was needed. No PostgreSQL schema migration,
  Nginx/systemd configuration change, API route family, progress model,
  authentication/sync change, Book 1-specific controller, or second renderer was
  introduced.
- `exam_set_id` remains the generic question-set identity. The shared quiz engine,
  normalizer, image viewer/lightbox, labels-only mode, Language Help, explanation
  renderer, progress, resume, reset, sync, and theme are reused. Practice Set 1
  and existing Past Exam content remain unchanged.

Current product state: Book 1 Chapter 1 provides Practice Set 1 (`1-1` through
`1-6`) and Practice Set 2 (`1-7` through `1-8`), for eight available questions.
Future textbook work starts with source overview/images, authoritative printed
question count/number mapping, then implementation; do not redesign this shared
architecture.

## Phase 3C Book 1 Chapter 2 Practice Set 1 Deployment and Live Verification Checkpoint

Book 1 Chapter 2 Practice Set 1 is complete, committed, pushed, deployed,
imported, and live-verified. The source branch is
`feature/2025-part-b-source`; implementation commit
`fb43c838faf31aa68fb3c3e2a40220065b4851d5` has subject
`feat: add Book 1 chapter 2 practice set 1`.

Practice Set 1 contract:
- Generic `exam_set_id`: `book1-ch02-set01`.
- Seed: `seed/book1-ch02-set01.json`; question count: 3.
- Source images: `public/questions/book1/ch02/set01/q01.png`, `q02.png`, and
  `q03.png`.
- Printed-number mapping is authoritative: `2-1` → `q01.png` → correct `イ`;
  `2-2` → `q02.png` → correct `ウ`; `2-3` → `q03.png` → correct `ウ`.
- All three questions are image-first `labels-only`, with explicit labels `ア`,
  `イ`, `ウ`, `エ`. They reuse the shared Language Help, explanation, progress,
  resume, reset, sync, and generic `exam_set_id` contracts.

Catalog, navigation, and progress:
- Chapter 2 did not previously exist. It was added declaratively as collection
  `book1-ch02`, with generic question-set node `book1-ch02-set01`; no
  chapter-specific controller, renderer, or API family was added.
- Book 1 children remain explicitly ordered: Chapter 1, then Chapter 2.
- Available totals are Chapter 1 = 8, Chapter 2 = 3, and Book 1 = 11.
  Chapter/book progress remains derived by descendant aggregation from submitted
  question progress, with no duplicate progress counters.

Local implementation and regression verification:
- Generic seed validation passed for `book1-ch02-set01` (3),
  `book1-ch01-set01` (6), `book1-ch01-set02` (2), `fe-2025-a-public` (20),
  and `fe-2025-b-public` (6). `node --check app.js` and `git diff --check`
  passed before commit.
- Headless regression checks passed for catalog navigation and chapter ordering;
  Chapter 1 and Book 1 rollups including `8/11` through `11/11`; Start,
  Continue, and Review states; shared-engine loading; authoritative display
  numbers, answer keys, and image mappings; labels-only controls; Language Help;
  correct/wrong submissions; Japanese-label progress POSTs; resume; per-set reset
  isolation; Chapter 1, 科目A, and 科目B regressions; explanation and Past Exam
  policies; lightbox; dark mode; 320/390/desktop responsive overflow; and zero
  unexpected runtime errors.

Oracle production deployment and validation:
- Production source repository: `/home/ubuntu/fe-quiz-src`, branch
  `feature/2025-part-b-source`. A clean fast-forward pull advanced HEAD from
  `c46accb` to `fb43c83`; the pull also included documentation commit `49cd390`,
  subject `docs: record Phase 3B live deployment checkpoint`.
- Production frontend root is `/var/www/html`; backend source remains
  `/opt/fe-quiz-api/main.py`; service remains `fe-quiz-api.service`; FastAPI
  remains bound to `127.0.0.1:8010`; Nginx continues proxying `/api/fe/`.
  No backend change or service restart was performed.
- Oracle-side seed validation passed for `book1-ch02-set01` (3 questions), all
  three source images were confirmed as readable PNG files, and
  `node --check app.js` passed.
- Deployment copied only `app.js` and the three Chapter 2 question images to the
  production frontend tree. Repository and deployed SHA-256 values matched:
  - `app.js`: `e9699e8b1db683b7f72030de4492bbe3e38ba258af2ecdb17f31766e862d1a54`
  - `q01.png`: `4ce03acad5d3facae1ec971202157eadf941a23ff0593720fb80224ce4e9e236`
  - `q02.png`: `c3503e396138812e94790a40944b2909d3029c7f5dc5ff1c44eeb2f422b86d36`
  - `q03.png`: `aa09a57ab72f44c8fd64f494a0f490fe4e6599cd7113a5b07d0471dbbb39e7a6`

Database and live API:
- The existing generic importer was reused unchanged. Import returned
  `Imported exam set: book1-ch02-set01` and `Questions imported: 3`.
- Both direct FastAPI and Nginx health endpoints passed with
  `{"ok":true,"database":true}`.
- The live generic set API returned exactly three questions with the expected
  `2-1`/`2-2`/`2-3` display numbers, image mappings, `labels-only` modes,
  explicit labels, and `イ`/`ウ`/`ウ` correct answers. All three live image URLs
  returned HTTP 200.

Live browser verification:
- At `http://100.95.39.107/`, Book 1 showed Chapter 1 followed by Chapter 2;
  Chapter 2 Practice Set 1 opened through the shared quiz engine with the
  expected rollups and question behavior.
- Manual live verification passed, and the user confirmed that it “works fine.”

Whole-chapter authoring and deployment process:
- Starting with the next chapter, batch work at whole-chapter scope: collect
  overview references; collect every question image for all sets; determine the
  full chapter structure and counts; map authoritative printed question numbers;
  author all seeds; validate all sets; integrate the catalog declaratively; run
  regression checks once for the whole chapter; make one commit and push; perform
  one Oracle deployment/import/live verification; then write one final docs
  checkpoint.
- Practice sets remain independent generic `exam_set_id` units. Whole-chapter
  batching is an operational workflow only and does not collapse separate sets.

Architecture guardrails remain unchanged:
- Reuse the shared quiz engine and generic `exam_set_id`; preserve image-first
  presentation and authoritative printed numbering; use explicit answer labels;
  use `labels-only` when complete choices are present in the source image; and
  reuse shared Language Help and explanations.
- Preserve generic question-level progress, per-set reset isolation, and
  descendant chapter/book aggregation. Do not add chapter-specific controllers
  or renderers, a Book API family, or a schema redesign without a demonstrated
  need.

Next milestone: Book 1 → next chapter, using whole-chapter batching. Do not guess
the number of sets, question counts, or printed-number structure until the source
overview and images have been collected and authoritatively mapped.

## Phase 3D Book 1 Chapter 2 Complete Deployment and Live Verification Checkpoint

This is the current Chapter 2 checkpoint. It supersedes the current-state portion
of the earlier Phase 3C checkpoint, which remains an accurate historical record
of the original Practice Set 1-only deployment.

Chapter 2 completion is committed, pushed, deployed, imported, and live-verified.
The source branch is `feature/2025-part-b-source`; implementation commit
`2989557dbffd1ad8c808d30d817e68b2cf4ed6c4` has subject
`feat: complete Book 1 chapter 2 practice sets`.

Final Chapter 2 content:
- Four independent generic question sets are available:
  `book1-ch02-set01` (3), `book1-ch02-set02` (4),
  `book1-ch02-set03` (3), and `book1-ch02-set04` (5).
- Printed-number mapping remains authoritative. The complete answer key is:
  `2-1 イ`, `2-2 ウ`, `2-3 ウ`; `2-4 ア`, `2-5 イ`, `2-6 ウ`, `2-7 ウ`;
  `2-8 イ`, `2-9 ウ`, `2-10 ウ`; `2-11 ア`, `2-12 ウ`, `2-13 ウ`,
  `2-14 ウ`, `2-15 エ`.
- Set 2 seed is `seed/book1-ch02-set02.json`; Set 3 seed is
  `seed/book1-ch02-set03.json`; Set 4 seed is
  `seed/book1-ch02-set04.json`.
- Image folders are `public/questions/book1/ch02/set01/` (q01–q03),
  `set02/` (q01–q04), `set03/` (q01–q03), and `set04/` (q01–q05).
  Source images were neither rewritten nor remapped after the authoritative
  printed-number intake gate.

Catalog, navigation, and progress:
- The existing `book1-ch02` collection was reused. Its children are exactly, in
  order: `book1-ch02-set01`, `book1-ch02-set02`, `book1-ch02-set03`,
  `book1-ch02-set04`.
- Sets 2–4 use the same declarative generic set contract as Set 1. No duplicate
  Chapter 2 or Practice Set node was created.
- Chapter 1 remains 8 questions. Chapter 2 is 3 + 4 + 3 + 5 = 15 questions.
  Book 1 is 8 + 15 = 23 questions.
- Chapter and Book totals remain descendant-set aggregations from submitted
  question progress; no separate Chapter 2 or Book 1 progress counter exists.
  Every set remains an independent progress, resume, and reset unit.

Content and architecture contract:
- All 15 Chapter 2 questions are image-first `labels-only`, with explicit
  `ア` / `イ` / `ウ` / `エ` labels. The source image is the authoritative visible
  Japanese question/options; complete Japanese, Romaji, and English remain
  available through shared Language Help and explicit-label mapping.
- The shared quiz engine, source-image loader/lightbox, labels-only selector,
  answer checker, textbook explanation renderer, navigator, generic progress
  GET/POST/DELETE, resume, reset, sync, and theme are reused unchanged.
- No Chapter 2-specific controller, renderer, loader, API route, schema, progress
  model, importer, or Book-specific quiz behavior was introduced.

Local validation before deployment:
- Generic validation passed for `book1-ch02-set01` (3), `book1-ch02-set02` (4),
  `book1-ch02-set03` (3), `book1-ch02-set04` (5), `book1-ch01-set01` (6),
  `book1-ch01-set02` (2), `fe-2025-a-public` (20), and `fe-2025-b-public` (6).
  `node --check app.js` and `git diff --check` passed.
- Headless/local regressions passed for chapter/set ordering and uniqueness;
  Chapter 1 = 8, Chapter 2 = 15, and Book 1 = 23 rollups; Start/Continue/Review
  boundaries; the shared engine and all 15 Chapter 2 questions; labels-only,
  image and answer mappings, Language Help, correct/wrong submissions,
  Japanese-label progress POSTs, resume, reset isolation, Chapter 1, 科目A, 科目B,
  textbook and Past Exam explanation policies, navigation, lightbox, dark mode,
  and zero unexpected runtime errors.
- Real Chrome checks passed at 320 px, 390 px, and 1280 px with no page-level
  horizontal overflow. Dark mode did not invert source images, and lightbox
  behavior passed.

Oracle production deployment:
- Production source repository is `/home/ubuntu/fe-quiz-src` on
  `feature/2025-part-b-source`. Before deployment it was at `fb43c83`
  (`feat: add Book 1 chapter 2 practice set 1`); fetch identified intervening
  documentation commit `fd786e9` (`docs: record Phase 3C live deployment
  checkpoint`) and implementation commit `2989557`. Oracle was fast-forwarded to
  `2989557`.
- Production frontend root is `/var/www/html`; backend remains
  `/opt/fe-quiz-api/main.py`; service remains `fe-quiz-api.service`; FastAPI
  remains bound to `127.0.0.1:8010`. No backend restart was required.
- Oracle validation passed for all four Chapter 2 seeds, all 12 newly-added PNGs
  were present, and `node --check app.js` passed.
- Deployed runtime files were `app.js` plus Set 2 q01–q04, Set 3 q01–q03, and
  Set 4 q01–q05 under `/var/www/html/public/questions/book1/ch02/`.
  Repository/deployed binary comparison passed for `app.js` and all 12 PNGs.
- Verified SHA-256 hashes, each matching its deployed copy:
  - Set 2: q01 `8140289d2e210fe21bc60ce7e16a050ac6e9b63d712e752fc82523dd069f2f75`;
    q02 `e31f06944fd8a49e23c84059d883e88d7a1cc7d57cc13c59259da15fa10f9b62`;
    q03 `3f189187e909b558c8fa0c33f38baa5979590a68bd5d7121c7d82d6a5f2e90e4`;
    q04 `13b26cc6b76fd9f521c804305216941f482af46588871a8b0398d44907686052`.
  - Set 3: q01 `a060ab046d0843a1a8d341958c66b89f6bc405c4d995c6088ee1ec85fcb00360`;
    q02 `93dfc3fb1b002dc53dd9fcc0a8a2db365df1c71f83022243745ce251f6846770`;
    q03 `103be30b435d3c762e32620ec81395951ae3169dc796cfd09f87273819cd82dc`.
  - Set 4: q01 `604bf0786daf34f65e772241d2440d9b6d8e06a6a1b188a0ff513383f09d7795`;
    q02 `4fdefb24de97953dfb25681ff8bcf56ab8fee052fced28deb587f1b90450faf3`;
    q03 `96dfe6852d6d139b095550b96b8001de8d0d939658367527541a55e7a30e4575`;
    q04 `bf1dc8ade951902667bd8bb62b7972f18e9868f5a40694d5eb4659ee5c05f184`;
    q05 `27c40e202855542a409078f4f377c3f91613276a9c0e549351a2f5d1a68865f8`.

Database, API, and live browser verification:
- The existing generic importer was reused unchanged. It imported
  `book1-ch02-set02` (4 questions), `book1-ch02-set03` (3 questions), and
  `book1-ch02-set04` (5 questions). Set 1 already existed in production.
- Both health endpoints, `127.0.0.1:8010/api/fe/health` and
  `127.0.0.1/api/fe/health`, returned `{"ok":true,"database":true}`.
- The production generic question API returned each Chapter 2 set at the expected
  count, display-number/image mapping, `labels-only` mode, explicit labels, and
  answer key listed above. All 12 newly-deployed image URLs returned HTTP 200.
- At `http://100.95.39.107/`, manual verification passed for Study Hub →
  Textbook Practice — Book 1 → Chapter 2. The chapter shows all four Practice
  Sets, and all question images and quiz flows work. The user confirmed:
  “all working properly.” Chapter 2 is complete and live.

Whole-chapter workflow decision:
- Future textbook chapters are processed as one chapter-completion batch:
  1. Create every Practice Set image folder.
  2. Copy all source images for every set.
  3. Run one complete source inventory/mapping gate.
  4. Confirm every printed question number and per-set count.
  5. Author all chapter seeds in one batch.
  6. Validate every completed set.
  7. Integrate all chapter/set catalog nodes in one step.
  8. Run one full chapter regression cycle.
  9. Make one implementation commit and push.
  10. Perform one Oracle pull/deployment.
  11. Deploy all chapter images together.
  12. Import all new generic exam sets together.
  13. Run complete API and live-browser verification.
  14. Add one final documentation checkpoint.
- This batches operations only. It does not merge Practice Sets: each retains its
  own generic `exam_set_id`, progress, resume, reset, and generic API behavior.

Next milestone: Chapter 2 is closed. Continue with Textbook Practice — Book 1 →
Chapter 3 using whole-chapter batching. Do not infer Practice Set count, question
count, printed ranges, or source mappings until Chapter 3 source images are
supplied and verified.

Guardrails remain: one shared quiz engine; generic `exam_set_id`; image-first
textbook content; authoritative printed question numbers; `labels-only` when the
image contains complete options; explicit Japanese labels; label-mapped Language
Help; shared explanations; generic progress API; per-set reset isolation;
descendant aggregation; no chapter-specific controller, Book-specific renderer,
new API family, or schema redesign without an actual content need.

## Phase 3E Book 1 Chapter 3 Complete Deployment and Live Verification Checkpoint

Chapter 3 implementation is deployed and its current seed content is imported in
production. Final browser verification after the explanation-quality rewrite is
**COMPLETE / PASSED**. The user manually verified the production site and
confirmed: “all working.” Chapter 3 is fully deployed, live-verified, and CLOSED.

Whole-chapter batching remains the required textbook workflow:

1. Collect all source images for the chapter.
2. Inventory every image and map every printed question number.
3. Author every Practice Set seed in the chapter.
4. Integrate the catalog once.
5. Validate and regression-test the whole chapter.
6. Make one implementation commit/push.
7. Perform one Oracle deployment/import cycle.
8. Complete one live verification.
9. Add one documentation checkpoint.

This is operational batching only. Practice Sets remain independent generic
`exam_set_id` values with isolated progress, resume, and reset behavior. Large
chapters may require multiple local authoring continuation passes, but partial
sets must not be committed, pushed, imported, or deployed separately unless the
user explicitly requests a different workflow.

Chapter 3 structure and totals:

- Parent: Textbook Practice — Book 1 → Chapter 3.
- Chapter ID: `book1-ch03`.
- `book1-ch03-set01`: 5 questions, display numbers 3-1 through 3-5.
- `book1-ch03-set02`: 4 questions, display numbers 3-6 through 3-9.
- `book1-ch03-set03`: 5 questions, display numbers 3-10 through 3-14.
- `book1-ch03-set04`: 8 questions, display numbers 3-15 through 3-22.
- Chapter 3 total: 22 questions.
- Chapter 1 total: 8; Chapter 2 total: 15; Book 1 total: 45.
- Chapter and Book totals remain descendant-derived through the generic catalog
  and progress architecture.

Catalog order:

- Book 1 children: `book1-ch01`, `book1-ch02`, `book1-ch03`.
- Chapter 3 children: `book1-ch03-set01`, `book1-ch03-set02`,
  `book1-ch03-set03`, `book1-ch03-set04`.
- No Chapter 3-specific controller, renderer, API, schema, importer, or backend
  logic was added.

Authoritative image mapping under `public/questions/book1/ch03/`:

- Set 1: `set01/q01.png` → 3-1; `q02.png` → 3-2; `q03.png` → 3-3;
  `q04.png` → 3-4; `q05.png` → 3-5.
- Set 2: `set02/q01.png` → 3-6; `q02.png` → 3-7; `q03.png` → 3-8;
  `q04.png` → 3-9.
- Set 3: `set03/q01.png` → 3-10; `q02.png` → 3-11; `q03.png` → 3-12;
  `q04.png` → 3-13; `q05.png` → 3-14.
- Set 4: `set04/q01.png` → 3-15; `q02.png` → 3-16; `q03.png` → 3-17;
  `q04.png` → 3-18; `q05.png` → 3-19; `q06.png` → 3-20;
  `q07.png` → 3-21; `q08.png` → 3-22.
- All 22 source images remain authoritative and unchanged.
- All 22 questions use `optionMode: "labels-only"` with explicit Japanese
  option identities ア, イ, ウ, エ.

Confirmed answer key:

- Set 1: 3-1 ウ; 3-2 ウ; 3-3 ア; 3-4 エ; 3-5 イ.
- Set 2: 3-6 ア; 3-7 イ; 3-8 イ; 3-9 イ.
- Set 3: 3-10 ウ; 3-11 ウ; 3-12 イ; 3-13 ア; 3-14 ウ.
- Set 4: 3-15 イ; 3-16 エ; 3-17 ア; 3-18 ウ; 3-19 ア;
  3-20 イ; 3-21 イ; 3-22 ア.

Implementation history:

- `4a5000d3cf8c9bc7ab67fbd852782822028d5eed` —
  `feat: add Book 1 chapter 3 practice sets`.
  Changed `app.js`, four Chapter 3 seed JSONs, and 22 Chapter 3 PNGs: 27
  files total.
- `e65c2f722bbf66ce3bb3b26b53a9241c469a6daa` —
  `fix: complete Chapter 3 language help romaji`.
  Changed only `seed/book1-ch03-set01.json`. Question 3-2 now includes the
  complete ENQ/DEQ sequence in Romaji: ENQ 1, ENQ 2, ENQ 3, DEQ, ENQ 4,
  ENQ 5, DEQ, ENQ 6, DEQ, DEQ. The cleaned commit was one insertion and one
  deletion, with no question, answer, image, or catalog changes.
- `d26693fae36b296a63f4a82360fa67be9ff70d78` —
  `fix: improve Chapter 3 explanations`.
  Rewrote all 22 explanation fields: Set 1 5/5, Set 2 4/4, Set 3 5/5,
  Set 4 8/8. Only the four Chapter 3 seed JSONs changed; diff was 22
  insertions and 22 deletions.

Explanation-quality standard established by `d26693f`:

- Every explanation retains, in order: `ELI5:`, `Technical breakdown:`,
  `Japanese keywords to remember:`, `Why the best solution works:`,
  `Wrong answer analysis:`, `Memory trick:`, and `Correct answer: X`.
- ELI5 content must teach a beginner, technical breakdowns must show FE
  reasoning step by step, and Japanese keywords use
  `Japanese = romaji = English`.
- Each of the three incorrect choices is analyzed separately by label.
- The learner should understand the concept, derive the answer, recognize why
  every other choice fails, and solve a similar future FE question.
- For future textbook chapters, apply this quality standard during initial
  authoring. Do not accept an explanation merely because it contains the required
  headings; “Understand why” must genuinely teach the concept, step-by-step FE
  reasoning, useful Japanese keywords, why the correct solution works, each wrong
  option separately, and a useful memory trick.
- Audit complete Romaji during initial authoring too. Do not omit operation
  sequences, formulas, conditions, or definitions, and never use placeholder
  `...` to represent omitted source text.
- The rewrite did not alter answers, JP, Romaji, English, options, labels,
  `optionMode`, image mappings, application code, images, backend, schema, or
  importer. All four seeds validated at 5 / 4 / 5 / 8 and
  `git diff --check` passed.

Initial Oracle deployment and validation:

- Production source repository: `/home/ubuntu/fe-quiz-src` on
  `feature/2025-part-b-source`.
- The pre-Chapter 3 production base was `2989557` (`feat: complete Book 1
  chapter 2 practice sets`). Oracle used `git pull --ff-only`, with no merge,
  and advanced through `38eeb66`, `4a5000d`, and `e65c2f7`.
- All Chapter 3 seeds validated on Oracle: Set 1 = 5, Set 2 = 4,
  Set 3 = 5, Set 4 = 8. `node --check app.js` and `git diff --check` passed.
- Runtime deployment copied only `app.js` and all 22 files under
  `public/questions/book1/ch03/`. Source/runtime `app.js` comparison passed,
  source and deployed image counts were both 22, and every image comparison
  was byte-for-byte OK.
- No backend deployment or restart, schema change, Nginx change, or systemd
  change was required.

Initial database import and production verification:

- The existing generic Oracle importer imported all four sets together:
  5 + 4 + 5 + 8 = 22 questions.
- Direct backend health at `http://127.0.0.1:8010/api/fe/health` and Nginx
  health at `http://127.0.0.1/api/fe/health` both returned
  `{"ok":true,"database":true}`.
- All four generic Chapter 3 question endpoints returned HTTP 200 with counts
  5 / 4 / 5 / 8 and the complete display sequence 3-1 through 3-22.
- All 22 Chapter 3 source-image URLs returned HTTP 200 (`BAD=0`). Production
  `app.js` returned HTTP 200.

Explanation-fix Oracle update:

- Oracle fetched `d26693f` and fast-forwarded from `e65c2f7` to `d26693f`.
- Only the four Chapter 3 seed JSONs changed. No `app.js` or image
  redeployment and no backend restart were needed.
- The four updated seeds validated again at 5 / 4 / 5 / 8 and were re-imported
  together. The improved “Understand why” content is currently in production
  for all 22 Chapter 3 questions.
- Windows development branch and Oracle source repository were both last known
  at `d26693f` after this update.

Final live-browser verification:

- Live URL: `http://100.95.39.107/`.
- After the all-22-question explanation rewrite and production re-import, the
  user manually verified the live site and confirmed: “all working.”
- Verification covered Chapter 3 navigation; all four Practice Sets in order;
  counts 5 / 4 / 5 / 8; Chapter 3 total 22; Book 1 total 45; authoritative
  source images; labels-only ア/イ/ウ/エ; Language Help; the corrected full
  3-2 ENQ/DEQ Romaji; correct and wrong submissions; explanation disclosure;
  Next; navigator; Back to Chapter 3; progress/resume; image lightbox;
  dark-mode source-image handling; and no observed layout regression.
- The improved “Understand why” content is confirmed live and acceptable. Its
  beginner-friendly ELI5 sections, step-by-step technical breakdowns, useful
  Japanese keywords, best-solution reasoning, separate wrong-option analysis,
  memory tricks, and final answer labels passed the user's live review.
- Final live-browser verification therefore PASSED. Chapter 3 is CLOSED.

Next content milestone:

- Textbook Practice — Book 1 → Chapter 4.
- Do not assume Chapter 4 Practice Set count, question count, printed-number
  ranges, answer keys, source mappings, or topic hierarchy.
- Begin only after the user supplies authoritative source material and the
  whole chapter is inventoried. Follow the whole-chapter workflow.

Architecture guardrails remain:

- Keep the three top-level entrances: Past Exam Questions, Textbook Practice —
  Book 1, and Textbook Practice — Book 2.
- Keep one shared quiz engine and generic `exam_set_id` architecture; no
  Book/Chapter-specific quiz controllers or renderers.
- Source images remain the authoritative visible Japanese question for new
  textbook content. Use labels-only when the image contains complete options,
  and structured text only when necessary.
- Option identity, Language Help, and progress use explicit Japanese labels,
  never inferred indexes. Selected answers remain Japanese labels.
- Preserve `GET/POST/DELETE /api/fe/progress/{exam_set_id}` and
  `X-FE-User-Key`, the shared image viewer/lightbox, shared explanation
  renderer, textbook explanation policy, and existing Past Exam policy.
- Keep Book/Chapter totals descendant-derived and each Practice Set an
  independent `exam_set_id`.
- Do not change schema, backend, importer, API, or progress architecture unless
  an actual generic compatibility defect is proven.

## Phase 3F Book 1 Chapter 4 Complete Deployment and Live Verification Checkpoint

Book 1 Chapter 4 is locally authored, fully QA-audited, committed, pushed,
pulled and validated on Oracle, deployed with all source images, imported as
three generic sets, API- and Nginx-verified, and manually verified in the live
browser. The user confirmed: “works great.” Chapter 4 is therefore
**COMPLETE / PASSED / CLOSED**.

Implementation commit:

- Branch: `feature/2025-part-b-source`.
- Commit: `a74f13530c834a11d6d52a735d173054b9959718`.
- Subject: `feat: add Book 1 chapter 4 practice sets`.
- Contents: declarative Chapter 4 catalog additions in `app.js`, three Chapter
  4 seed JSON files, and 19 Chapter 4 source PNGs.
- Stats: 23 files changed, 446 insertions, and 1 deletion.
- No backend, schema, importer, Nginx, systemd, progress, auth, or API-family
  change was required.

Chapter 4 structure and totals:

- Parent: Textbook Practice — Book 1 → Chapter 4.
- Chapter ID: `book1-ch04`.
- `book1-ch04-set01`: 9 questions, display numbers 4-1 through 4-9.
- `book1-ch04-set02`: 5 questions, display numbers 4-10 through 4-14.
- `book1-ch04-set03`: 5 questions, display numbers 4-15 through 4-19.
- Chapter 4 total: 19 questions.
- Final Book 1 totals: Chapter 1 = 8, Chapter 2 = 15, Chapter 3 = 22,
  Chapter 4 = 19, and Book 1 = 64.
- Chapter and Book totals remain descendant-derived through the generic catalog
  and progress architecture.

Catalog order and architecture:

- Book 1 children are exactly `book1-ch01`, `book1-ch02`, `book1-ch03`, and
  `book1-ch04`, in that order.
- Chapter 4 children are exactly `book1-ch04-set01`, `book1-ch04-set02`, and
  `book1-ch04-set03`, in that order.
- No duplicate node or fake Topic layer was created.
- No Chapter 4-specific controller, renderer, API route, backend logic, schema,
  importer, or progress implementation was added.

Authoritative source-image mapping under `public/questions/book1/ch04/`:

- Practice Set 1: `set01/q01.png` → 4-1; `q02.png` → 4-2;
  `q03.png` → 4-3; `q04.png` → 4-4; `q05.png` → 4-5;
  `q06.png` → 4-6; `q07.png` → 4-7; `q08.png` → 4-8; and
  `q09.png` → 4-9.
- Practice Set 2: `set02/q01.png` → 4-10; `q02.png` → 4-11;
  `q03.png` → 4-12; `q04.png` → 4-13; and `q05.png` → 4-14.
- Practice Set 3: `set03/q01.png` → 4-15; `q02.png` → 4-16;
  `q03.png` → 4-17; `q04.png` → 4-18; and `q05.png` → 4-19.
- The source inventory contains three Practice Sets and 19 images with the
  complete printed sequence 4-1 through 4-19. There are no gaps, duplicate
  printed numbers, duplicate/suspicious/misplaced images, or uncertain mappings.
- All 19 source-image SHA-256 values remained unchanged through authoring and
  QA. The printed question number in each source image remained authoritative.

Final authoritative answer key:

- Practice Set 1: 4-1 エ; 4-2 ア; 4-3 エ; 4-4 ア; 4-5 エ; 4-6 ウ;
  4-7 エ; 4-8 イ; 4-9 ア.
- Practice Set 2: 4-10 イ; 4-11 エ; 4-12 ア; 4-13 エ; 4-14 イ.
- Practice Set 3: 4-15 エ; 4-16 イ; 4-17 ア; 4-18 エ; 4-19 ウ.
- Compact sequence: `エ ア エ ア エ ウ エ イ ア / イ エ ア エ イ / エ イ ア エ ウ`.

Important 4-5 answer-key correction:

- An earlier manually supplied transcription incorrectly listed 4-5 as イ.
- The source question gives a CPU frequency of 1 GHz and an average of 0.8
  clocks per instruction. Therefore `10^9 ÷ 0.8 = 1.25 × 10^9`
  instructions/second, which is 125,000 万 instructions/second.
- Option エ is 125,000, and the authoritative answer-key source image also
  shows 4-5 = エ. The corrected final authoritative answer is 4-5 = エ.
- No partial implementation occurred before this conflict was resolved.

Content quality and final local QA:

- Japanese audit passed 19/19; complete Romaji audit passed 19/19; English
  audit passed 19/19; and option JP/Romaji/English mappings passed 76/76.
- Explicit option-label and authored-order mapping passed for all questions.
- Explanation quality passed 19/19; authoritative answer labels passed 19/19;
  and source images remained unchanged 19/19.
- All required seed/content validations, `node --check app.js`, and
  `git diff --check` passed.
- Browser checks passed at 320 px, 390 px, and desktop. Chapter 1/2/3 and 科目A/
  科目B regressions passed with no unexpected runtime or console errors.
- Every explanation follows the Chapter 3 quality contract, in order:
  `ELI5:`, `Technical breakdown:`, `Japanese keywords to remember:`,
  `Why the best solution works:`, `Wrong answer analysis:`, `Memory trick:`,
  and `Correct answer: X`.
- Each wrong option is explained separately. Complete Japanese, Romaji,
  English, formulas, values, conditions, and relevant sequences are preserved;
  no placeholder `...` represents omitted content.

Special 4-16 diagram QA:

- Question 4-16 uses diagram/image answer choices.
- Final QA made all diagram descriptions neutral, explicit, and visually
  accurate; corrected the Micro-B/Mini-B identification; and removed an
  incorrect HDMI claim.
- The options continue to use the existing generic question and Language Help
  contract. No fake source Japanese was invented for purely visual information,
  and no Chapter 4-specific renderer or schema was introduced.

Display contract:

- All 19 questions use `optionMode: "labels-only"` with explicit labels ア, イ,
  ウ, and エ.
- The source PNG is the authoritative visible Japanese question and options.
  Language Help uses structured Japanese/Romaji/English data mapped by the same
  explicit Japanese labels.
- Answer selection and progress continue to use Japanese labels, never inferred
  array indexes.

Oracle source update and validation:

- Production source repository: `/home/ubuntu/fe-quiz-src`, branch
  `feature/2025-part-b-source`.
- Before Chapter 4 deployment, Oracle source was at `d26693f`
  (`fix: improve Chapter 3 explanations`).
- Oracle ran `git fetch origin` and
  `git pull --ff-only origin feature/2025-part-b-source`. The repository
  fast-forwarded cleanly to `a74f135` (`feat: add Book 1 chapter 4 practice
  sets`) with no merge. The pull also included the intervening Chapter 3
  documentation checkpoint commit.
- After the pull, Git status was clean, `node --check app.js` passed, all three
  Chapter 4 seeds passed `--validate-only`, and the repository Chapter 4 PNG
  count was 19.
- Validation-only counts were 9 for `book1-ch04-set01`, 5 for
  `book1-ch04-set02`, and 5 for `book1-ch04-set03`.

Oracle production frontend deployment:

- Production frontend root: `/var/www/html`.
- Deployment copied `app.js` and every file under
  `public/questions/book1/ch04/`.
- No backend file, schema, Nginx configuration, or systemd configuration
  changed; no FastAPI restart or schema migration was required.
- Source/deployed `app.js` comparison matched. All 19 deployed images matched
  source byte-for-byte, with `BAD=0`, and the deployed Chapter 4 PNG count was
  19.

Database import:

- The existing generic importer was reused unchanged. The database environment
  came from `/etc/fe-quiz-api.env`; credential values must not be recorded or
  exposed. The existing Node PostgreSQL module path was
  `/home/ubuntu/fe-quiz-import/node_modules`.
- Imported `book1-ch04-set01` with 9 questions, `book1-ch04-set02` with 5, and
  `book1-ch04-set03` with 5: 19 Chapter 4 questions total.
- No Chapter 1/2/3 or Past Exam set required re-import for this deployment.

Health and API verification:

- Both `http://127.0.0.1:8010/api/fe/health` and
  `http://127.0.0.1/api/fe/health` returned
  `{"ok":true,"database":true}`.
- The generic question APIs returned exactly 9, 5, and 5 questions for the three
  Chapter 4 sets and the complete live display sequence 4-1 through 4-19.
- Every question returned its correct `displayNumber`, `labels-only` mode,
  explicit labels ア/イ/ウ/エ, authoritative `correct_answer`, and correct
  Chapter 4 image path. The corrected live API value for 4-5 is エ.

Nginx source-image verification:

- All 19 Chapter 4 image URLs returned HTTP 200; final result was `BAD=0`.
- An initial verification loop generated `q1.png`, `q2.png`, and so on because
  `seq -w 1 9` did not zero-pad a one-digit maximum. Those requests correctly
  returned 404. This was a verification-command formatting issue, not a
  production defect.
- The loop was corrected with `printf "%02d"`; all actual `qNN.png` URLs then
  returned HTTP 200 with `BAD=0`.

Final live-browser verification:

- Live URL: `http://100.95.39.107/`.
- Manual production verification covered Study Hub → Textbook Practice — Book 1;
  Chapter 4 and its three sets in correct order; set counts 9 / 5 / 5; Chapter
  total 19; Book total 64; display numbers 4-1 through 4-19; source images;
  labels-only ア/イ/ウ/エ controls; Language Help; 4-16 diagram Language Help;
  correct/wrong submission; corrected 4-5 = エ; explanations; Next; navigator;
  Back navigation; progress/resume; image lightbox; and dark-mode source-image
  behavior.
- The user reported: “works great.”
- **CHAPTER 4 LIVE VERIFICATION: PASSED**.
- **CHAPTER 4: COMPLETE / DEPLOYED / LIVE-VERIFIED / CLOSED**.

Architecture and guardrails remain unchanged:

- One shared quiz engine, generic `exam_set_id`, generic question API, generic
  progress GET/POST/DELETE, and isolated per-set progress/resume/reset.
- Descendant-derived Chapter/Book totals; source-image-first textbook display;
  explicit Japanese labels; labels-only when source images contain complete
  options; label-mapped Language Help; shared explanation renderer; shared image
  viewer/lightbox; and shared theme/responsive behavior.
- No Chapter 4-specific controller or renderer, Book API family, schema redesign,
  backend/importer/auth/sync change, or Nginx/systemd change was introduced.

Whole-chapter workflow for future textbook chapters:

1. Collect all source images.
2. Inventory and map every printed question number.
3. Confirm answer keys.
4. Author every set for the chapter.
5. Integrate the catalog once.
6. Validate and regression-test the whole chapter.
7. Complete final content QA.
8. Make one implementation commit and push.
9. Perform one Oracle pull/deployment.
10. Deploy all chapter images.
11. Import all generic sets.
12. Verify APIs and images.
13. Complete live-browser verification.
14. Add one final documentation checkpoint.

Practice Sets remain independent generic `exam_set_id` units. Whole-chapter
batching is operational only and does not merge progress, resume, or reset
identity.

Next content milestone:

- Chapter 4 is CLOSED.
- Continue with Textbook Practice — Book 1 → Chapter 5 using the same
  whole-chapter workflow and architecture guardrails.
- Do not infer Chapter 5 Practice Set count, question count, printed-number
  ranges, answer keys, source mappings, or topic hierarchy until authoritative
  Chapter 5 source material is supplied and inventoried.

## Phase 3G Book 1 Chapter 5 Complete Deployment and Live Verification Checkpoint

Book 1 Chapter 5 is source-inventoried, answer-key confirmed, locally authored,
locally content-audited, validated, committed, pushed, pulled and validated on
Oracle, frontend-deployed with all source images, imported as two generic sets,
API- and Nginx-verified, and manually verified in the live browser. The user
reported: “works fine.” Chapter 5 is therefore **COMPLETE / PASSED / CLOSED**.

Implementation commit:

- Branch: `feature/2025-part-b-source`.
- Commit: `f1c9bdc1bfd408449bd95db11b937b3fb4ed511f`.
- Subject: `feat: add Book 1 chapter 5 practice sets`.
- Contents: declarative Chapter 5 catalog additions in `app.js`,
  `seed/book1-ch05-set01.json`, `seed/book1-ch05-set02.json`, and 13 Chapter 5
  source PNGs.
- Stats: 16 files changed, 593 insertions, and 1 deletion.
- No backend, schema, importer, API, progress, auth, sync, Nginx, or systemd
  change was required.

Chapter 5 structure and totals:

- Parent: Textbook Practice — Book 1 → Chapter 5.
- Chapter ID: `book1-ch05`.
- `book1-ch05-set01`: 10 questions, display numbers 5-1 through 5-10.
- `book1-ch05-set02`: 3 questions, display numbers 5-11 through 5-13.
- Chapter 5 total: 13 questions.
- Final Book 1 totals: Chapter 1 = 8, Chapter 2 = 15, Chapter 3 = 22,
  Chapter 4 = 19, Chapter 5 = 13, and Book 1 = 77.
- Chapter and Book totals remain descendant-derived through the generic catalog
  and progress architecture.

Catalog order and architecture:

- Book 1 children are exactly `book1-ch01`, `book1-ch02`, `book1-ch03`,
  `book1-ch04`, and `book1-ch05`, in that order.
- Chapter 5 children are exactly `book1-ch05-set01` and
  `book1-ch05-set02`, in that order.
- No duplicate Chapter 5 node, duplicate Practice Set node, or fake Topic layer
  was created.
- No Chapter 5-specific quiz controller or renderer and no Book-specific API
  family was added.

Authoritative source-image mapping under `public/questions/book1/ch05/`:

- Practice Set 1: `set01/q01.png` → 5-1; `q02.png` → 5-2;
  `q03.png` → 5-3; `q04.png` → 5-4; `q05.png` → 5-5;
  `q06.png` → 5-6; `q07.png` → 5-7; `q08.png` → 5-8;
  `q09.png` → 5-9; and `q10.png` → 5-10.
- Practice Set 2: `set02/q01.png` → 5-11; `q02.png` → 5-12; and
  `q03.png` → 5-13.
- The source inventory contains two Practice Sets: 10 images in Set 1 and 3
  images in Set 2, for 13 images total and the complete printed sequence 5-1
  through 5-13.
- There are no gaps, duplicate printed numbers, SHA-256 exact duplicate images,
  suspicious or misplaced images, filename/order inconsistencies, or uncertain
  mappings.
- The printed question number inside each source image remained authoritative.
- All 13 source images remained unchanged during authoring and deployment.

Final authoritative answer key:

- Practice Set 1: 5-1 ウ; 5-2 エ; 5-3 イ; 5-4 ア; 5-5 エ; 5-6 ア;
  5-7 ア; 5-8 ア; 5-9 ア; 5-10 イ.
- Practice Set 2: 5-11 エ; 5-12 エ; 5-13 エ.
- Compact sequence: `ウ エ イ ア エ ア ア ア ア イ / エ エ エ`.
- No Chapter 5 answer-key conflict was found during authoring.

Display contract:

- All 13 Chapter 5 questions use `optionMode: "labels-only"` with explicit
  labels ア, イ, ウ, and エ. There are no structured-text exceptions.
- The source PNG remains the authoritative visible Japanese question and
  answer choices.
- Language Help uses structured Japanese, Romaji, and English mapped by
  explicit Japanese option labels.
- Correct answers and saved progress continue to use Japanese labels, never
  inferred indexes.

Content quality and local validation:

- Chapter 5 Language Help passed 13/13, and the explanation audit passed 13/13.
- Source-image integrity passed 13/13 with SHA-256 values unchanged; there are
  no exact duplicate source images.
- No answer-key conflict was found.
- All 17 old and new seeds validated, `node --check app.js` passed, the
  catalog/content/hash audit passed, and `git diff --check` passed.
- Every Chapter 5 explanation follows the Chapter 3/4 quality contract, in
  order: `ELI5:`, `Technical breakdown:`,
  `Japanese keywords to remember:`, `Why the best solution works:`,
  `Wrong answer analysis:`, `Memory trick:`, and `Correct answer: X`.
- Every incorrect option is analyzed separately.
- Language Help preserves complete Japanese, Romaji, English, formulas,
  conditions, values, and relevant technical details. No placeholder `...`
  represents omitted source content.

Local browser-regression limitation:

- During the local Chapter 5 implementation pass, automated browser regression
  could not run because the available browser backend was unavailable and
  Python Playwright was not installed.
- No dependency was installed merely to force the test. This was not a content
  or implementation failure.
- Static/content validation, seed validation, syntax checks, catalog checks,
  and image/hash checks all passed.
- Final manual testing against the deployed production application subsequently
  covered the missing browser regression. Because production live-browser
  verification passed, this is not an outstanding blocker.

Oracle source update and validation:

- Production source repository: `/home/ubuntu/fe-quiz-src`, branch
  `feature/2025-part-b-source`.
- Before the Chapter 5 pull, Oracle source was at `a74f135`
  (`feat: add Book 1 chapter 4 practice sets`).
- Oracle ran `git fetch origin` and
  `git pull --ff-only origin feature/2025-part-b-source`.
- The repository fast-forwarded cleanly to `f1c9bdc`
  (`feat: add Book 1 chapter 5 practice sets`) with no merge. The pull also
  included the intervening Chapter 4 documentation checkpoint commit.
- Oracle-side `node --check app.js` passed.
- `book1-ch05-set01` validated with 10 questions, and
  `book1-ch05-set02` validated with 3 questions.
- The repository Chapter 5 PNG count was 13: 10 in Set 1 and 3 in Set 2.

Oracle production frontend deployment:

- Production frontend root: `/var/www/html`.
- Deployment copied `app.js` and every file under
  `public/questions/book1/ch05/`.
- No backend file changed, no FastAPI restart or schema migration was required,
  and no Nginx or systemd configuration changed.
- Source and deployed `app.js` matched.
- All 13 deployed Chapter 5 PNGs matched their repository source byte-for-byte;
  the image comparison result was `BAD=0`, and the deployed PNG count was 13.

Database import:

- The existing generic importer was reused unchanged.
- The database environment came from `/etc/fe-quiz-api.env`; credential values
  must not be recorded or exposed.
- The existing Node PostgreSQL module path was
  `/home/ubuntu/fe-quiz-import/node_modules`.
- Import result: `Imported exam set: book1-ch05-set01`; questions imported: 10.
- Import result: `Imported exam set: book1-ch05-set02`; questions imported: 3.
- Total Chapter 5 questions imported: 13.
- No Chapter 1/2/3/4 or Past Exam set required re-import for Chapter 5.

Health verification:

- Both `http://127.0.0.1:8010/api/fe/health` and
  `http://127.0.0.1/api/fe/health` returned
  `{"ok":true,"database":true}`.
- A stray attempt to execute the printed JSON health response as a shell command
  produced a harmless `command not found` message afterward. This was operator
  copy/paste noise only; the real health checks had already passed, and there
  was no service failure.

Live API verification:

- The generic API returned exactly 10 questions for `book1-ch05-set01` and
  exactly 3 questions for `book1-ch05-set02`.
- The live display sequence was complete from 5-1 through 5-13.
- Every live question returned its correct `displayNumber`,
  `optionMode = labels-only`, explicit labels ア/イ/ウ/エ, authoritative
  `correct_answer`, and correct Chapter 5 source-image path.
- The live answer sequence matched
  `ウ エ イ ア エ ア ア ア ア イ / エ エ エ`.

Nginx source-image verification:

- All 13 Chapter 5 source-image URLs returned HTTP 200; final result was
  `BAD=0`.
- Unlike the first Chapter 4 verification attempt, Chapter 5 image verification
  enumerated the real repository paths directly, so no zero-padding filename
  mistake occurred.

Final live-browser verification:

- Live URL: `http://100.95.39.107/`.
- Manual production verification was completed after deployment, imports,
  health checks, API checks, and image HTTP checks.
- Verification covered Book 1 showing Chapter 5 after Chapter 4; Book 1 total
  77; Chapter 5 total 13; Practice Set counts 10 and 3; display numbers 5-1
  through 5-13; all source images; labels-only ア/イ/ウ/エ controls; Language
  Help; correct/wrong submission; explanations; Next; navigator; Back
  navigation; independent Practice Set progress; resume; image lightbox;
  dark-mode source-image handling; general responsive/layout behavior; and no
  observed regression preventing use.
- The user confirmed: “works fine.”
- **CHAPTER 5 LIVE VERIFICATION: PASSED**.
- **CHAPTER 5: COMPLETE / DEPLOYED / LIVE-VERIFIED / CLOSED**.

Architecture and guardrails remain unchanged:

- Chapter 5 reused one shared quiz engine, generic `exam_set_id`, generic
  question API, generic progress GET/POST/DELETE, and per-set
  progress/resume/reset isolation.
- Descendant-derived Chapter/Book totals, source-image-first textbook
  presentation, explicit Japanese labels, labels-only mode when the source
  contains complete answer choices, label-mapped Language Help, the shared
  explanation renderer, shared image viewer/lightbox, and shared
  theme/responsive behavior remain unchanged.
- No Chapter 5-specific controller or renderer, Book-specific API route family,
  backend change, schema change, importer change, progress-model change,
  auth/sync change, Nginx change, or systemd change was introduced.

Whole-chapter workflow for future textbook chapters:

1. Collect all chapter source images.
2. Inventory and map every printed question number.
3. Confirm answer keys.
4. Author every Practice Set for the chapter.
5. Integrate the catalog once.
6. Validate and regression-test the whole chapter.
7. Complete final content QA.
8. Make one implementation commit and push.
9. Perform one Oracle pull/deployment.
10. Deploy all chapter images.
11. Import all generic sets.
12. Verify APIs and images.
13. Complete live-browser verification.
14. Add one final documentation checkpoint.

Practice Sets remain independent generic `exam_set_id` units. Whole-chapter
batching is operational only and does not merge progress, resume, or reset
identity.

Next content milestone:

- Chapter 5 is CLOSED.
- Continue with Textbook Practice — Book 1 → Chapter 6 using the same
  whole-chapter workflow and architecture guardrails.
- Do not infer Chapter 6 Practice Set count, question count, printed-number
  ranges, answer keys, source mappings, option modes, or topic hierarchy until
  authoritative Chapter 6 source material is supplied and inventoried.

## Phase 3H Book 1 Chapter 6 Complete Deployment and Live Verification Checkpoint

Book 1 Chapter 6 is source-inventoried, answer-key confirmed, locally authored,
content-audited, validated, committed, pushed, pulled and validated on Oracle,
frontend-deployed with all source images, imported as three generic sets,
API- and Nginx-verified, and manually verified in the live browser. The user
reported: “works great.” Chapter 6 is therefore **COMPLETE / PASSED / CLOSED**.

Implementation commit:

- Branch: `feature/2025-part-b-source`.
- Commit: `59ff7b9a8cc892c5ae1e2614a80e6c134eb85cd5` (`59ff7b9`).
- Subject: `feat: add Book 1 chapter 6 practice sets`.
- Scope: declarative Chapter 6 catalog additions in `app.js`, three Chapter 6
  seed files, and 22 Chapter 6 source PNGs: 26 files total.
- The implementation commit was pushed successfully to GitHub.
- No backend, schema, importer, API, progress, auth, sync, Nginx, systemd, or
  deployment-configuration change was required.

Chapter 6 structure and totals:

- Parent: Textbook Practice — Book 1 → Chapter 6.
- Chapter ID: `book1-ch06`.
- `book1-ch06-set01`: 13 questions, display numbers 6-1 through 6-13.
- `book1-ch06-set02`: 4 questions, display numbers 6-14 through 6-17.
- `book1-ch06-set03`: 5 questions, display numbers 6-18 through 6-22.
- Chapter 6 total: 22 questions, with no gaps or duplicate printed numbers.
- Final Book 1 totals: Chapter 1 = 8, Chapter 2 = 15, Chapter 3 = 22,
  Chapter 4 = 19, Chapter 5 = 13, Chapter 6 = 22, and Book 1 = 99.
- Chapter and Book totals remain descendant-derived through the generic catalog
  and progress architecture.

Catalog order and architecture:

- Book 1 children are exactly `book1-ch01`, `book1-ch02`, `book1-ch03`,
  `book1-ch04`, `book1-ch05`, and `book1-ch06`, in that order.
- Chapter 6 children are exactly `book1-ch06-set01`, `book1-ch06-set02`, and
  `book1-ch06-set03`, in that order.
- `app.js` received declarative catalog integration only.
- No duplicate Chapter 6 or Practice Set node and no fake Topic layer was added.
- No Chapter 6-specific controller or renderer, Book-specific API logic,
  backend route redesign, schema redesign, or progress redesign was introduced.

Authoritative source-image inventory under `public/questions/book1/ch06/`:

- `set01/`: 13 PNGs; `q01.png` through `q13.png` map to 6-1 through 6-13.
- `set02/`: 4 PNGs; `q01.png` through `q04.png` map to 6-14 through 6-17.
- `set03/`: 5 PNGs; `q01.png` through `q05.png` map to 6-18 through 6-22.
- Total: 22 PNGs and the complete printed sequence 6-1 through 6-22.
- Inventory validation found no gaps, duplicate printed numbers, missing or
  unexpected filenames, filename/order inconsistencies, SHA-256 exact duplicate
  images, misplaced images, or uncertain mappings.
- The printed question number inside each source image remained authoritative.
- All 22 source images remained byte-for-byte unchanged during authoring and
  deployment.

Accepted 6-15 source-image exception:

- `public/questions/book1/ch06/set02/q02.png` maps to printed question 6-15.
- The image contains tiny accidental answer-reference text: `問題6-14 エ` and
  `問題6-15 ア`.
- Audit confirmed these annotations are not genuine 6-15 question content.
- Safe rectangular cropping was not possible without removing meaningful source
  content. The user explicitly chose to keep the image unchanged and continue.
- The unchanged SHA-256 is
  `942e7f30e0832c570dc2ff0a2b05345650bf21030a1df8588cd535557eb1b7dd`.
- The annotations were not included in Japanese transcription, Romaji, English,
  option content, or learner explanation.
- No special renderer, controller, or application logic was added.
- Production structured API verification confirmed both annotation strings are
  absent from the authored 6-15 content.
- This remains a user-accepted source-image anomaly only.

Final authoritative answer key:

- Practice Set 1: 6-1 ウ; 6-2 エ; 6-3 イ; 6-4 エ; 6-5 ア; 6-6 ウ;
  6-7 ウ; 6-8 イ; 6-9 ア; 6-10 ア; 6-11 ア; 6-12 エ; 6-13 ア.
- Practice Set 2: 6-14 エ; 6-15 ア; 6-16 イ; 6-17 ウ.
- Practice Set 3: 6-18 ウ; 6-19 ウ; 6-20 ア; 6-21 ア; 6-22 ウ.
- Compact sequence:
  `ウ エ イ エ ア ウ ウ イ ア ア ア エ ア / エ ア イ ウ / ウ ウ ア ア ウ`.
- The authoritative-answer audit passed 22/22.

Content contract and quality:

- All 22 questions use `optionMode: "labels-only"`; there are no
  structured-text exceptions.
- Every question uses explicit Japanese labels ア, イ, ウ, and エ.
- Language Help is complete for 22/22 with Japanese, Romaji, simple English,
  and option translations mapped by explicit label.
- Explanations are complete for 22/22 in required order: `ELI5:`,
  `Technical breakdown:`, `Japanese keywords to remember:`,
  `Why the best solution works:`, `Wrong answer analysis:`, `Memory trick:`,
  and `Correct answer: X`.
- Every incorrect option is analyzed separately.
- Final option translation mapping audit passed 88/88.

Final local QA:

- Result: `CHAPTER 6 FINAL LOCAL QA: PASSED — READY FOR IMPLEMENTATION COMMIT`.
- Set 1 fixes before commit: corrected the 6-1 table transcription/Romaji and
  restored the omitted 6-4 English condition.
- Set 2 fixes before commit: corrected 6-15 path wording/Romaji/English and
  removed the learner-facing anomaly note.
- Japanese, Romaji, English, explanation, and authoritative-answer audits each
  passed 22/22.
- Option mappings passed 88/88; option modes were labels-only 22 and
  structured-text 0.
- Source-image integrity passed 22/22 with 22 unique image hashes.
- Catalog/content/hash and static regression audits passed.
- All current seeds validated 20/20.
- `node --check app.js`, `git diff --check`, and all 55 DOM-reference checks
  passed.
- Local browser automation was unavailable because no browser backend or Python
  Playwright was installed. No dependency was installed merely to force local
  browser QA. Browser verification was deferred to and completed at the
  production deployment gate.

Oracle source update, validation, deployment, and import:

- Production source repository: `/home/ubuntu/fe-quiz-src`.
- Oracle started at Chapter 5 implementation commit `f1c9bdc` and
  fast-forwarded cleanly to `59ff7b9`, naturally including the intervening
  Chapter 5 documentation checkpoint.
- Oracle-side `node --check app.js` passed.
- Validate-only counts passed: Set 1 = 13, Set 2 = 4, Set 3 = 5.
- Repository PNG counts passed: 13 / 4 / 5, total 22.
- Frontend root: `/var/www/html`.
- Deployment copied `app.js` and all 22 Chapter 6 PNGs.
- Production `app.js` and all 22 PNGs matched repository sources byte-for-byte;
  image verification reported `BAD=0` and a production PNG count of 22.
- Environment was loaded from `/etc/fe-quiz-api.env`; credentials are not
  recorded here.
- The existing generic importer and Node module path were reused unchanged.
- Import results: `book1-ch06-set01` = 13, `book1-ch06-set02` = 4, and
  `book1-ch06-set03` = 5; 22 questions total.
- No schema, importer, backend, Nginx, or systemd change was needed; no backend
  restart was required.

Production health, API, image, and browser verification:

- Direct FastAPI health on `127.0.0.1:8010` and Nginx `/api/fe/` health both
  passed with successful application/database status.
- Production APIs returned exactly 13, 4, and 5 questions with the complete
  sequence 6-1 through 6-22.
- All 22 API questions had correct printed numbers, authoritative answer labels,
  `optionMode = labels-only`, labels exactly ア/イ/ウ/エ, and correct image
  paths.
- All 22 production image URLs returned HTTP 200; result: `BAD=0`.
- Oracle source remained clean at `59ff7b9`.
- The user completed live production browser verification and reported
  “works great.”
- Live verification covered Chapter 6 navigation after Chapter 5; Book 1 total
  99; Chapter 6 total 22; set counts 13 / 4 / 5; ranges 6-1 through 6-22;
  images; labels-only answers; correct/wrong flows; explanations; Language Help;
  corrected 6-1, 6-4, and 6-15 learner content; progress; resume; reset
  isolation; independent per-set progress; image lightbox; dark mode;
  responsive layouts; Chapters 1–5; 科目A; 科目B; and no reported regression.
- **CHAPTER 6 LIVE VERIFICATION: PASSED**.
- **CHAPTER 6: COMPLETE / DEPLOYED / LIVE-VERIFIED / CLOSED**.

Architecture and guardrails remain unchanged:

- Chapter 6 reused one shared quiz engine, generic `exam_set_id`, generic
  question API, generic progress GET/POST/DELETE, independent per-set
  progress/resume/reset, explicit Japanese labels, label-mapped Language Help,
  shared explanation renderer, shared lightbox/image viewer, source-image-first
  textbook presentation, descendant-derived totals, and the generic Oracle
  importer.
- No backend architecture, API route, schema, importer architecture,
  authentication, synchronization, Nginx, or systemd change was introduced.
- Whole-chapter batching remained operational only; each Practice Set retained
  independent progress, resume, reset, and generic set identity.

Next content milestone:

- Chapter 6 is CLOSED.
- Continue with **Book 1 → Chapter 7 source intake**.
- Before implementation, collect authoritative source images, determine the
  actual Practice Set structure from those sources, inventory every file, map
  printed question numbers, obtain authoritative answer keys, and confirm all
  counts and mappings.
- Do not assume or invent Chapter 7 question counts, Practice Set counts,
  numbering, answer keys, source mappings, option modes, or topic hierarchy.

## Phase 3I Book 1 Chapters 7–11 Batch Deployment and Live Verification Checkpoint

Status:

- **Book 1 Chapters 7–11: COMPLETE / PASSED / DEPLOYED / IMPORTED /
  LIVE-VERIFIED / CLOSED**.
- The reusable `docs/agents/BOOK_CHAPTER_FACTORY.md` workflow governed source
  intake, answer-key locking, authoring, catalog integration, QA, deployment,
  import, and live verification.
- Authoring was safely split operationally into Chapter 7, Chapter 8, Chapter
  9, Chapter 10, Chapter 11 Part A, and Chapter 11 Part B because 111 questions
  exceeded one Codex authoring context. This did not merge Practice Sets or
  cause partial chapter deployment. Every Practice Set remains an independent
  generic `exam_set_id` unit.

Batch structure and totals:

- Chapter 7 (`book1-ch07`): 1 Practice Set;
  `book1-ch07-set01` = 7 questions; printed 7-1 through 7-7.
- Chapter 8 (`book1-ch08`): 1 Practice Set;
  `book1-ch08-set01` = 11 questions; printed 8-1 through 8-11.
- Chapter 9 (`book1-ch09`): 3 Practice Sets with 7 / 8 / 7 questions;
  22 total; printed 9-1 through 9-22.
- Chapter 10 (`book1-ch10`): 4 Practice Sets with 6 / 6 / 6 / 10 questions;
  28 total; printed 10-1 through 10-28.
- Chapter 11 (`book1-ch11`): 5 Practice Sets with 14 / 6 / 5 / 5 / 13
  questions; 43 total; printed 11-1 through 11-43.
- Whole batch: 14 independent generic Practice Sets, 111 questions, and 111
  source PNGs.
- Existing Book 1 Chapters 1–6 contain 99 questions. The final Book 1 total is
  210 questions across Chapters 1–11, derived from descendant Practice Set
  counts rather than a separately stored total.

Final local authoring and whole-batch QA:

- New seeds passed 14/14; questions passed 111/111.
- Option modes: labels-only 111; structured-text 0.
- Japanese, Romaji, English, explanation quality, authoritative answers, and
  answer/explanation consistency each passed 111/111.
- Option mappings passed 444/444. Every wrong option is analyzed separately.
- Explanation order remains: ELI5; Technical breakdown; Japanese keywords to
  remember; Why the best solution works; Wrong answer analysis; Memory trick;
  Correct answer.
- Source-image integrity passed 111/111; all 111 SHA-256 hashes were unique.
- Placeholder/contamination audit passed.
- All generic seeds in the repository validated 34/34.
- `node --check app.js`, `git diff --check`, and static/regression checks passed.
- Local browser automation was deferred to production live QA.

Corrected Chapter 11 source/key conflicts:

- For 11-7, the initially supplied key `ウ` conflicted with the manually
  rechecked source. The question asks which item is a backdoor; option `ア`
  bypasses the normal authentication/password path. The earlier `ウ` was
  superseded. Final seed, API, and live behavior use `11-7 = ア`.
- For 11-29, the initially supplied key `ウ` conflicted with the manually
  rechecked source. The question asks which attack threatens information
  integrity; option `ア`, Web-page alteration/tampering, threatens integrity,
  while DoS threatens availability. The earlier `ウ` was superseded. Final
  seed, API, and live behavior use `11-29 = ア`.
- Both corrections were re-audited during final whole-batch QA and verified
  through the production API and live application.

Chapter 11 filename anomaly:

- `public/questions/book1/ch11/set05/q013.png` maps authoritatively to 11-43.
- This is a filename-pattern anomaly only and was intentionally not renamed.
- There is no `q13.png`; the seed uses the exact `q013.png` path.
- The production API and live browser successfully load this image.

Git implementation history:

- Batch branch: `feature/book1-ch07-ch11-batch`.
- Reusable factory commit: `b368a68` — `docs: add reusable book chapter factory`.
- Implementation commits:
  - `980aaf6` — `feat: add Book 1 chapter 7 practice set`.
  - `b92f5a4` — `feat: add Book 1 chapter 8 practice set`.
  - `b0aad75` — `feat: add Book 1 chapter 9 practice sets`.
  - `5334f2a` — `feat: add Book 1 chapter 10 practice sets`.
  - `82cdb4b` — `feat: add Book 1 chapter 11 practice sets`.
  - `9f332c2` — `feat: integrate Book 1 chapters 7 through 11`.
- Final catalog commit SHA: `9f332c264e90988b853dc65810618969f98a53d3`.
- The branch was pushed successfully to
  `origin/feature/book1-ch07-ch11-batch`.

Catalog state:

- Book 1 children are ordered `book1-ch01`, `book1-ch02`, `book1-ch03`,
  `book1-ch04`, `book1-ch05`, `book1-ch06`, `book1-ch07`, `book1-ch08`,
  `book1-ch09`, `book1-ch10`, `book1-ch11`.
- New catalog nodes are declarative only. No chapter-specific controller,
  Book-specific renderer or API, fake Topic layer, schema redesign, or custom
  progress model was introduced.

Oracle branch handling and predeployment validation:

- Oracle source repository: `/home/ubuntu/fe-quiz-src`.
- Its fetch refspec initially included only `feature/2025-part-b-source`.
  The new branch was explicitly fetched, and a second refspec was added for
  `feature/book1-ch07-ch11-batch`.
- Oracle switched cleanly to `feature/book1-ch07-ch11-batch`, tracking
  `origin/feature/book1-ch07-ch11-batch`; production source HEAD was
  `9f332c2`. The working tree was clean before and after deployment.
- This was Oracle repository Git configuration for the deployment branch, not
  an application architecture change.
- Oracle predeployment checks passed: `node --check app.js`; all 14 new seeds
  with `--validate-only`; set counts 7, 11, 7 / 8 / 7, 6 / 6 / 6 / 10, and
  14 / 6 / 5 / 5 / 13; total 111.
- Source PNG counts passed: Chapters 7–11 = 7 / 11 / 22 / 28 / 43, total 111.
  SHA rows = 111 and unique hashes = 111. `q013.png` was present and unexpected
  `q13.png` was absent.

Production deployment and imports:

- Frontend root: `/var/www/html`.
- Deployment copied `app.js` and the Chapter 7, 8, 9, 10, and 11 source-image
  trees. No backend file, schema, Nginx configuration, or systemd configuration
  changed; no backend restart or schema migration was required.
- Source and deployed `app.js` SHA-256:
  `89e6fd9f29007b21171f54181a14cac70118da7c1148f79f8743be522d4ea03d`.
  Source/runtime comparison passed.
- All 111 deployed PNGs matched repository sources byte-for-byte. Deployment
  image counts were 7 / 11 / 22 / 28 / 43.
- The existing generic importer was reused unchanged. Environment came from
  `/etc/fe-quiz-api.env` without exposing credentials; runtime used
  `NODE_PATH=/home/ubuntu/fe-quiz-import/node_modules`.
- All 14 imports succeeded: Chapter 7 Set 1 = 7; Chapter 8 Set 1 = 11;
  Chapter 9 Sets 1–3 = 7 / 8 / 7; Chapter 10 Sets 1–4 = 6 / 6 / 6 / 10;
  Chapter 11 Sets 1–5 = 14 / 6 / 5 / 5 / 13. Imported total: 111.

Production API and live browser verification:

- Direct FastAPI health at `http://127.0.0.1:8010/api/fe/health` and Nginx
  health at `http://127.0.0.1/api/fe/health` both returned
  `{"ok":true,"database":true}`.
- All 14 generic question endpoints returned expected counts.
- Production API special checks passed: `11-7 = ア`, `11-29 = ア`, and 11-43
  uses `q013.png`.
- All 111 live source-image URLs returned HTTP 200.
- Live URL: `http://100.95.39.107/`.
- The user manually tested the deployed batch and reported “works great.” Live
  QA passed for the new Book 1 catalog, shared quiz flow, source images,
  labels-only controls, Language Help, Romaji/English aids, answer submission,
  explanations, navigation, corrected Chapter 11 answers, and `q013.png`.
- **BOOK 1 CHAPTERS 7–11 LIVE VERIFICATION: PASSED**.

Architecture and guardrails retained:

- Chapters 7–11 introduced no change to PostgreSQL schema, FastAPI route
  family, progress GET/POST/DELETE, authentication/sync identity, backend
  service, Nginx, systemd, importer architecture, shared quiz engine, shared
  explanation renderer, shared Language Help, shared image viewer/lightbox, or
  per-set resume/reset/progress isolation.
- Generic `exam_set_id` remains question-set identity. Book/chapter totals remain
  descendant-derived. Source images remain authoritative visible Japanese
  content. Explicit Japanese labels remain answer identity.

Batch outcome and next-content guardrail:

- **Book 1 Chapters 7–11 batch is COMPLETE, DEPLOYED, LIVE-VERIFIED, and
  CLOSED.**
- New content: 111 questions. Book 1: 210 total questions across Chapters 1–11.
- Do not invent the next chapter structure or Book 2 content. Future content
  must use the factory source-intake and answer-key gates before authoring.

## Phase 3J Book 1 Chapters 12–16 Batch Deployment, ELI5 Quality, and Live Verification Checkpoint

Status:

- **Book 1 Chapters 12–16: COMPLETE / PASSED / DEPLOYED / IMPORTED /
  LIVE-VERIFIED / ELI5-QUALITY-APPROVED**.
- Implementation branch: `feature/book1-ch12-ch16-batch`.
- Previous checkpoint base: `10125ed` —
  `docs: close Chapters 7 through 11 batch checkpoint`.
- The Book Chapter Factory workflow governed source intake, answer lock,
  chapter authoring, catalog integration, whole-batch QA, deployment, and
  manual quality review.

Batch structure and totals:

- Chapter 12: 3 Practice Sets; `book1-ch12-set01` = 6 questions,
  `book1-ch12-set02` = 9, and `book1-ch12-set03` = 10; 25 total; printed
  12-1 through 12-25.
- Chapter 13: 1 Practice Set; `book1-ch13-set01` = 7 questions; printed 13-1
  through 13-7.
- Chapter 14: 1 Practice Set; `book1-ch14-set01` = 17 questions; printed 14-1
  through 14-17.
- Chapter 15: 2 Practice Sets; `book1-ch15-set01` = 9 questions and
  `book1-ch15-set02` = 10; 19 total; printed 15-1 through 15-19.
- Chapter 16: 2 Practice Sets; `book1-ch16-set01` = 8 questions and
  `book1-ch16-set02` = 7; 15 total; printed 16-1 through 16-15.
- Whole batch: 5 chapters, 9 independent generic Practice Sets, 83 questions,
  and 83 source PNGs.
- All 83 source PNG SHA-256 hashes are unique; duplicate source hashes = 0.
- Option modes: labels-only 83; structured-text 0.
- Explicit option mappings passed 332/332.
- Book 1 contained 210 questions before this batch. Chapters 12–16 added 83,
  producing the current Book 1 total of **293**, derived from descendant
  Practice Set counts rather than a manually stored counter.

Generic Practice Set IDs:

- `book1-ch12-set01`
- `book1-ch12-set02`
- `book1-ch12-set03`
- `book1-ch13-set01`
- `book1-ch14-set01`
- `book1-ch15-set01`
- `book1-ch15-set02`
- `book1-ch16-set01`
- `book1-ch16-set02`

Git implementation and content-quality history:

- `a13edf5` — `feat: add Book 1 chapter 12 practice sets`.
- `ba5cdfe` — `feat: add Book 1 chapter 13 practice set`.
- `4b9cf2b` — `feat: add Book 1 chapter 14 practice set`.
- `72034a6` — `feat: add Book 1 chapter 15 practice sets`.
- `1d6fab6` — `feat: add Book 1 chapter 16 practice sets`.
- `5c6a5bd` — `feat: integrate Book 1 chapters 12 through 16`.
- Full catalog integration SHA:
  `5c6a5bdabffeebf02d3d18714b3722eb8ffe129e`.
- Dedicated content-quality follow-up: `7a3fe48` —
  `content: improve ELI5 explanations for chapters 12 through 16`.
- Full content-quality SHA:
  `7a3fe48a811154c65b5d9a193e2a5cc1ca0753e0`.

Final local authoring and whole-batch QA:

- All 9 new seeds validated; repository-wide seed validation passed 43/43 at
  the integration checkpoint.
- Questions, Japanese, Romaji, English, explanations, authoritative answers,
  answer/explanation consistency, and display/internal numbering each passed
  83/83.
- Option mappings passed 332/332.
- Source PNG count = 83; unique source hashes = 83; source duplicates = 0.
- Placeholder and source-contamination audit passed.
- Catalog integrity passed.
- `node --check app.js` and `git diff --check` passed.
- Chapters 1–11 behavior and content remained protected.
- No chapter-specific renderer or controller was added.

ELI5 quality issue, review, and correction:

- Initial deployment was technically correct, but manual live review found the
  new `ELI5:` sections too short to teach the concepts adequately.
- A first automated expansion covered all 83 questions. Representative human
  review rejected that pass because some explanations used repeated generic
  templates, restated questions, echoed correct-answer wording, introduced
  jargon too early, or did not sufficiently walk through calculations and
  diagrams.
- The representative first manual sample reviewed 10 questions: 5 PASS and
  5 FAIL. The first automated expansion was therefore not accepted as
  sufficient.
- V2 reviewed all 83 questions and substantially rewrote 41. Known manual
  failures were corrected, borderline cases were improved, boilerplate was
  eliminated, and the duplicate/repeated-template audit passed.
- Japanese, Romaji, English, options, mappings, and answers remained unchanged.
  All non-ELI5 explanation sections also remained unchanged.
- All 9 validators still passed, and all source PNGs remained unchanged.
- Final human review initially scored 11/12 because question 16-1 still used
  unexplained distractor jargon.
- Question 16-1 then received one surgical ELI5 correction using the four-map
  Enterprise Architecture model: business, data, application, technology, and
  whole-company optimization.
- Final manual and live review passed. The user explicitly confirmed that the
  ELI5 looked good after the correction.

Oracle deployment architecture and branch handling:

- Oracle source repository: `/home/ubuntu/fe-quiz-src`.
- Frontend root: `/var/www/html`.
- API: FastAPI on `127.0.0.1:8010` behind the Nginx `/api/fe/` proxy.
- Live Tailscale URL: `http://100.95.39.107/`.
- The Oracle clone required and received a fetch ref for
  `feature/book1-ch12-ch16-batch`. This Git configuration change did not alter
  application architecture.
- Deployment copied the updated `app.js` and the Chapter 12–16 image trees,
  totaling 83 PNGs.
- Deployed `app.js` was byte-identical to the repository file. All deployed
  Chapter 12–16 image trees were byte-identical to repository sources, and the
  deployed PNG count was 83.

Oracle imports, API, and image verification:

- All 9 generic sets imported successfully with counts 6 / 9 / 10 / 7 / 17 /
  9 / 10 / 8 / 7, totaling 83 questions.
- Direct FastAPI, Nginx proxy, and Tailscale-facing health checks returned
  `{"ok":true,"database":true}`.
- API verification passed for all 9 sets: counts, display numbers, and
  authoritative answers were correct; total questions = 83;
  `API VERIFICATION = PASS`.
- Image HTTP verification passed: total = 83; bad = 0.

ELI5 quality redeployment:

- After content-quality commit `7a3fe48`, Oracle pulled the updated branch, all
  9 seeds validated again, and all 9 sets were re-imported.
- No `app.js` or PNG redeployment, backend or Nginx restart, schema change, or
  importer change was required for the ELI5-only update.
- Health remained `{"ok":true,"database":true}`.
- API verification for question 16-1 proved `displayNumber = 16-1`,
  `correct_answer = ウ`, the API served the expanded four-map Enterprise
  Architecture ELI5, and the final line remained `Correct answer: ウ`.

Manual live verification:

- Book 1 displays the Chapters 12–16 additions and the descendant-derived total
  of 293 questions.
- All 9 new Practice Sets work.
- Image rendering, Language Help, answer submission, and feedback/explanation
  rendering work through the shared quiz flow.
- The final improved ELI5 quality was manually accepted.
- **BOOK 1 CHAPTERS 12–16 LIVE VERIFICATION AND ELI5 QUALITY: PASSED**.

Architecture and guardrails retained:

- One shared quiz engine and generic `exam_set_id` continue to drive every set.
- Catalog integration remains declarative.
- The source-image-first textbook workflow remains authoritative.
- All 83 questions use labels-only mode; explicit Japanese labels
  ア/イ/ウ/エ remain answer truth.
- Language Help, explanation rendering, image/lightbox handling, and progress
  GET/POST/DELETE remain generic.
- Progress remains independent per set. Chapter and Book totals remain
  descendant-derived.
- No Book-specific API, Chapter-specific controller, schema redesign, backend
  redesign, importer redesign, Nginx change, or systemd change was introduced.

Reusable ELI5 quality guardrail:

- Automated structural QA is not sufficient to certify teaching quality.
- Future textbook batches retain automated explanation QA, followed by a
  representative human ELI5 review before final deployment closure.
- Generic boilerplate must be rejected even when sentence-count or depth checks
  pass.
- ELI5 teaching must build intuition before introducing jargon.
- Calculation and diagram explanations must walk through the actual values and
  relationships.
- Human learner comprehension is the final quality gate.
- This lesson complements rather than replaces
  `docs/agents/BOOK_CHAPTER_FACTORY.md`.

Batch outcome and next-content guardrail:

- **Book 1 Chapters 12–16 batch is COMPLETE / PASSED / DEPLOYED / IMPORTED /
  LIVE-VERIFIED / ELI5-QUALITY-APPROVED**.
- Do not invent Chapter 17 structure. The next textbook chapter or batch must
  begin with authoritative source intake before assuming Practice Set count,
  question count, numbering, option mappings, or answer keys.
