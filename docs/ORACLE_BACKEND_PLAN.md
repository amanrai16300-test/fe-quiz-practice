# Oracle Backend Plan — FE Quiz Practice

> Planning doc only. No backend code, no SQL, no app changes yet.
> Companion to `docs/SUPABASE_PLAN.md` and `docs/SEED_DATA_PLAN.md` — this doc
> swaps the **hosting + access layer** (Supabase → self-managed Oracle VM) while
> keeping the data model, sync rules, and seed plan already designed there.

## 1. Why an Oracle Backend Is Being Considered

- **Supabase free tier limit reached** — cannot create/keep the project under the
  free plan. Blocks the planned sync + auth phases.
- An **Oracle Cloud VM is already available** (self-managed) — no extra monthly cost
  for compute we already have.
- The whole Supabase plan (`docs/SUPABASE_PLAN.md`) is really "Postgres + Auth +
  REST". All three can run on the Oracle VM with **FastAPI + PostgreSQL**, so the
  data model survives untouched — only the access layer changes.
- Keeps **full control**: no vendor row/storage/egress limits, own backup schedule.

This is a **hosting swap, not a redesign.** The source-of-truth rules, table shapes,
scope keys, and high-water-mark logic from the Supabase plan all carry over.

## 2. Supabase vs Oracle Self-Managed Backend

| Concern | Supabase (managed) | Oracle VM (self-managed) |
|---|---|---|
| Database | Hosted Postgres | PostgreSQL local on VM |
| API layer | Auto REST/RLS from tables | **FastAPI** hand-written endpoints |
| Auth | Supabase Auth (`auth.users`, JWT) | App-level: one-user/password → JWT later |
| Per-user access control | **RLS policies** (`auth.uid() = user_id`) | **WHERE user_id = …** in each query |
| Client SDK | `@supabase/supabase-js` | Plain `fetch` to FastAPI |
| Cost | Free tier → **limit hit** | Already-owned VM, no new cost |
| Ops burden | Near zero (managed) | We patch/back up/monitor the VM |
| TLS/HTTPS | Provided | We run **Nginx + certs** |
| Scaling | Automatic | Manual (fine for single-user study app) |

**Trade-off:** Oracle gives control + no cost ceiling at the price of ops work
(server, Nginx, backups, auth). For a single-user (or few-user) study app that
ops cost is small and one-time. Recommended given the free-tier block.

## 3. Recommended Architecture

```
[ Static frontend ]  index.html / app.js / style.css / questions.js
        |  fetch (HTTPS)
        v
[ Nginx ]  TLS, serves static files, reverse-proxies /api/* → FastAPI
        |
        v
[ FastAPI ]  endpoints (§7), validation, auth, sync rules (§9)
        |
        v
[ PostgreSQL ]  local on the same Oracle VM — source of truth (§9)
```

- **Static frontend** — unchanged app (`index.html`, `app.js`, `style.css`,
  `questions.js`). Talks to the backend over `fetch` instead of the Supabase SDK.
  Can be served by the same Nginx or any static host.
- **FastAPI backend** — the new piece. Owns auth, request validation, and the sync
  rules that Supabase did via RLS + triggers.
- **PostgreSQL on the VM** — same 4-table model as `supabase/schema.sql`, minus the
  Supabase-specific `auth.users` FK and RLS (§5).

## 4. Which Supabase Planning Concepts Still Apply

Carry over **unchanged** from `docs/SUPABASE_PLAN.md` / `docs/SEED_DATA_PLAN.md`:

- **Source-of-truth rule** — backend DB is authoritative; local memory/localStorage is
  cache only (SUPABASE_PLAN §4). Now "backend DB" = Postgres on Oracle, not Supabase.
- **Table set** — `exam_sets`, `questions`, `question_progress`, `quiz_sessions`
  (SUPABASE_PLAN §5).
- **Scope keys** — progress unique on `(user_id, exam_set_id, question_id)`; session
  unique on `(user_id, exam_set_id)` (SUPABASE_PLAN §6).
- **Sync semantics** — read backend first on load, write before advancing on submit,
  last-write-wins per progress row, `furthest_question_index` monotonic (SUPABASE_PLAN
  §10–12).
- **In-memory → row mapping** — `answers[paperId][index]` ↔ `question_progress`
  (SUPABASE_PLAN §9). The UI cache design is intact.
- **Seed plan** — `questions.js` authored-shape extraction, `correctAnswer` int→letter,
  per-paper seed JSON (SEED_DATA_PLAN §1–6). Same transforms; only the **load target**
  changes from Supabase to "POST to a FastAPI admin/import path or direct psql insert".
- **questions.js untouched** — still the single authoring source (SEED_DATA_PLAN §7).

## 5. Which Parts Must Change

Everything Supabase-specific. The data and rules stay; the mechanism changes.

### 5a. Supabase Auth → app-level auth
- No `auth.users` table, no Supabase Auth.
- `user_id` becomes a column the **backend** sets, not one Supabase injects.
- Phase 1: **one-user mode** or a **single shared password** → a fixed/derived
  `user_id`. Phase 2: real **JWT** issued by FastAPI (§8).

