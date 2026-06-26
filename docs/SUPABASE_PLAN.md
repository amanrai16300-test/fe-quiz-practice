# Supabase Sync Plan — FE Quiz Practice

> Planning doc only. No app code, no client, no auth, no migrations yet.
> SQL below is **illustrative draft**, not final.

## 1. Why Supabase Is Needed

- Current app loses all progress on refresh (in-memory only). See `docs/PROJECT_CONTEXT.md` → "Refresh resets everything".
- Goal is cross-device study (desktop + iPhone). localStorage alone can't sync across devices.
- Need a single source of truth for: which questions answered, correct/wrong, and where the user left off.
- Future plan already lists Backend sync + Auth as phases 3–4. Supabase covers both (Postgres + Auth in one).

## 2. Current Local App State Summary

- One paper wired: `fe-2025-a-public`, 20 questions.
- Content lives in `questions.js` (`QUIZ`, `OPTION_LABELS`). Structure prepared for multiple papers (`EXAM_SETS`).
- Progress = plain JS object, keyed by paper ID:
  ```js
  answers[paperId][index] = { selected, submitted, isCorrect }
  ```
- Session/"current question" = wherever the user navigated; not persisted.
- No persistence, no auth, no backend today.

## 3. Future Sync Goal

- After login, user sees the **same progress on any device**.
- Each answered question (selected option, correct/wrong, when) stored server-side per user.
- The user's current paper + current question restored on app open.
- Supports many papers, not one.
- Newer/further progress never silently overwritten by a stale device.

## 4. Source-of-Truth Rule

- **Supabase is the source of truth.** Always.
- localStorage is a cache/convenience layer only — never the main DB.
- On app load: **read Supabase first** (after auth) and hydrate UI from it.
- On answer submit: **write to Supabase before advancing** to the next question.

## 5. Required Tables

1. `exam_sets` — papers (metadata).
2. `questions` — questions per paper.
3. `question_progress` — per-user, per-question answer state.
4. `quiz_sessions` — per-user, per-paper "where I am" (current question + status).

Users themselves come from Supabase Auth (`auth.users`); progress/session reference `user_id`.

## 6. Suggested Schema (illustrative draft)

### exam_sets
| column | type | notes |
|--------|------|-------|
| `id` | text (PK) | matches current paper ID, e.g. `fe-2025-a-public` |
| `title` | text | e.g. 令和7年度… 科目A 公開問題 |
| `description` | text | shown on home card |
| `question_count` | int | e.g. 20 |
| `created_at` | timestamptz | default now() |

### questions
| column | type | notes |
|--------|------|-------|
| `id` | uuid (PK) | generated |
| `exam_set_id` | text (FK → exam_sets.id) | |
| `question_index` | int | 0-based or 問N; stable order within paper |
| `body` | jsonb | question text + translations (ja/romaji/en) |
| `options` | jsonb | ア〜エ + per-option translations |
| `correct_answer` | text | ア/イ/ウ/エ |
| `explanation` | text | ELI5 + breakdown + wrong-answer analysis |
| `image_path` | text null | e.g. `public/questions/fe-2025-a/q03.png` |
| UNIQUE | `(exam_set_id, question_index)` | one row per slot |

> `body`/`options`/`explanation` can stay in `questions.js` initially. This table is the migration target so content + answers share one source later. Question content is **not** user data — global, read-only to clients.

### question_progress
| column | type | notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → auth.users) | |
| `exam_set_id` | text (FK → exam_sets.id) | |
| `question_id` | uuid (FK → questions.id) | |
| `selected` | text | ア/イ/ウ/エ |
| `submitted` | bool | |
| `is_correct` | bool | |
| `updated_at` | timestamptz | conflict resolution; default now() |
| UNIQUE | `(user_id, exam_set_id, question_id)` | **scope rule** |

### quiz_sessions
| column | type | notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → auth.users) | |
| `exam_set_id` | text (FK → exam_sets.id) | |
| `current_question_index` | int | where user left off |
| `furthest_question_index` | int | high-water mark; never decreases |
| `updated_at` | timestamptz | conflict resolution |
| UNIQUE | `(user_id, exam_set_id)` | **scope rule** |

## 7. Relationships

```
auth.users 1───∞ question_progress ∞───1 questions ∞───1 exam_sets
auth.users 1───∞ quiz_sessions    ∞───────────────1 exam_sets
exam_sets  1───∞ questions
```

