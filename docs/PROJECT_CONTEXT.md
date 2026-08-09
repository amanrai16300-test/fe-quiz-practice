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