### 5b. RLS → query-level scoping in FastAPI
- Drop `enable row level security` + all `auth.uid() = user_id` policies.
- Equivalent guarantee moves into the backend: **every progress/session query filters
  `WHERE user_id = <authenticated user>`**, taken from the auth token, never from the
  request body. This is the security-critical replacement — RLS was the only thing
  stopping user A reading user B's rows; now FastAPI must enforce it on every endpoint.

### 5c. Supabase client → `fetch` to FastAPI
- No `@supabase/supabase-js`. The app calls `fetch('/api/...')` with the auth token in
  an `Authorization` header.
- Load/save flows (SUPABASE_PLAN §10–11) keep the same **shape**, just different calls:
  `supabase.from('question_progress').upsert(...)` → `POST /api/progress`.

### 5d. SQL schema adjustments (vs `supabase/schema.sql`)
Mostly drop the Supabase-only bits; the table columns and constraints stay:

| Item in schema.sql | Oracle/Postgres change |
|---|---|
| `references auth.users (id)` on `question_progress`/`quiz_sessions` | Point `user_id` at a **local `users` table** (§6), or keep it a plain `uuid`/`text` with no FK in one-user mode. |
| RLS `enable row level security` + TODO policies | **Remove** — scoping handled in FastAPI (§5b). |
| `set_updated_at()` trigger | **Keep** — plain Postgres, works as-is. |
| `guard_furthest_index()` trigger | **Keep** — it's the DB-level enforcement of the no-regress rule (§9); valuable now that RLS/Supabase aren't there. |
| `gen_random_uuid()` | **Keep** — needs `pgcrypto` (or `gen_random_uuid` built in on PG13+). Note in deploy. |
| `exam_sets`, `questions`, `question_progress`, `quiz_sessions` columns + unique keys | **Unchanged.** |

> Net: the existing draft schema is ~90% reusable. Add a `users` table, drop RLS,
> retarget the `user_id` FK, keep both triggers.

## 6. Suggested Database Tables

Same four content/progress tables as the Supabase draft, **plus a local `users` table**
(Supabase Auth previously owned users).

### users *(new — replaces `auth.users`)*
| column | type | notes |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `username` | text unique | login id; in one-user mode a single seeded row |
| `password_hash` | text | bcrypt/argon2; null/placeholder in shared-password mode |
| `created_at` | timestamptz | default now() |

### exam_sets *(unchanged from schema.sql)*
PK `id` text (`fe-2025-a-public`), `title`, `description`, `question_count`, timestamps.

### questions *(unchanged)*
`id` uuid, `exam_set_id` FK, `number` int, `body` jsonb, `options` jsonb,
`correct_answer` text (ア/イ/ウ/エ), `explanation` text, `image_path` text null,
unique `(exam_set_id, number)`.

### question_progress *(FK retargeted)*
`id`, `user_id` → **`users.id`**, `exam_set_id`, `question_id`, `selected`,
`submitted`, `is_correct`, `updated_at`, unique `(user_id, exam_set_id, question_id)`.

### quiz_sessions *(FK retargeted)*
`id`, `user_id` → **`users.id`**, `exam_set_id`, `current_question_index`,
`furthest_question_index`, `updated_at`, unique `(user_id, exam_set_id)`.
`furthest_question_index` kept monotonic by the `guard_furthest_index()` trigger.

## 7. Proposed Backend Endpoints

All under `/api`. User-scoped endpoints take the user from the **auth token**, never
the body. JSON in/out.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | none | Health check — `{ "status": "ok" }`. Liveness for Nginx/systemd/monitoring. |
| `GET` | `/api/exam-sets` | none/optional | List exam sets (papers) — id, title, description, question_count. |
| `GET` | `/api/exam-sets/{exam_set_id}/questions` | none/optional | Get all questions for one paper (ordered by `number`). |
| `GET` | `/api/progress?exam_set_id=…` | required | Get the user's `question_progress` rows for a paper (hydrate on load). |
| `POST` | `/api/progress` | required | Save/upsert one answer: `{exam_set_id, question_id, selected, submitted, is_correct}` on `(user_id, exam_set_id, question_id)`. |
| `GET` | `/api/session?exam_set_id=…` | required | Get the user's `quiz_sessions` row (resume point) for a paper. |
| `PUT` | `/api/session` | required | Upsert session: `{exam_set_id, current_question_index, furthest_question_index}`; furthest clamped non-regressing. |

- Maps directly to SUPABASE_PLAN load (§11) and save (§10) flows.
- Content endpoints (exam-sets, questions) are global/read-only — match the
  "questions are not user data" note (SUPABASE_PLAN §6). May stay public, or require
  auth if the app is gated.

## 8. Security Plan

Phased — start minimal, harden once it works.

**Phase 1 — one-user / simple password**
- Single seeded `users` row (you). Either:
  - **One-user mode:** backend hardcodes/derives a single `user_id`; no login UI; reach
    the API only over HTTPS + a shared secret header. Simplest.
  - **Simple password:** one shared password checked by FastAPI; on success the app
    holds an opaque session token. `password_hash` stored hashed (argon2/bcrypt), never
    plaintext, never in the repo.