- One paper has many questions.
- One user has many progress rows (one per answered question per paper).
- One user has one session row per paper (current + furthest position).
- Progress scoped by `user_id + exam_set_id + question_id`.
- Session scoped by `user_id + exam_set_id`.

## 8. Per-Question Progress Sync Across Devices

- Each answered question = one `question_progress` row, keyed by `(user_id, exam_set_id, question_id)`.
- Answer on device A → upsert row. Device B reads same row on next load → identical state.
- Upsert (not insert) on the unique key: re-answering updates the existing row, no duplicates.
- `updated_at` set on every write — used for conflict handling (§12).

## 9. In-Memory State → Supabase Rows

Current:
```js
answers[paperId][index] = { selected, submitted, isCorrect }
```
Maps to:

| in-memory | Supabase |
|-----------|----------|
| `paperId` | `question_progress.exam_set_id` |
| `index` → question | `question_progress.question_id` (via `(exam_set_id, question_index)`) |
| `selected` | `question_progress.selected` |
| `submitted` | `question_progress.submitted` |
| `isCorrect` | `question_progress.is_correct` |
| current nav position | `quiz_sessions.current_question_index` |
| (new) max reached | `quiz_sessions.furthest_question_index` |

The in-memory object stays as the **UI cache**, hydrated from Supabase on load, written through to Supabase on submit. Quiz logic unchanged — store is already serializable by design.

## 10. Save Flow (on answer submit)

1. User selects option, clicks Submit.
2. Compute `is_correct`.
3. **Upsert `question_progress`** on `(user_id, exam_set_id, question_id)` with `selected`, `submitted=true`, `is_correct`, `updated_at=now()`.
4. **Upsert `quiz_sessions`**: `current_question_index`, and `furthest_question_index = max(existing, current)`.
5. On success → update in-memory state, reveal feedback, enable Next.
6. On failure → keep UI usable, surface a retry; do **not** advance silently as if saved.

> Rule: save to Supabase **before** moving forward.

## 11. Load Flow (on app open)

1. Auth resolves user.
2. **Read Supabase first**: `quiz_sessions` (resume point) + `question_progress` (all answered) for the user.
3. Hydrate the in-memory `answers` store from `question_progress`.
4. Restore current paper + `current_question_index` from `quiz_sessions`.
5. Render that question with restored state.
6. localStorage cache (if present) may render instantly while the Supabase read is in flight, then reconcile (§12). Supabase wins.

## 12. Conflict Handling Rule

- **Never overwrite newer/further progress.** Two rules:
  - **Progress rows:** on conflicting writes, keep the row with the latest `updated_at` (last-write-wins per question is acceptable since a question's answer is a single value).
  - **Session position:** `furthest_question_index` is a **monotonic high-water mark** — only ever increases. A stale device reporting a lower furthest index must **not** lower it. `current_question_index` can move freely (it's "where I'm looking"), but furthest never regresses.
- On load, if local cache and Supabase disagree, **Supabase wins**, then merge: take per-question latest `updated_at`, take max furthest index.

## 13. localStorage — Allowed Later Uses

- Instant first paint cache before the Supabase read returns.
- Offline draft buffer: queue an unsynced answer, flush to Supabase when back online.
- Non-critical UI prefs (translation panel open/closed, theme).

**localStorage must never be the main database.**

## 14. Must NOT Be Stored Only Locally

- Answer progress (`selected`, `submitted`, `is_correct`).
- Session position (current + furthest question).
- Anything that needs to appear on another device.

All of the above live in Supabase as the source of truth; local copies are cache only.

## 15. Implementation Phases

1. **Schema** — create the 4 tables + unique constraints in Supabase. No app wiring.
2. **Auth** — Supabase Auth; obtain `user_id`. (Separate phase, separate doc.)
3. **Content migration** — load `exam_sets` + `questions` from `questions.js` into Supabase (or keep content local, sync progress only — decide here).
4. **Read path** — on load, hydrate in-memory store from Supabase (§11).
5. **Write path** — on submit, upsert progress + session before advancing (§10).
6. **Conflict + offline** — high-water-mark session, last-write-wins progress, localStorage offline queue (§12–13).
7. **Multiple papers** — wire real additional papers; everything above is already paper-scoped.

> No code is written by this plan. Next concrete step: phase 1 schema.
