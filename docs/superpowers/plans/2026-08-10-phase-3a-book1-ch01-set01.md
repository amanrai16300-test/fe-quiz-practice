# Phase 3A Book 1 Chapter 1 Practice Set 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Book 1, Chapter 1, Practice Set 1 as a six-question image-first textbook slice through the existing quiz engine and progress APIs.

**Architecture:** Keep hierarchy and quiz context in declarative frontend catalog data. Terminal catalog entries use the existing `exam_set_id` loader, normalizer, answer controller, progress/reset/sync APIs, and renderer. Carry optional display identity in existing question JSONB; derive book/chapter totals from submitted per-set progress without database counters.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node.js seed importer, FastAPI/Psycopg, PostgreSQL JSONB, existing headless browser checks.

## Global Constraints

- Implement only Book 1 → Chapter 1 → Practice Set 1 (`book1-ch01-set01`) with six questions.
- Practice Set 2 and Book 2 remain visible and unavailable.
- Reuse existing generic quiz and `/api/fe/exam-sets` plus `/api/fe/progress` routes.
- Keep question numbers contiguous `1`–`6`; render optional `displayNumber` values `1-1`–`1-6`.
- Every question explicitly uses `optionMode: "labels-only"`, labels `ア イ ウ エ`, and one existing source PNG.
- Never alter the six PNG assets.
- No schema migration, framework migration, new auth, new route family, separate importer, or separate textbook controller.
- Preserve Past Exam context behavior and all A/B content.
- Do not commit, push, deploy, or production-check.

---

### Task 1: Generic Catalog Navigation and Rollups

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Consumes: existing `STUDY_SOURCES`, `startPaper(paper)`, `answers[examSetId]`, and `GET /api/fe/progress/{examSetId}`.
- Produces: declarative Book/Chapter/Set nodes, one reusable catalog browser, and derived `{ submitted, total, action }` presentation.

- [ ] **Step 1: Add one reusable catalog browser DOM**

Add a hidden `<main id="catalogBrowser">` containing a back button, kicker, title,
subtitle, overall progress, and `<ul id="catalogList">`. Do not add Book-specific quiz DOM.

- [ ] **Step 2: Extend catalog data declaratively**

Make `textbook-1` available and give it one Chapter 1 node. Give Chapter 1 two set
nodes: available `book1-ch01-set01` with `questionCount: 6`, `contextPolicy:
"textbook"`, breadcrumb copy, and parent destination; unavailable Practice Set 2
with no set ID/questions. Leave `textbook-2` unavailable.

- [ ] **Step 3: Add generic catalog rendering/navigation**

Implement generic node lookup/render functions. Source actions route through node
configuration. Quiz Back uses its set's configured parent destination. Past Exams
continues routing to the existing Past Exam screen.

- [ ] **Step 4: Derive progress and action labels**

For each available terminal set, derive submitted count from current in-memory
answer state when present; otherwise GET existing progress. Sum only available
descendant sets. Render `Start` at 0, `Continue` at 1–5, and `Review` at 6. Never
persist book/chapter counters.

- [ ] **Step 5: Add responsive catalog styles**

Reuse current cards/buttons/tokens. Add compact progress and disabled state rules;
ensure 320 px and 390 px layouts wrap without page overflow.

### Task 2: Generic Display Number Contract

**Files:**
- Modify: `app.js`
- Modify: `scripts/import_seed_oracle.js`
- Modify: `oracle/backend/main.py`

**Interfaces:**
- Consumes: authored `question.displayNumber` and existing `questions.body` JSONB.
- Produces: normalized `displayNumber` used by header, image alt, errors, and navigator.

- [ ] **Step 1: Normalize optional display identity**

Use `raw.displayNumber` when non-empty; otherwise preserve the existing Past Exam
`問N` derivation. Keep internal contiguous order and progress mappings unchanged.

- [ ] **Step 2: Persist display identity additively**

When present, write `displayNumber` into `questions.body`; do not add a column.

- [ ] **Step 3: Return display identity additively**

Flatten `body.displayNumber` from the existing question endpoint. Do not change
routes or progress payloads.

