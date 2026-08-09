# FE Study Phase 2B Image, Language Help, and Explanation Implementation Plan

> **For agentic workers:** Execute inline task-by-task. Do not delegate, commit, push, deploy, or begin Phase 3. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve source-image resilience and enlargement, clarify Language Help, and apply accessible Past Exam explanation defaults without changing Phase 2A answer or progress contracts.

**Architecture:** Keep the no-build shared quiz engine. Render normalized `sourceImages` through one stateful DOM helper; use one static dialog-like lightbox for every image. Drive explanation disclosure from a context policy and keep learner toggles in a separate UI-only store.

**Tech Stack:** Vanilla JavaScript, semantic HTML, CSS Grid, native image events, headless Edge regression fixtures.

## Global Constraints

- Frontend-only Phase 2B.
- Do not change normalized labels, correctness, display modes, translations-by-label, progress payloads, restore, reset, sync, question counts, seeds, importer, backend, or schema.
- No dependencies, framework migration, textbook content, new assets, or advanced zoom library.
- Preserve safe explanation escaping and existing section content/styling.
- Do not commit, push, deploy, or begin Phase 3.

---

### Task 1: Resilient source-image component

**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Produces: `renderSourceImages(question)` and per-image loading, loaded, error, Retry, and Enlarge states.
- Consumes: normalized ordered `{path, alt, caption}[]` only.

- [ ] Render the first image eagerly and later images lazily without changing order.
- [ ] Add neutral loading placeholders that disappear on `load`.
- [ ] Replace failed images with friendly status plus Retry while leaving the quiz usable.
- [ ] Keep natural aspect ratio, centered fit, neutral canvas, and no forced raster upscaling.

### Task 2: Accessible shared lightbox

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Produces: `openImageLightbox(sourceImage, position, opener)` and `closeImageLightbox(options)`.
- Static DOM IDs: `imageLightbox`, `lightboxTitle`, `lightboxPosition`, `lightboxViewport`, `lightboxImage`, `lightboxClose`.

- [ ] Open each loaded image from a native button by pointer or keyboard.
- [ ] Close by explicit button, Escape, or unambiguous overlay click.
- [ ] Trap Tab focus, lock background scrolling, and return focus to the opener.
- [ ] Preserve image colors/aspect ratio and allow contained panning plus native mobile zoom.

### Task 3: Language Help hierarchy

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Keeps: `optionTranslationsByLabel[label]` as the only option mapping.
- Adds: semantic Question/Options headings, `aria-controls`, and image-primary Japanese visibility policy.

- [ ] Rename the disclosure to `🌐 Language Help` and keep it collapsed on every question render.
- [ ] Present Question Romaji then English, followed by scan-friendly labelled option rows.
- [ ] Hide duplicate Japanese help text only when current context says the source image is primary; retain all Japanese data.
- [ ] Preserve keyboard/focus behavior and ensure help never contains correctness state.

### Task 4: Declarative explanation disclosure policy

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Produces: `QUIZ_CONTEXT_POLICIES.pastExam.explanation` and UI-only `explanationStates`.
- Keeps: `renderExplanation(text)` unchanged as the sole safe content renderer.

- [ ] Keep verdict and correct-answer line visible after every submit.
- [ ] Default correct Past Exam explanations collapsed with `Review explanation`.
- [ ] Default wrong Past Exam explanations expanded with `Understand why`.
- [ ] Preserve a learner's disclosure choice when jumping away and back in-session.
- [ ] Leave a future textbook policy configurable without source-ID branching.

### Task 5: Regression verification and checkpoint

**Files:**
- Modify: `docs/PROJECT_CONTEXT.md` (append only)

**Interfaces:**
- Uses: A static fallback and B seed-backed local API browser fixtures.

- [ ] Browser-check loading, success, error, Retry, button/Escape/backdrop close, focus trap/return, and scroll lock.
- [ ] Verify A Q3/Q14 and B Q1–Q6 independently enlarge; verify A Q6/Q19 supplemental HTML.
- [ ] Verify Language Help default/hierarchy/label mapping for 4/6/7/10 choices.
- [ ] Verify correct-collapsed, wrong-expanded, toggle restore, and unchanged explanation sections.
- [ ] Verify navigation, progress requests, reset/sync surfaces, dark mode, iPhone width, and 320px overflow.
- [ ] Confirm no backend/schema/seed/importer diff and append the Phase 2B checkpoint.
