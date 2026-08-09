# FE Study Hub Phase 1 Implementation Plan

> **For agentic workers:** Execute inline task-by-task. Do not delegate, commit, push, deploy, or begin Phase 2.

**Goal:** Replace the current paper-selection home with a three-category Study Hub, move existing year/paper selection under Past Exams, and preserve the existing quiz boundary.

**Architecture:** Keep the no-build vanilla HTML/CSS/JS application. Add two explicit frontend views, `studyHub` and `pastExams`, alongside the existing `quizApp`; a static `STUDY_SOURCES` catalog renders the three hub entries, while existing `EXAM_SETS`, `buildPapers()`, and `startPaper()` continue to own Past Exam behavior.

**Tech Stack:** HTML5, CSS custom properties/grid/media queries, vanilla JavaScript, local HTTP server, Playwright browser checks.

## Global Constraints

- Phase 1 information architecture and frontend navigation only.
- Exactly three top-level categories.
- Past Exams is enabled; Book 1 and Book 2 are non-interactive coming-soon entries with no fake data.
- Do not change quiz rendering, answer behavior, translation, explanations, images, progress payloads, localStorage keys, backend, schema, seed data, or `exam_set_id` values.
- Reuse current light/dark tokens and preserve 320 px layout.
- Do not commit, push, deploy, or run unrelated tests.

---

### Task 1: Add explicit Study Hub and Past Exams views

**Files:**
- Modify: `index.html:9-44`

**Interfaces:**
- Produces DOM IDs `studyHub`, `studySourceList`, `pastExams`, `studyHubBackBtn`, `paperList`, and the existing `sourceStatus`.
- Preserves existing quiz DOM IDs and script order.

- [ ] Replace the current home heading/list with a Study Hub header and empty `studySourceList`.
- [ ] Keep the sync-code card inside Study Hub.
- [ ] Add a hidden Past Exams screen containing Back to Study Hub, title/subtitle, `sourceStatus`, and existing `paperList` target.
- [ ] Update document title to FE Study Platform.
- [ ] Keep theme toggle outside all views.

### Task 2: Add catalog-driven view navigation

**Files:**
- Modify: `app.js:5-43`
- Modify: `app.js:367-552`
- Modify: `app.js:827-841`

**Interfaces:**
- `STUDY_SOURCES`: exactly three descriptors `{id, title, japaneseTitle, description, marker, tone, available}`.
- `showStudyHub()`: hides Past Exams/quiz and clears only active quiz view-state.
- `showPastExams()`: hides Study Hub/quiz and clears only active quiz view-state.
- `buildStudyHub()`: renders one enabled Past Exams card and two disabled textbook cards.
- Existing `startPaper(paper, options)` remains the quiz-loading boundary.

- [ ] Extend `els` with the new view/list/back IDs.
- [ ] Define the static catalog with no textbook chapters/counts/progress.
- [ ] Render semantic `<article>` cards with actual buttons; disabled entries use disabled buttons.
- [ ] Replace `showHome()` with explicit hub/past-exam view functions.
- [ ] On question load failure, return to Past Exams.
- [ ] On quiz Back, return to Past Exams without deleting answer data.
- [ ] On refresh with an active paper, preserve current `startPaper(..., {reopen:true})` behavior; otherwise show Hub.
- [ ] Leave render/answer/API/progress/reset implementations byte-for-byte unchanged.

### Task 3: Style shared category and Past Exams layouts

**Files:**
- Modify: `style.css:4-176`
- Modify: `style.css:644-719`

**Interfaces:**
- Reuses current `--paper`, `--card`, `--ink*`, `--line`, `--accent*`, `--radius*`, and `--shadow` tokens.
- Adds source accent tokens with light/dark values.

- [ ] Add a wider Study Hub shell and keep Past Exams at the current readable width.
- [ ] Render desktop category grid in three columns and mobile as one column.
- [ ] Give Past Exams an enabled state and both books restrained disabled states.
- [ ] Preserve common card/button vocabulary, focus visibility, touch targets, and no horizontal overflow.
- [ ] Keep existing quiz CSS unchanged.

### Task 4: Verify scope and append project checkpoint

**Files:**
- Modify: `docs/PROJECT_CONTEXT.md` (append only)

**Interfaces:**
- Uses local `python -m http.server 5173` and Playwright.

- [ ] Run syntax/static checks for missing DOM IDs and JavaScript parse errors.
- [ ] Browser-check fresh Hub, exact category count, disabled textbooks, Past Exams navigation, A quiz, answer/back/resume, B image, translation, explanation, theme refresh, and mobile layouts.
- [ ] Confirm zero console errors attributable to navigation.
- [ ] Compare backend/schema hashes with the pre-change hashes.
- [ ] Confirm no Phase 2 strings/features were added.
- [ ] Append a checkpoint covering Hub, hierarchy, placeholders, preserved quiz behavior, unchanged backend/schema, theme, and responsive checks.