### Task 3: Textbook Seed and Generic Validation

**Files:**
- Create: `seed/book1-ch01-set01.json`
- Modify: `scripts/import_seed_oracle.js`
- Preserve: `public/questions/book1/ch01/set01/q01.png` through `q06.png`

**Interfaces:**
- Consumes: current A/B seed envelope and exact user-supplied transcription/key.
- Produces: generic importable six-question set.

- [ ] **Step 1: Author exact set envelope**

Use ID `book1-ch01-set01`, title `Book 1 — Chapter 1 — Practice Set 1`, supplied
description, count 6, contiguous numbers, display numbers `1-1`–`1-6`, exact
transcriptions/options, exact PNG paths, and explicit labels-only mode.

- [ ] **Step 2: Author complete explanations**

Each question contains ELI5, technical breakdown, analysis for every wrong label,
and `Correct answer: X`. No placeholder/TODO text.

- [ ] **Step 3: Verify answer key mathematically**

Assert: `2^8=256 → エ`; `1/20` non-terminating in base 2 → ア; `3A.5C =
3735/64 → イ`; `1/2` terminates in base 8 → ウ; denominator `2^n` terminates in
decimal → ア; `2A.4C` set bits match option ア.

- [ ] **Step 4: Strengthen generic validation**

Require non-empty explanations, reject TODO placeholders, validate optional
display numbers, and verify every referenced source path resolves to an existing
file beneath repository `public/questions`. Retain A/B compatibility.

### Task 4: Context and Shared Quiz Behavior

**Files:**
- Modify: `app.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `QUIZ_CONTEXT_POLICIES.textbook` and terminal set catalog fields.
- Produces: textbook breadcrumb/back label, labels-only rendering, Language Help,
expanded explanations, shared resume/reset/sync behavior.

- [ ] **Step 1: Apply set context at `startPaper()`**

Set policy, breadcrumb/header text, image-primary behavior, and configured quiz-back
destination from generic set data. Reset context on each start so no source leaks.

- [ ] **Step 2: Use display numbers everywhere visible**

Render `1-1`–`1-6` in question title and navigator. Past Exams retain `問1` etc.

- [ ] **Step 3: Reuse labels-only and Language Help paths**

Default view contains image, collapsed Language Help, label-only answer buttons,
and Submit. Expanded Language Help omits Japanese duplicate rows while retaining
Romaji/English mapped by explicit label.

- [ ] **Step 4: Preserve shared progress behavior**

Continue saving Japanese labels and contiguous question numbers through existing
GET/POST/DELETE routes. Completion/action state depends on all six submitted, not
furthest index.

### Task 5: Verification and Checkpoint

**Files:**
- Modify: `docs/PROJECT_CONTEXT.md`

**Interfaces:**
- Consumes: completed implementation.
- Produces: reproducible verification evidence and append-only Phase 3A record.

- [ ] **Step 1: Run static/content checks**

Run `node --check app.js`, Python compile for `oracle/backend/main.py`, importer
validation for A/B/Book 1, JSON contract assertions, PNG existence/hash checks,
and `git diff --check`.

- [ ] **Step 2: Run headless browser checks**

Serve local files with controlled API fixtures. Verify Hub → Book 1 → Chapter 1 →
Set 1 → quiz; reverse Back path; source images; labels-only; Language Help mapping;
correct/wrong textbook expansion; A/B past-exam policies; label progress; resume;
reset isolation; progress rollups; Book 2/Set 2 unavailable; 320/390/desktop
overflow; dark image preservation; and zero runtime errors.

- [ ] **Step 3: Append Phase 3A checkpoint**

Record enabled hierarchy, set ID/count/key, labels-only/image-first behavior,
generic display number, rollups, shared progress/reset/sync, additive importer/API
changes, unchanged schema/Past Exams, deployment needs, and next work Practice Set 2.

- [ ] **Step 4: Self-review scope**

Confirm no PNG changed, no A/B content changed, no schema diff, no textbook engine
branch, no Practice Set 2 questions, and no Book 2 content.