- **Critical regardless of mode:** every user-scoped query filters `WHERE user_id = …`
  from the server-side identity — this is the RLS replacement (§5b). Never trust a
  `user_id` sent by the client.

**Phase 2 — JWT auth**
- FastAPI issues a signed **JWT** on login; client sends `Authorization: Bearer <jwt>`.
- Backend verifies signature + expiry, extracts `user_id` from claims, scopes all
  queries by it. Enables real multi-user without changing the table model.
- Secrets (JWT signing key, DB password) in environment variables (§9-deploy), not code.

> Do not skip the per-query `user_id` filter even in one-user mode — it's the
> invariant that keeps the system correct when phase 2 adds real users.

## 9. Sync Rules (carried from SUPABASE_PLAN, re-affirmed)

- **Backend database is the source of truth.** Postgres on the Oracle VM is
  authoritative. In-memory state + any localStorage are **cache only**, never the DB.
- **On load:** read backend first (`GET /api/session` + `GET /api/progress`), hydrate
  the in-memory `answers` store, restore current paper + question.
- **On submit:** write to backend (`POST /api/progress`, `PUT /api/session`) **before**
  advancing to the next question. On failure, surface retry — don't advance as if saved.
- **Progress scope:** one row per `(user_id, exam_set_id, question_id)` — user + paper +
  question. Re-answering upserts the same row; last-write-wins by `updated_at`.
- **Session scope:** one row per `(user_id, exam_set_id)` — user + paper.
- **`furthest_question_index` must not regress** — monotonic high-water mark. A stale
  client reporting a lower furthest must not lower it. Enforced **twice**: clamp in the
  FastAPI handler (`max(stored, incoming)`) **and** the `guard_furthest_index()` DB
  trigger as backstop. `current_question_index` may move freely.

## 10. Deployment Notes for Oracle

- **FastAPI behind Nginx**
  - FastAPI runs under an ASGI server (uvicorn, or gunicorn+uvicorn workers) bound to
    `127.0.0.1:8000` (not public).
  - **Nginx** is the public entry: terminates TLS (HTTPS), serves the static frontend,
    reverse-proxies `/api/*` → `127.0.0.1:8000`. Open only 80/443 in the Oracle security
    list + VM firewall; keep 8000 and Postgres 5432 local-only.
- **PostgreSQL local on the VM**
  - Postgres installed on the same VM, listening on `localhost` only. Create a dedicated
    DB + role for the app (least privilege). Run the (adjusted, §5d) schema once.
  - Enable `pgcrypto` if `gen_random_uuid()` isn't built in.
  - Backups: scheduled `pg_dump` (cron) off the VM.
- **Environment variables** (never committed)
  - `DATABASE_URL` — Postgres DSN (`postgresql://user:pass@localhost:5432/fequiz`).
  - `JWT_SECRET` — signing key (phase 2).
  - `APP_PASSWORD_HASH` / shared-secret — phase 1 auth.
  - `CORS_ORIGINS` — allowed frontend origin(s).
  - Load via a `.env` (gitignored) read by the systemd unit, or systemd `Environment=`.
- **systemd service**
  - A unit (e.g. `fequiz-api.service`) runs uvicorn/gunicorn, `Restart=always`, starts on
    boot, runs as a non-root app user, with `EnvironmentFile=` for the vars above.
  - Nginx and Postgres run as their own systemd services. `journalctl -u fequiz-api` for
    logs.

## 11. Implementation Phases

1. **Provision** — Oracle VM ready: install Postgres, Python/uvicorn, Nginx; open
   80/443 only; create app DB + role.
2. **Schema** — adapt `supabase/schema.sql` per §5d (add `users`, drop RLS, retarget FK,
   keep triggers); run once against the local Postgres. *(Separate SQL doc/file later —
   not created by this plan.)*
3. **Content load** — import `exam_sets` + `questions` from `questions.js` using the
   existing SEED_DATA_PLAN transforms, targeting the FastAPI import path or direct psql.
4. **Backend skeleton** — FastAPI app, DB connection, `GET /api/health`, content
   endpoints (`/api/exam-sets`, `…/questions`). No auth yet.
5. **Auth phase 1** — one-user/shared-password; server-side `user_id`; per-query scoping.
6. **Sync endpoints** — `GET/POST /api/progress`, `GET/PUT /api/session` with the §9
   rules (write-before-advance, last-write-wins, furthest clamp).
7. **Frontend swap** — replace the (planned) Supabase client calls with `fetch` to the
   above; load path + save path per §9. App quiz logic unchanged.
8. **Deploy** — Nginx + TLS + systemd unit; env vars; `pg_dump` backup cron.
9. **Auth phase 2** — upgrade to JWT (§8); enables real multi-user, no table changes.

> No code, SQL, or app changes are produced by this plan. Next concrete step: phase 1
> (provision) → phase 2 (adapt schema in a new SQL file).
