-- FE Quiz Practice — Supabase schema draft
-- Source of truth: docs/SUPABASE_PLAN.md
-- DRAFT. Do not run as a migration yet. Auth wiring is a later phase.
--
-- Sync rules (see SUPABASE_PLAN.md §4, §7, §12):
--   * Supabase is the source of truth. localStorage is cache only, never the main DB.
--   * question_progress is scoped per user + paper + question.
--   * quiz_sessions is scoped per user + paper.
--   * furthest_question_index is a monotonic high-water mark: it must NOT regress.
--     Enforce on write (upsert) and via the guard trigger below.

-- ---------------------------------------------------------------------------
-- exam_sets — papers (global, read-only to clients). Not user data.
-- ---------------------------------------------------------------------------
create table if not exists public.exam_sets (
  id             text primary key,            -- e.g. 'fe-2025-a-public'
  title          text not null,
  description    text,
  question_count int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- questions — questions per paper (global, read-only to clients). Not user data.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  exam_set_id    text not null references public.exam_sets (id) on delete cascade,
  number         int  not null,               -- 問N within the paper; stable order
  body           jsonb not null,              -- question text + ja/romaji/en translations
  options        jsonb not null,              -- ア〜エ + per-option translations
  correct_answer text not null,               -- ア / イ / ウ / エ
  explanation    text,                        -- ELI5 + breakdown + wrong-answer analysis
  image_path     text,                        -- nullable, e.g. public/questions/fe-2025-a/q03.png
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- one row per slot in a paper
  constraint questions_exam_set_number_key unique (exam_set_id, number)
);

-- ---------------------------------------------------------------------------
-- question_progress — per user, per paper, per question answer state.
-- Scope rule: one row per (user_id, exam_set_id, question_id).
-- Conflict rule: last-write-wins by updated_at (a question's answer is one value).
-- ---------------------------------------------------------------------------
create table if not exists public.question_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  exam_set_id text not null references public.exam_sets (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected    text,                           -- ア / イ / ウ / エ
  submitted   boolean not null default false,
  is_correct  boolean,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint question_progress_user_set_question_key
    unique (user_id, exam_set_id, question_id)
);

-- ---------------------------------------------------------------------------
-- quiz_sessions — per user, per paper "where I am".
-- Scope rule: one row per (user_id, exam_set_id).
-- furthest_question_index must NOT regress (high-water mark). Guarded by trigger.
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
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
-- This protects against a stale device reporting a lower furthest index.
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

-- ---------------------------------------------------------------------------
-- Row Level Security (DRAFT — enable now, exact policies land with auth wiring).
-- ---------------------------------------------------------------------------

-- Global content: world-readable, no client writes.
alter table public.exam_sets enable row level security;
alter table public.questions enable row level security;
-- TODO(auth): policy "exam_sets readable by all" using ( true ) for select.
-- TODO(auth): policy "questions readable by all"  using ( true ) for select.
-- Writes to exam_sets/questions are admin/service-role only (no client policy).

-- User data: each user sees and writes only their own rows.
alter table public.question_progress enable row level security;
alter table public.quiz_sessions     enable row level security;
-- TODO(auth): question_progress policies for select/insert/update/delete
--             using ( auth.uid() = user_id ) and with check ( auth.uid() = user_id ).
-- TODO(auth): quiz_sessions policies for select/insert/update/delete
--             using ( auth.uid() = user_id ) and with check ( auth.uid() = user_id ).
