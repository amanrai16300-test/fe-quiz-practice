# FE Study Phase 2A Question Contract Implementation Plan

> **For agentic workers:** Execute inline task-by-task. Do not delegate, commit, push, deploy, or begin Phase 2B. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one normalized runtime question contract, label-based answer identity, and safe `labels-only`/`structured-text` rendering without breaking existing A/B quiz behavior.

**Architecture:** Normalize static and API question shapes once at the loader boundary, then let the shared renderer consume only normalized fields. Keep Japanese labels canonical through selection, verdict, translation, and progress; use positional labels only for legacy static data. Persist optional `optionMode` in existing question JSONB and expose it additively through the current API.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS Grid, JSON seed data, Node PostgreSQL importer, FastAPI, local headless browser checks.

## Global Constraints

- Phase 2A only: no textbooks, lightbox, zoom/pan, framework migration, schema redesign, or Translation UX redesign.
- No relational schema, progress/reset API, localStorage key, sync, auth, Nginx, or systemd changes.
- Current image audit is authoritative: A Q3/Q14 and B Q1–Q6 do not contain complete answer groups, so they remain `structured-text`.
- A malformed label contract must log a console error and must not permit false correctness.
- Do not commit, push, or deploy.

---

### Task 1: Normalize every loaded question

**Files:**
- Modify: `app.js`

**Interfaces:**
- Produces: `normalizeQuestion(rawQuestion, options)` returning `id`, `number`, `sourceImages`, `optionDisplayMode`, `optionLabels`, `structuredOptions`, `correctAnswerLabel`, `questionTranslation`, `optionTranslationsByLabel`, `explanation`, `supplementalHtml`, and `metadata`.
- Consumes: current static `questions.js` fields and current API snake/camel fields.

- [ ] Normalize singular and ordered image paths into `{path, alt, caption}[]`.
- [ ] Prefer explicit non-empty unique labels; use `ア`–`コ` positional fallback only when every label is absent.
- [ ] Normalize index or label answers to `correctAnswerLabel` and reject non-membership.
- [ ] Default absent display mode to `structured-text`; reject unknown modes.
- [ ] Retain an independent normalized A fallback before API source switching.

### Task 2: Make the shared controller label-based

**Files:**
- Modify: `app.js`

**Interfaces:**
- Selection/store shape: `{selected: string|null, submitted: boolean, isCorrect: boolean|null}`.
- Progress payload remains `selected_answer: string|null`.

- [ ] Render images from `sourceImages` in authored order.
- [ ] Render translations by `optionTranslationsByLabel[label]`.
- [ ] Render both modes through the same native button/select/submit/verdict path.
- [ ] Compare selected label with `correctAnswerLabel` and restore API labels only when valid for that question.
- [ ] Preserve A supplemental HTML priority and all explanation/navigation behavior.

### Task 3: Add substantial responsive label controls

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Interfaces:**
- Adds: `qImages` ordered image container and `answerPrompt` text shown only in `labels-only` mode.
- Reuses: existing `.option` selected/correct/incorrect/disabled/focus states.

- [ ] Replace singular/multiple image DOM branches with one image container.
- [ ] Add a four-column desktop and two-column narrow-phone label grid with at least 48px control height.
- [ ] Hide main Japanese transcription and option wording only for `labels-only` image-first questions.
- [ ] Keep structured option layout and dark-mode neutral image canvas unchanged in meaning.

### Task 4: Persist and validate explicit display policy

**Files:**
- Modify: `seed/fe-2025-b-public.json`
- Modify: `scripts/import_seed_oracle.js`
- Modify: `oracle/backend/main.py`

**Interfaces:**
- Seed/body/API optional field: `optionMode`, values `labels-only|structured-text`.

- [ ] Mark B Q1–Q6 explicitly `structured-text` because their images omit complete answer groups.
- [ ] Validate non-empty/unique explicit labels, answer membership, and recognized mode before database writes.
- [ ] Store `optionMode` in existing `questions.body` JSONB and return it additively from the current question route.

### Task 5: Verify regressions and record the checkpoint

**Files:**
- Modify: `docs/PROJECT_CONTEXT.md` (append only)

**Interfaces:**
- Uses: checked-in A static data and B seed-backed local API fixtures.

- [ ] Run JavaScript/Python syntax and JSON contract checks.
- [ ] Browser-check A structured text, Q3/Q14 images, Q6/Q19 supplemental HTML, correct/wrong answers, Translation, explanation, and label restore.
- [ ] Browser-check B 4/6/7/10 option counts, label order, correct/wrong verdicts, Translation labels, image visibility, and restored labels.
- [ ] Exercise `labels-only` with a controlled image-complete fixture and confirm Japanese option text is omitted.
- [ ] Check Hub/Past Exams/quiz navigation, light/dark mode, and no page overflow at 320px, iPhone width, and desktop.
- [ ] Append Phase 2A architecture, verification, deployment requirements, and Phase 2B remainder.
