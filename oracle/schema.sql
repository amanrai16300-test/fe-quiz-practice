-- FE Quiz Practice — Oracle VM PostgreSQL schema draft
-- Source of truth (design): docs/ORACLE_BACKEND_PLAN.md
-- Compared against (not changed): supabase/schema.sql
-- DRAFT. Adapt env, then run once against the local Postgres on the Oracle VM.
--
-- This replaces the Supabase variant. Differences from supabase/schema.sql:
--   * Adds a LOCAL `users` table (no Supabase Auth / no auth.users).
--   * user_id foreign keys point at public.users, NOT auth.users.
--   * NO Row Level Security (RLS) — per-user access is enforced in FastAPI (§5b).
--   * Keeps all PKs, FKs, unique constraints, created_at/updated_at.
--   * Keeps set_updated_at() and guard_furthest_index() triggers.
--
-- ===========================================================================
-- SECURITY / SYNC MODEL — READ BEFORE WRITING ANY BACKEND QUERY
-- ===========================================================================
--   * SOURCE OF TRUTH: this database (Postgres on the Oracle VM) is authoritative.
--     In-memory state and any localStorage are cache only — never the main DB.
--   * PROGRESS SCOPE: question_progress is scoped per user + paper + question,
--     i.e. unique (user_id, exam_set_id, question_id).
--   * SESSION SCOPE: quiz_sessions is scoped per user + paper,
--     i.e. unique (user_id, exam_set_id).
--   * THERE IS NO RLS HERE. The database does NOT stop user A from reading
--     user B's rows. FastAPI MUST enforce user ownership on every user-scoped
--     query — always filter `WHERE user_id = <authenticated user>`.
--   * user_id MUST come from the authenticated server-side context/token
--     (session/JWT claim), NEVER from the request body or query string.
--     Trusting a client-supplied user_id = full data breach.
--   * furthest_question_index is a monotonic high-water mark: it must NOT
--     regress. Enforced in the FastAPI handler (max(stored, incoming)) AND by
--     the guard_furthest_index() trigger below as a backstop.

-- ---------------------------------------------------------------------------
-- Extension — gen_random_uuid(). Built into PG13+; pgcrypto provides it on
-- older versions. Safe to run if already present.
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — LOCAL accounts (replaces Supabase auth.users).
-- Phase 1: a single seeded row (one-user / shared-password mode).
-- Phase 2: real rows once FastAPI issues JWTs. Table shape unchanged either way.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,            -- login id
  password_hash text,                            -- argon2/bcrypt; never plaintext.
                                                 -- nullable for shared-password mode.
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- exam_sets — papers (global content, read-only to clients). Not user data.
-- ---------------------------------------------------------------------------
create table if not exists public.exam_sets (
  id             text primary key,               -- e.g. 'fe-2025-a-public'
  title          text not null,
  description    text,
  question_count int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- questions — questions per paper (global content, read-only to clients).
-- Not user data.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  exam_set_id    text not null references public.exam_sets (id) on delete cascade,
  number         int  not null,                  -- 問N within the paper; stable order
  body           jsonb not null,                 -- question text + ja/romaji/en translations
  options        jsonb not null,                 -- ア〜エ + per-option translations
  correct_answer text not null,                  -- ア / イ / ウ / エ
  explanation    text,                           -- ELI5 + breakdown + wrong-answer analysis
  image_path     text,                           -- nullable, e.g. public/questions/fe-2025-a/q03.png
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- one row per slot in a paper
  constraint questions_exam_set_number_key unique (exam_set_id, number)
);

-- ---------------------------------------------------------------------------
-- question_progress — per user, per paper, per question answer state.
-- SCOPE: one row per (user_id, exam_set_id, question_id).
-- CONFLICT: last-write-wins by updated_at (a question's answer is one value).
-- OWNERSHIP: FastAPI must filter WHERE user_id = <authenticated user>. No RLS.
-- ---------------------------------------------------------------------------
create table if not exists public.question_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  exam_set_id text not null references public.exam_sets (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected    text,                              -- ア / イ / ウ / エ
  submitted   boolean not null default false,
  is_correct  boolean,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint question_progress_user_set_question_key
    unique (user_id, exam_set_id, question_id)
);

-- ---------------------------------------------------------------------------
-- quiz_sessions — per user, per paper "where I am".
-- SCOPE: one row per (user_id, exam_set_id).
-- OWNERSHIP: FastAPI must filter WHERE user_id = <authenticated user>. No RLS.
-- furthest_question_index must NOT regress (high-water mark). Guarded by trigger.
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users (id) on delete cascade,
  exam_set_id             text not null references public.exam_sets (id) on delete cascade,
  current_question_index  int  not null default 0,   -- where the user is looking (may move freely)
  furthest_question_index int  not null default 0,   -- high-water mark; never decreases
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint quiz_sessions_user_set_key unique (user_id, exam_set_id)
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance — bump updated_at on every row update.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_exam_sets_updated_at
  before update on public.exam_sets
  for each row execute function public.set_updated_at();

create trigger trg_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

create trigger trg_question_progress_updated_at
  before update on public.question_progress
  for each row execute function public.set_updated_at();

create trigger trg_quiz_sessions_updated_at
  before update on public.quiz_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- furthest_question_index guard — never let it regress.
-- Clamps any update that tries to lower it back up to the stored value.
-- Protects against a stale client reporting a lower furthest index.
-- (FastAPI also clamps with max(stored, incoming); this is the DB backstop.)
-- ---------------------------------------------------------------------------
create or replace function public.guard_furthest_index()
returns trigger language plpgsql as $$
begin
  if new.furthest_question_index < old.furthest_question_index then
    new.furthest_question_index = old.furthest_question_index;
  end if;
  return new;
end;
$$;

create trigger trg_quiz_sessions_furthest_guard
  before update on public.quiz_sessions
  for each row execute function public.guard_furthest_index();

-- ===========================================================================
-- NOTE: No Row Level Security. Unlike supabase/schema.sql, there are no
-- `enable row level security` statements and no policies. Per-user isolation
-- is the FastAPI layer's job — every user-scoped query filters by the
-- server-derived user_id (token/session), never a client-supplied value.
-- ===========================================================================
