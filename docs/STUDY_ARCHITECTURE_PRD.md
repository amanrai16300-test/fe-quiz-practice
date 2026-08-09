# FE Study Platform — Study Architecture PRD

**Status:** Draft for approval  
**Scope:** Product and architecture requirements only; no implementation is authorized by this document  
**Target release:** Next major redesign, delivered incrementally  
**Product:** FE Quiz Practice → FE Study Platform  
**Last updated:** 2026-08-10

---

## 1. Executive summary

FE Quiz Practice will evolve from a year/paper selector into one FE Study Platform with three top-level entrances:

1. Past Exam Questions
2. Textbook Practice — Book 1
3. Textbook Practice — Book 2

The redesign must retain one shared quiz engine. Categories supply navigation context, content, and presentation policy; they must not own separate answer, translation, explanation, progress, or sync implementations.

Future content is image-first. The authentic Japanese question—including its original options, tables, code, diagrams, formulas, and textbook layout—normally remains in one or more source images. Dynamic learning data remains separate: option labels, answer key, Romaji, English, explanations, metadata, and progress. OCR or HTML transcription may support accessibility/search/fallback, but must never replace the visible authoritative source image.

The current application already provides a useful migration base:

- a centralized `render()` / submit / feedback path in `app.js`;
- per-`exam_set_id` questions and progress API routes;
- per-paper answer, resume, sync, and reset behavior;
- dynamic translations and one shared explanation renderer;
- one or multiple images at runtime;
- current 科目B data with 4–10 labeled choices;
- a PostgreSQL schema whose JSONB question body can absorb Phase 2 display metadata without an immediate schema rewrite.

The recommended approach is incremental. Phase 1 adds the Study Hub and category navigation without changing the quiz engine or backend. Phase 2 normalizes the shared image-first question contract and quiz shell. Phase 3 adds Book 1 through the same generic catalog and set model. Phase 4 proves reuse with Book 2. Assessment and review features remain later work.

---

## 2. Product objective

Create a unified study product that lets a learner:

- choose past-exam or textbook study from a calm Study Hub;
- read authentic Japanese source material at a useful size;
- request Romaji/English help intentionally rather than seeing it by default;
- answer using the labels printed in the source image;
- learn through structured explanations;
- leave, resume, sync, and reset progress per question set;
- navigate years, papers, books, chapters, and optional topics without learning three different products.

### 2.1 Product goals

- Preserve all currently working 科目A and 科目B flows.
- Make image readability the dominant question-screen constraint.
- Establish one reusable content contract for past exams and both books.
- Allow question-specific labels and one or multiple source images.
- Keep learning assistance structured, accessible, dynamic, and independently editable.
- Reuse `exam_set_id`, progress endpoints, and current PostgreSQL tables until a concrete requirement makes extension necessary.
- Make later progress aggregation and review filters possible without building them now.

### 2.2 Product success measures

For the first redesign release:

- every user can identify the three study categories without scrolling on a typical desktop viewport;
- a 320 px wide viewport has no page-level horizontal overflow;
- all current 26 questions (20 科目A + 6 科目B) retain correct answers, translations, explanations, navigation, resume, sync, theme, and reset behavior;
- every question uses the same quiz controller and feedback pipeline;
- 4-, 6-, 7-, and 10-label current question sets render usable answer controls;
- API failure preserves the existing fallback policy and never displays the wrong set;
- no Phase 1 backend or database rewrite is required.

---

## 3. Current-state analysis

This section describes checked-in behavior, not older intentions. `docs/PROJECT_CONTEXT.md` is chronological and contains obsolete early checkpoints; current code and later checkpoints take precedence.

### 3.1 Current application architecture

The application is static HTML/CSS/JavaScript with no build step or frontend framework. `index.html` loads `questions.js` before `app.js`, and the latter consumes the global `QUIZ` fallback object.

| Concern | Current implementation | Evidence |
|---|---|---|
| Home/navigation | One home screen with year selector, paper cards, sync-code card | `index.html:21-42`, `app.js:367-552` |
| Shared quiz flow | `render()`, `selectOption()`, `submit()`, `applyVerdictUI()`, `next()` | `app.js:81-253`, `app.js:335-339` |
| Question navigation | Chip per question; active/answered states; direct jump | `app.js:100-105`, `app.js:341-357` |
| Images | Optional `imagePath`; ordered `imagePaths`; supplemental HTML fallback | `app.js:111-136` |
| Translation | Collapsed per question; question + option JP/Romaji/English | `app.js:138-163`, `index.html:74-89` |
| Explanations | One safe text parser for ELI5, technical, wrong-answer, correct-answer sections | `app.js:255-333` |
| Labels | Runtime global `LABELS` supports ア–コ; static `OPTION_LABELS` supports only ア–エ | `app.js:45-49`, `questions.js:9` |
| API loading | Per-set question route; Paper A static fallback; Paper B API-only | `app.js:571-668` |
| Progress | In-memory per-paper answers + backend GET/POST; selected answer serialized as a label | `app.js:59-79`, `app.js:727-786` |
| Resume | Local viewed index → backend current index → Q1 | `app.js:409-449` |
| Reset | Per-set DELETE plus local paper-state clear | `app.js:788-818` |
| Theme | Token-based light/dark theme in localStorage | `app.js:553-568`, `style.css:664-689` |

### 3.2 Current content

- `fe-2025-a-public`: 20 questions, four options each. Static fallback exists in `questions.js`; seed/API data exists in `seed/fe-2025-a-public.json`.
- `fe-2025-b-public`: 6 API-backed questions. Current counts are 6, 6, 4, 10, 7, and 10 options. Every question has a one-element `imagePaths` array pointing into `public/questions/fe-2025-b-public/`.
- 科目A Q3 and Q14 use singular `imagePath`; Q6 and Q19 have local `supplementalHtml` not currently present in the A seed/API body.
- 科目B seed entries contain both source images and supplemental HTML, but the renderer prioritizes `imagePaths`, so the HTML serves as fallback rather than simultaneous primary content.
- Seed options already have explicit `{label, jp, romaji, en}` fields. The client currently ignores `label` for display mapping and derives labels from array position.

### 3.3 Current backend and schema

Stable routes:

```text
GET    /api/fe/health
GET    /api/fe/exam-sets
GET    /api/fe/exam-sets/{exam_set_id}/questions
GET    /api/fe/progress/{exam_set_id}
POST   /api/fe/progress/{exam_set_id}
DELETE /api/fe/progress/{exam_set_id}
```

Progress routes require `X-FE-User-Key`. The backend derives `user_id` from this header; `user_id` is never accepted from the request body. Progress is isolated by `(user_id, exam_set_id, question_id)`, and session state by `(user_id, exam_set_id)`. `furthest_question_index` is monotonic at both API and trigger layers.

The schema provides:

- `exam_sets(id, title, description, question_count, ...)`;
- `questions(exam_set_id, number, body jsonb, options jsonb, correct_answer, explanation, image_path, ...)`;
- `question_progress` for selected/submitted/correct state;
- `quiz_sessions` for current/furthest indices.

This is already a generic question-set and progress model despite exam-specific names.

### 3.4 Current constraints and debt relevant to this redesign

- `app.js` mutates the global `QUIZ.questions` array when switching sources; the original fallback is not retained independently.
- Question-to-progress mapping assumes `number === index + 1`.
- `LABELS` is global, capped at ア–コ, and remains an implicit source of truth even though seed options contain labels.
- Singular `image_path` and camel-case `imagePaths` coexist.
- Current options always render Japanese text below the source image, duplicating image-contained options.
- API/static content has drift: A supplemental HTML is local-only; B is API-only.
- `supplementalHtml` and generated image markup are trusted `innerHTML` boundaries.
- Generic image alt text does not make dense image content accessible.
- “Saved locally” on sync failure means memory-only submitted answers; refresh can lose them.
- Current shared sync code is convenient identity, not secure authentication.
- Backend `completed` means the last index was reached, not every question was answered.

These are migration risks, not reasons for a rewrite.

---

## 4. Image-first content principle

The source image is the authoritative visual representation for almost all new questions.

```text
Original Japanese source
        |
        v
Ordered source image(s)  <--- authoritative visible content
        |
        +--> learner reads question/options/diagram/code/table/formula

Separate learning data
        +--> labels + correct answer
        +--> Romaji + English
        +--> explanation + metadata
        +--> progress
```

### 4.1 Hard rules

- Do not replace the visible source with OCR text.
- Do not reconstruct dense Japanese source layouts in HTML by default.
- Do not bake translations, explanations, answers, or progress into images.
- Do not duplicate Japanese option wording below an image when the image already contains it.
- Keep Japanese transcription as optional supporting data for accessibility, search, or structured fallback—not as the primary visible source.
- Preserve image order. Multiple images are one logical source-visual sequence.
- Prefer one consolidated image when it is clearer; support several when page/figure separation improves readability.

### 4.2 Layer contract

| Layer | Owns | Must not own |
|---|---|---|
| Source visual | Authentic Japanese layout, source options, diagrams, code, tables, formulas | Translations, correct-answer reveal, explanations, progress |
| Answer model | Ordered explicit labels, correct label | Recreated source wording unless structured-text mode requires it |
| Language help | Japanese transcription if available, Romaji, English, label-mapped option translations | Rasterized translation images |
| Explanation | Feedback and learning sections | Source question image |
| Classification | Category/year/book/chapter/topic/set metadata | Answer state |
| Progress | User selection, submission, correctness, resume/reset | Duplicated content metadata |

---

## 5. Product design principles

1. **Japanese first.** Source image appears before optional language help.
2. **One engine, many contexts.** A question-set descriptor configures one quiz shell.
3. **Image readability beats density.** Do not shrink the source merely to fill a desktop column.
4. **Labels are data.** Every option label comes from the question, never a global four-choice assumption.
5. **Progress is question-derived.** Chapter/book rollups are computed from question progress where feasible.
6. **Incremental compatibility.** Existing text options, singular images, supplemental HTML, and API fallback remain supported during migration.
7. **Source identity is stable.** `exam_set_id` remains the internal generic set key.
8. **Shared visual system.** Categories gain accents/icons, not separate component libraries.
9. **Failure is contained.** A failed set load cannot leak another set’s questions or erase progress.
10. **Accessibility is parallel, not substitutive.** Text alternatives augment source images rather than hiding them.

---

## 6. Information architecture

```text
                              FE STUDY HUB

                  +---------------+---------------+
                  |               |               |
                  v               v               v

             PAST EXAMS      TEXTBOOK 1      TEXTBOOK 2
                  |               |               |
                 Year           Chapter         Chapter
                  |               |               |
              科目A / B          Topic?          Topic?
                  |               |               |
             Question Set    Question Set    Question Set

                  +---------------+---------------+
                                  |
                                  v

                         SHARED QUIZ ENGINE
                                  |
                 +----------------+----------------+
                 |                |                |
                 v                v                v
           Source Images     Language Help    Answer Model
             ordered           dynamic       explicit labels
                 |                |                |
                 +----------------+----------------+
                                  v
                               Submit
                                  v
                              Feedback
                                  v
                             Explanation
                                  v
                               Progress
```

### 6.1 Route/state model

The current static app need not adopt a framework router in Phase 1. It must, however, model navigation explicitly so browser history or real routes can be added later.

```text
hub
category(past-exams | textbook-1 | textbook-2)
collection(year | book)
section(paper | chapter)
topic(optional)
quiz(exam_set_id, question index)
```

Recommended URL-compatible shape for later:

```text
/#/study
/#/study/past-exams/2025/section-a
/#/study/textbook-1/network/tcp-ip
/#/quiz/{exam_set_id}/{question-number}
```

Phase 1 may use in-memory view state plus History API only if navigation semantics are clear. Do not introduce React/Vue/router dependencies.

---

## 7. Study Hub

The home screen becomes a focused hub with exactly three primary category cards.

### 7.1 Card content

Each card contains, in order:

- category icon with decorative/accessible handling;
- English title;
- optional short Japanese secondary title;
- one-line description;
- completed/total summary when data is available;
- one primary stateful action: **Start**, **Continue**, or **Completed / Review**.

Reset and sync controls are secondary. Do not place per-set reset controls on the top-level hub. Keep the existing sync code in a low-emphasis account/sync area below the three entrances or behind a compact settings affordance.

### 7.2 Card states

| State | Definition | Primary action |
|---|---|---|
| Not started | No submitted progress under category | Start |
| In progress | At least one submitted question; incomplete sets remain | Continue |
| Completed | All included questions submitted, not merely last index reached | Review |
| Unavailable | Content intentionally not released | Coming soon, disabled; category still visible |
| Load error | Catalog/progress unavailable | Retry; do not masquerade as zero progress |

### 7.3 Layout

- Desktop: three equal-priority cards in a 3-column grid when space allows.
- Tablet: 2 + 1 grid is acceptable if visual weight remains balanced.
- Mobile: one card per row; no horizontal scrolling.
- Keep titles, progress, and actions aligned; avoid dashboards/charts on this screen.
- Category accents: Past Exams = document/exam accent; Book 1 and Book 2 = distinct book accents using shared tokens.

---

## 8. Past Exam flow

```text
Study Hub
  -> Past Exam Questions
      -> 2025
          -> 科目A 公開問題
          -> 科目B 公開問題
              -> shared quiz engine
```

### Requirements

- Retain the current year selector concept under Past Exams, not on the Study Hub.
- Future years are data entries, not new controller branches.
- Order years newest first; preserve Japanese era + Gregorian display where available.
- Paper cards show question count, submitted progress, and Start/Continue/Completed state.
- Reset stays scoped to an individual `exam_set_id` and appears on the paper screen/card after confirmation.
- 科目A may retain static fallback during migration. 科目B must retain graceful API-load failure behavior.
- Breadcrumb example: `Past Exams › 2025 › 科目A`.

Textbook chapters must never appear in the year selector.

---

## 9. Textbook flow

```text
Study Hub
  -> Textbook Practice — Book 1
      -> Chapter
          -> Topic (when authored)
              -> Question Set
                  -> shared quiz engine
```

Book 2 uses the same flow and data structure. There must be no `book1`-specific renderer/controller copied into `book2`.

### Requirements

- A book landing screen shows overall completed/total progress and its chapters.
- A chapter can link directly to a question set or reveal topic rows/cards.
- Topic is optional. A chapter with no topics must not show an empty intermediate screen.
- Start/Continue resolves to the first relevant incomplete question, otherwise the last viewed question according to the shared resume policy.
- Chapter and topic ordering is explicit metadata, not alphabetical inference.
- Hundreds of questions must remain navigable through chapter grouping and compact topic lists rather than one giant card grid.

---

## 10. Chapter/topic architecture

Use one generic catalog tree with optional nodes, then link terminal nodes to one or more existing generic question sets.

```text
StudySource
  id: textbook-1
  kind: textbook
  children:
    - Collection/Book
        children:
          - Chapter
              children:
                - Topic (optional)
                    questionSetIds: [...]
```

### Recommended behavior

- If a chapter contains direct sets only, selecting the chapter opens its chapter question list or resumes the set.
- If it contains topics, selecting the chapter opens a topic list.
- Do not create a fake “General” topic merely to satisfy a schema.
- Topic progress is the sum of question progress for its referenced sets.
- Chapter progress is the sum of its direct questions plus all topic questions.
- Book progress is the sum of all descendant questions, deduplicated by `(exam_set_id, question number/id)`.

### Chapter screen

Each chapter row/card shows title, completed/total, accuracy after at least one submitted answer, and one action. On mobile, metadata wraps beneath the title; actions remain at least 44×44 CSS px.

For many topics, prefer a compact vertical list with search/filter deferred to a future phase. Do not show nested cards within nested cards more than one level deep.

---

## 11. Shared quiz-engine architecture

The engine receives normalized content plus a context policy. It must not switch on concrete IDs such as `fe-2025-a-public` or `textbook-1`.

```text
Catalog selection
      |
      v
QuestionSet loader (API/fallback)
      |
      v
Question normalizer
  - sourceImages[]
  - optionLabels[]
  - optionDisplayMode
  - translations
  - explanation
      |
      v
Shared quiz controller/state
      |
      +--> shared question view
      +--> shared answer controls
      +--> shared language help
      +--> shared feedback/explanation
      +--> shared navigation/progress/reset/sync
```

### 11.1 Shared components/behaviors

- question-set loading and failure containment;
- question normalization and validation;
- source-image sequence;
- answer selection, submit, correct/wrong state, locking;
- label-to-answer mapping;
- translation accordion;
- explanation section renderer;
- question navigator and next behavior;
- progress summary, GET/POST/DELETE, resume, reset, sync;
- theme, focus, responsive behavior, loading/error states.

### 11.2 Source-specific context/policy

| Concern | Past exam | Textbook |
|---|---|---|
| Breadcrumb | Category › year › paper | Book › chapter › topic? |
| Number label | `問 7 / 20` | `Question 4 / 12` or localized equivalent |
| Explanation after correct | Collapsed; explicit Review explanation action | Expanded |
| Explanation after wrong | Expanded with “Understand why” focus | Expanded |
| Continue policy | Immediate Next available after submit | Next available; explanation remains visible for review |
| Default mode | Practice-like current flow | Practice Mode |
| Test Mode | Not part of initial redesign | Future |

Policy is declarative configuration, not a second engine.

---

## 12. Image-first question screen

```text
Past Exams › 2025 › 科目A
問 12 / 20

Progress / question navigation

+-------------------------------------+
|                                     |
|        ORIGINAL SOURCE IMAGE        |
|                                     |
| Japanese question                   |
| Japanese answer options             |
| tables / diagrams / code / etc.     |
|                                     |
+-------------------------------------+

          Tap / click to enlarge

+-------------------------------------+
| Language Help                    v  |
+-------------------------------------+

Select your answer

[ ア ]    [ イ ]    [ ウ ]    [ エ ]

              [ Submit ]

After submit:

Correct / Incorrect
Explanation
```

For more labels:

```text
[ ア ] [ イ ] [ ウ ] [ エ ]
[ オ ] [ カ ] [ キ ] [ ク ]
```

The source image is the dominant element. Question transcription must not consume equivalent visual weight above it. When needed, accessible/source notes can be attached beneath or inside Language Help.

---

## 13. Image component specification

### 13.1 Data input

The component accepts an ordered `sourceImages[]` array after normalization. Legacy singular `image_path`/`imagePath` becomes an array of one. Legacy `imagePaths` remains accepted until all data is normalized.

Each image item should support:

```text
path             required
alt              optional authored short alternative
caption          optional source/figure label
width/height     optional intrinsic dimensions for layout reservation
```

Do not require metadata backfill before rendering legacy images.

### 13.2 Rendering

- Preserve intrinsic aspect ratio with `height: auto`.
- Set `max-inline-size: 100%`; the page itself must never overflow horizontally.
- Use available container width up to a readable maximum; do not upscale small raster images beyond their useful sharpness by default.
- Render multiple images vertically in source order with consistent spacing.
- Reserve aspect-ratio space when dimensions exist to reduce layout shift.
- Use lazy loading for non-initial images; prioritize the current question’s first source image.
- Show a neutral skeleton/placeholder while loading.
- On error, show file-specific fallback text and Retry; do not hide answer controls or crash the question.
- In dark mode, preserve source image colors on a neutral light canvas/border unless an image is explicitly authored for dark mode. Never invert exam images.

### 13.3 Tall and wide content

- Tall images remain full-width and flow vertically; do not place them in a fixed-height scrolling box by default.
- Wide diagrams first fit to the viewport. Enlargement provides detail inspection.
- If fitting makes essential text unreadable, use the lightbox with pan/zoom rather than introducing page-level horizontal scroll.
- Code/table screenshots must stay sharp enough to distinguish punctuation and Japanese glyphs.

### 13.4 Enlargement decision

Include a lightweight accessible lightbox in **Phase 2** because source readability is a core requirement, not a decorative enhancement.

Required lightbox behavior:

- opens by click/tap or keyboard from an explicit “Enlarge image” control;
- displays the selected image at its natural/useful size inside the viewport;
- supports browser/native pinch zoom and basic panning where needed;
- closes by Close button, Escape, or backdrop click when unambiguous;
- traps focus while open and returns focus to the opener;
- prevents background scroll;
- does not require advanced annotation, cropping, or custom deep-zoom tooling.

---

## 14. Answer-selection specification

### 14.1 Labels-only mode (default for new content)

When source images contain the actual options, render:

```text
Select your answer
[ ア ] [ イ ] [ ウ ] [ エ ]
```

- Do not render Japanese option text beneath the image.
- Each button’s accessible name must identify it as an answer option, e.g. “Select option ア”.
- Selected, correct, incorrect, hover, focus, and disabled states use the shared design system.
- Do not expose the correct answer before submit.
- Submit remains disabled until a selection exists.

### 14.2 Interaction

- Selection can be changed until submit.
- Submit locks the answer for the current attempt and saves the explicit label.
- Restoring progress reselects by label, not by inferred array position alone.
- Correct/incorrect styling must work with any label string in the question.
- Keyboard users can Tab between native buttons and activate with Enter/Space. Prefer a button group over incomplete `listbox` semantics.

---

## 15. Arbitrary option-label handling

The authoritative list is question-specific:

```json
{
  "optionLabels": ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク"]
}
```

### Requirements

- Derive labels from `options[].label` during normalization.
- Preserve authored order.
- Validate uniqueness and non-empty labels.
- Validate that `correct_answer` belongs to the label list.
- Validate restored/saved `selected_answer` against the same list.
- Do not use global `OPTION_LABELS` or `LABELS` as truth. A legacy fallback may derive labels only for old data missing explicit labels, with a visible development warning.
- Do not cap rendering at four or ten choices. UI layout responds to count; content validation may impose a documented authoring limit later.

### Responsive grid

- 1–4 short labels: up to four columns where each control remains at least 44 px tall and 48 px wide.
- 5–8 labels: two to four columns based on available width.
- 9+ labels: use the largest grid that preserves target size; never shrink text/buttons to force one row.
- Long or non-kana labels automatically widen/wrap and may use fewer columns.

---

## 16. Text-option fallback

The normalized question has an explicit display mode:

```text
labels-only      source image contains real option wording
structured-text  application renders label + Japanese option text
```

`structured-text` preserves existing 科目A and special question compatibility. It uses the same answer state and submit logic; only the visual content inside each option control differs.

Rules:

- Never infer mode solely from whether an image exists; a diagram-only image may still require text options.
- New authored content must set the mode explicitly.
- Legacy migration may default to `structured-text` to avoid hiding options.
- Supplemental HTML remains a controlled fallback for existing code/table questions, not a second question renderer.

---

## 17. Dynamic translation specification

```text
ORIGINAL QUESTION IMAGE
        |
        | learner reads Japanese
        v

LANGUAGE HELP PANEL
        |
        +-- Question Romaji
        +-- Question English
        |
        +-- ア Romaji / English
        +-- イ Romaji / English
        +-- ウ Romaji / English
        +-- エ Romaji / English

ANSWER CONTROL
        |
        +-- user selects ア / イ / ウ / エ
```

Translation augments but never replaces the source image.

### 17.1 Data mapping

Recommended normalized model:

```json
{
  "questionTranslation": {
    "japaneseTranscription": "optional",
    "romaji": "...",
    "english": "..."
  },
  "optionTranslations": [
    { "label": "ア", "japaneseTranscription": "optional", "romaji": "...", "english": "..." }
  ]
}
```

- Map translations by explicit `label`, never array position alone.
- The set of option translation labels must be a subset of or equal to `optionLabels`.
- A missing translation shows “Translation not available” for that item without disabling answering.
- Japanese transcription may be retained for accessibility/search/fallback, but labels-only visual mode does not display duplicate Japanese option text by default.
- Language Help must not reveal correctness.

---

## 18. Translation UX

- Collapsed by default on every newly displayed question.
- User intentionally opens `Language Help`.
- Preserve one accessible disclosure control with `aria-expanded` and a clear panel relationship.
- Organize question help before option help.
- In labels-only mode, option blocks show label, Romaji, and English; Japanese transcription is hidden by default or available under an accessibility/detail affordance.
- On mobile: image → Language Help accordion → answer controls.
- On desktop: default to image with translation beneath. A two-column mode may be used only when the source image stays at a readable width (recommended threshold: each column at least ~520 CSS px). Dense/tall images remain single-column.
- Translation open/closed state can reset per question as today. Remembering the user preference is a future enhancement, not Phase 2 acceptance.

---

## 19. Explanation UX

Retain one explanation renderer and its current safe text-escaping behavior. Extend its section vocabulary through data/configuration rather than source-specific renderers.

Supported/current sections:

- ELI5
- Technical breakdown
- Wrong answer analysis
- Correct answer

Future optional sections:

- Memory trick
- Japanese keywords
- Exam tip
- Concept summary

### Recommended defaults

| Context/result | Default |
|---|---|
| Past exam, correct | Verdict visible; explanation collapsed; “Review explanation” action |
| Past exam, wrong | Explanation expanded; focus/scroll to “Understand why” heading without disorienting jump |
| Textbook, correct or wrong | Explanation expanded after submit |

Next remains available after submit. Do not technically force a dwell time or require scrolling to the end; “review before continue” should be encouraged by layout, not trapped interaction.

Explanations remain dynamic text/HTML UI and must never be merged into source images.

---

## 20. Practice/Test mode recommendation

**Decision:** Practice Mode is the only textbook mode in Phases 1–4. Test Mode belongs in Phase 5/future.

Reason: the current engine persists submitted per-question results immediately and reveals correctness/explanations on submit. A credible Test Mode requires an attempt model, deferred scoring, attempt review, and rules for resumable incomplete attempts. Adding only a “hide explanation” switch would produce ambiguous progress and scoring.

Practice Mode reuses current behavior with textbook explanation policy. When Test Mode is planned, define a separate attempt/session record while continuing to reuse the same question renderer and answer controls.

---

## 21. Content/data model

### 21.1 Preserve existing storage

Continue using:

- `questions.body` JSONB for structured source/translation/display metadata;
- `questions.options` JSONB for explicit labeled options and translations;
- `questions.correct_answer` as the authoritative label;
- `questions.explanation` for dynamic learning content;
- `questions.image_path` as a legacy singular field during migration.

No destructive column rename is required.

### 21.2 Recommended authored question contract

Field names below are a target contract, not an instruction to rewrite the schema immediately:

```json
{
  "number": 4,
  "sourceVisual": {
    "images": [
      { "path": "public/questions/{exam_set_id}/q04.png", "alt": "Optional authored summary" }
    ]
  },
  "display": {
    "optionMode": "labels-only"
  },
  "questionTranslation": {
    "japaneseTranscription": "optional",
    "romaji": "...",
    "english": "..."
  },
  "options": [
    { "label": "ア", "jp": "optional transcription", "romaji": "...", "en": "..." }
  ],
  "correctAnswer": "ア",
  "explanation": "...",
  "metadata": {
    "topicIds": ["tcp-ip"],
    "keywords": ["TCP", "IP"]
  }
}
```

### 21.3 Runtime normalization

Create one adapter boundary that accepts current API/static shapes and outputs:

```text
id
number/displayNumber
sourceImages[]
optionDisplayMode
optionLabels[]
structuredOptions[]
correctAnswerLabel
questionTranslation
optionTranslationsByLabel
explanation
supplementalHtml? (legacy/trusted only)
metadata
```

The quiz view consumes only this normalized model. It must not know whether data originated in `questions.js`, API snake_case, seed camelCase, singular image path, or ordered image list.

### 21.4 Import validation additions

Before Phase 2 content import, validate:

- question numbers unique and contiguous when the current progress mapping requires it;
- option labels non-empty and unique;
- correct answer exists in option labels;
- required translation keys follow declared policy;
- image paths use `public/questions/{exam_set_id}/` and referenced files exist in deploy input;
- `optionMode=labels-only` has at least one source image unless explicitly exempted;
- explanation answer label matches `correct_answer` when the section is present;
- no unapproved raw HTML fields or unsafe elements;
- imported row count equals `exam_sets.question_count`;
- stale rows are deliberately removed or rejected when a set shrinks.

---

## 22. Study-source model

Introduce a catalog abstraction above question sets. Keep question sets as the terminal unit used by the quiz/progress APIs.

```text
StudySource
  -> Collection
      -> Section/Chapter
          -> Topic? 
              -> QuestionSet reference (`exam_set_id`)
```

Past mapping:

```text
past-exams -> 2025 -> 科目A -> fe-2025-a-public
past-exams -> 2025 -> 科目B -> fe-2025-b-public
```

Textbook mapping:

```text
textbook-1 -> network -> tcp-ip -> textbook-1-network-tcp-ip
textbook-1 -> basic-theory -> (direct set) -> textbook-1-basic-theory
```

### Phase strategy

- **Phase 1:** define a small static frontend catalog registry containing the three sources and existing Past Exam references. This avoids backend/schema change while information architecture is proven.
- **Phase 3:** when real textbook taxonomy exists, persist catalog metadata. Smallest preferred database extension is an additive `metadata jsonb NOT NULL DEFAULT '{}'` on `exam_sets`, containing source/chapter/topic/order keys, and return it from `GET /exam-sets`. If taxonomy/query needs become complex, normalize catalog tables later; do not prebuild them now.
- Question sets remain independently loadable by `exam_set_id` throughout.

---

## 23. Existing `exam_set_id` compatibility

Keep `exam_set_id` unchanged internally and interpret it as a generic **question-set identifier**.

Why:

- frontend question/progress URLs already derive from it;
- answer state is keyed by it;
- PostgreSQL foreign keys and unique constraints use it;
- reset and session rows are isolated by it;
- image folders follow `public/questions/{exam_set_id}/`;
- importer and live API use it.

Changing it for naming purity would create risk across frontend state, backend routes, database rows, deployed image folders, sync, reset, and resume.

New textbook IDs should be stable, readable, and folder-safe, e.g. `textbook-1-network-tcp-ip`. User-facing UI must call these “question sets,” chapters, or topics—not “exam sets.” A future additive API alias may improve naming, but old routes must remain compatible.

---

## 24. Progress architecture

### 24.1 Preserve current guarantees

- selected answer;
- submitted state;
- correct/wrong state;
- answered/correct/incorrect counts;
- current viewed question;
- resume and viewed-question restoration;
- shared sync code behavior;
- reset scoped to one set;
- per-set isolation;
- nonblocking offline/fallback behavior;
- monotonic furthest index.

### 24.2 Canonical answer identity

Persist answer labels as today, but normalize client state around `selectedAnswerLabel`. Index may remain a temporary rendering detail. This prevents reordered choices or nonstandard labels from corrupting restored progress.

### 24.3 Aggregation

Compute topic/chapter/book values from question-level progress plus catalog membership:

```text
completed = submitted question count / total question count
accuracy  = correct submitted count / submitted question count
```

Do not store duplicate counters in Phase 3. Cache only if profiling later proves calculation too expensive.

The Study Hub requires progress for sets not currently open. Phase 1 may fetch current per-set progress for the two existing papers. Before hundreds of sets exist, add a batch summary endpoint rather than issuing one request per set. This endpoint is not required for Phase 1.

### 24.4 Completion semantics

UI completion must mean every question in scope is submitted. Do not reuse the current backend `completed` flag as the sole truth because it currently means the learner reached the final index.

### 24.5 Future-ready minimal data

Preserve stable question IDs and classification metadata. Later features can derive:

- Previously Incorrect / Retry Incorrect from `question_progress.is_correct`;
- Weak Topics from progress joined to topic metadata;
- Topic/chapter accuracy from the same join;
- Review Later / Bookmarks from a future small user-question relation or additive flags.

Do not add bookmark/review columns in initial phases.

---

## 25. Backend/schema impact

### Phase 1

No backend or schema change. Reuse existing questions/progress/reset APIs exactly.

### Phase 2

Prefer no relational schema change. Store new `optionMode`, normalized ordered image metadata, optional alt/caption, and classifications in existing JSONB. Make the API adapter backward compatible with current `image_path`, `imagePaths`, `supplementalHtml`, and options.

An API response change may be additive. Do not remove existing fields while current frontend/fallback data depends on them.

### Phase 3

Add `exam_sets.metadata jsonb` only if textbook catalog must be backend-driven. Extend the list endpoint additively. The existing `questions`, `question_progress`, and `quiz_sessions` tables can otherwise remain unchanged.

### Security boundary

Shared sync code remains explicitly non-secure. Do not expand it into authentication during this redesign. Continue server-derived user ownership and per-user filters. Do not accept `user_id` from clients. Assessment integrity/Test Mode must not trust client-supplied `is_correct`; that is future architecture work.

---

## 26. Component architecture

Names are conceptual for the current vanilla-JS codebase; they do not require framework components.

```text
AppShell
  ThemeToggle
  StudyHub
    StudyCategoryCard x3
    SyncSettings
  CategoryView
    PastExamBrowser
      YearSelector
      QuestionSetCard
    TextbookBrowser
      BookProgress
      ChapterList
      TopicList?
  QuizShell
    StudyBreadcrumb
    QuizProgress
    QuestionNavigator
    SourceImageViewer
      ImageSequence
      ImageLightbox
    LanguageHelp
    AnswerSelector
    Feedback
    ExplanationPanel
    QuizActions
```

### State boundaries

- Catalog/navigation state: selected category/year/book/chapter/topic.
- Active set state: `exam_set_id`, normalized questions, load status.
- Question state: current index/ID, selected label, submitted/verdict.
- User progress state: per-set answer map and session index.
- Preferences: theme and sync code.

Do not let navigation components directly mutate answer state. Do not let image/translation components calculate correctness.

---

## 27. Responsive/mobile requirements

### Global

- Support 320 px CSS width and current iPhone-width layouts.
- `html`, `body`, app shell, cards, and media containers must not create page-level horizontal overflow.
- Respect safe-area insets for sticky bottom actions.
- Primary tap targets are at least 44×44 CSS px; label buttons should target 48–52 px height where practical.

### Question screen

- Image uses full content width before optional side-by-side layouts.
- Tall images flow vertically.
- Wide images fit the viewport and offer enlargement.
- Four labels: 2×2 or 4×1 depending on measured width; never tiny four-column buttons on narrow screens.
- Eight labels: typically 4×2 or 2×4, chosen by minimum target size.
- Translation accordion is full-width and follows source images.
- Explanation cards stack; headings and long URLs/code wrap.
- Sticky Submit/Next must not obscure the final option or explanation; provide bottom padding.
- Question chips may wrap or use a contained horizontal scroller with visible focus, but the page itself does not scroll sideways.

### Study/chapter screens

- Category cards stack one per row.
- Chapter cards become compact rows with progress beneath title.
- Breadcrumbs collapse to Back + current label on small screens; full hierarchy remains available to assistive technology or a compact menu.
- Do not expose five levels of persistent navigation chrome above the question.

### Desktop

- Keep a readable max content width.
- Use two columns for language help only if image readability is preserved.
- Avoid excessive empty space by allowing wider source images and balanced hub grids, not by stretching text lines.

---

## 28. Accessibility considerations

- Use semantic buttons for answer controls; if retaining `listbox`, implement the complete keyboard pattern. Preferred Phase 2 approach is a labelled button group.
- Provide visible focus for cards, labels, disclosures, navigator chips, lightbox controls, Submit/Next, Back, and reset.
- Announce verdict and sync/load errors through targeted `aria-live` regions; avoid placing the entire changing quiz main in a live region if it causes verbose re-announcements.
- Source images need concise authored alt text when meaningful. Dense full transcription should live in an associated details panel, not an enormous `alt` attribute.
- If no transcription exists, alt must identify the image as the authoritative question source and direct the learner to available language help; content ingestion should flag the gap.
- Translation disclosure exposes `aria-expanded`, `aria-controls`, and a programmatic heading structure.
- Lightbox traps/returns focus, supports Escape, and exposes image position for multi-image questions.
- Correct/wrong state cannot rely on color alone; retain text verdict and icons/labels.
- Maintain WCAG AA contrast across all category accents and both themes.
- Respect `prefers-reduced-motion` as current CSS does.
- Do not invert or recolor source exam images in dark mode.
- Preserve logical reading order: context → source → help → answer → feedback → explanation → next.

---

## 29. Migration strategy

```text
Existing FE Quiz
      |
      v
Study Hub introduced
      |
      v
Existing 2025 A/B placed under Past Exams
      |
      v
Shared question normalizer + image-first shell
      |
      v
Textbook catalog + Book 1 real slice
      |
      v
Book 2 through identical architecture
      |
      v
Optional assessment/review features
```

### Compatibility sequence

1. Freeze/record current A/B answer keys and current API/progress contracts.
2. Introduce catalog/navigation without changing quiz runtime.
3. Retain original Paper A fallback array independently before source switching.
4. Add normalized question model behind the existing loader.
5. Default legacy questions to structured-text mode.
6. Mark verified image-contained questions labels-only one set/question at a time.
7. Add lightbox and image states.
8. Move A supplemental HTML into the canonical seed/API only after output parity is verified; keep temporary fallback during transition.
9. Add first Book 1 chapter/topic/set as a vertical slice.
10. Add Book 2 only through catalog/content entries.

No big-bang rewrite is permitted.

---

## 30. Implementation phases

### Phase 0 — documentation and contract baseline

**What to produce**

- Record current route payloads, storage keys, current A/B set IDs, answer keys, content counts, label counts, image assets, and reset/resume rules.
- Convert this PRD’s normalized question contract into a small checked-in contract document or comments next to the adapter.
- Identify current static/API parity gaps before touching UI.

**Allowed/current interfaces**

- Routes listed in Section 3.3.
- Runtime/API adapters at `app.js:571-668`.
- Progress/resume/reset at `app.js:409-449` and `app.js:727-818`.
- Database structure at `oracle/schema.sql:55-117`.
- Import mapping at `scripts/import_seed_oracle.js:94-130`.

**Verification checklist**

- Baseline documents 20 A + 6 B questions and option counts.
- Correct answers remain Japanese labels.
- Storage keys and request/response fields are captured exactly.
- No application behavior changes.

**Anti-pattern guards**

- Do not trust obsolete early checkpoints over current source.
- Do not invent routes or fields.
- Do not treat client-supplied `is_correct` as secure assessment data.

### Phase 1 — Study Hub and information architecture

**What to implement**

- Add exactly three top-level category cards.
- Move the current year/paper experience under Past Exams.
- Add static generic catalog configuration for categories and existing set references.
- Add category/back navigation and context labels while sending selected set into existing `startPaper()`/quiz flow.
- Preserve current sync/theme controls with reduced hub emphasis.
- Do not change the quiz engine, backend, schema, question data, or progress payloads.

**References to reuse**

- Existing home screen DOM: `index.html:21-42`.
- Existing year/set rendering and `startPaper()`: `app.js:367-552`.
- Existing CSS tokens and cards: `style.css:4-22`, home/card rules near `style.css:54-148`.

**Verification checklist**

- Acceptance criteria in Section 31.1 pass.
- Existing set IDs flow unchanged into current API routes.
- Back/home/reload states are deterministic.

**Anti-pattern guards**

- No separate quiz HTML for category cards.
- No textbook nodes in year data.
- No backend calls invented for empty Book cards.
- No framework/router migration.

### Phase 2 — shared image-first question shell

**What to implement**

- Add one question normalizer and normalized runtime model.
- Normalize singular/multiple images to `sourceImages[]`.
- Add explicit `optionDisplayMode` and per-question `optionLabels`.
- Render labels-only controls for verified image-contained options; retain structured-text fallback.
- Map translation and progress by explicit label.
- Add image loading/error states and accessible lightbox.
- Apply context-driven explanation defaults through shared policy.
- Add content/import validation for labels, correct answers, paths, and modes.

**References to reuse**

- Existing API adapter: `app.js:588-622`.
- Existing render/selection/verdict: `app.js:81-253`.
- Existing explanation renderer: `app.js:255-333`.
- Existing image styling: `style.css:307-352`.
- B seed image/label patterns: `seed/fe-2025-b-public.json`.

**Verification checklist**

- Acceptance criteria in Section 31.2 pass.
- Legacy A questions default safely to text options.
- B labels-only questions no longer duplicate Japanese option text.
- Restored answers use labels and stay correct after navigation/reload.

**Anti-pattern guards**

- No global four-choice logic.
- No OCR replacement.
- No unvalidated correct label.
- No page-level image overflow.
- No separate translation/explanation renderer by category.

### Phase 3 — Textbook 1 vertical slice

**What to implement**

- Add Book 1 landing, chapters, optional topics, and progress rollups.
- Add one real chapter, one optional topic path if content requires it, and one imported question set.
- Reuse Phase 2 normalizer/engine/progress/reset/sync.
- Add `exam_sets.metadata` only if the real catalog must come from the backend; otherwise keep the reviewed static catalog for this slice.
- Establish repeatable image/content ingestion and validation.

**References to reuse**

- Generic set API and progress routes in `oracle/backend/main.py`.
- Existing `exam_sets`/`questions` schema in `oracle/schema.sql:55-80`.
- Existing seed/import envelope in `seed/*.json` and `scripts/import_seed_oracle.js:94-130`.

**Verification checklist**

- Acceptance criteria in Section 31.3 pass.
- No route/controller contains Book 1-specific quiz behavior.
- Chapter/book aggregates reconcile to underlying question progress.

**Anti-pattern guards**

- No mandatory fake topics.
- No duplicated progress counters.
- No `book1` answer/translation/explanation code.
- No large normalized catalog schema before real taxonomy proves need.

### Phase 4 — Textbook 2 reuse proof

**What to implement**

- Add Book 2 catalog/content entries and its first real set.
- Reuse the Book 1 hierarchy, ingestion, and shared quiz components without copied controllers/components.
- Add only Book 2 content identity/accent tokens.

**References to reuse**

- Phase 3 catalog and content-ingestion pattern.
- Same set/progress APIs and schema.

**Verification checklist**

- Acceptance criteria in Section 31.4 pass.
- Diff contains content/config additions, not a second quiz implementation.

**Anti-pattern guards**

- No `if (book === 2)` rendering branch except declarative accent/content selection.
- No separate Book 2 tables/routes.

### Phase 5 — study enhancements (future)

Evaluate, design, and individually approve:

- Test Mode with attempt/session semantics;
- Review Later/bookmarks;
- Previously Incorrect / Retry Incorrect;
- weak topics and accuracy analytics.

Do not implement these as hidden scope inside Phases 1–4.

### Final implementation verification phase

- Compare implementation field-by-field with the approved normalized contract.
- Search for hard-coded label arrays, concrete Book IDs in quiz logic, duplicated quiz controllers, unsafe source HTML, and old image casing assumptions.
- Verify current and new content through mobile/desktop/light/dark/offline/API paths.
- Verify progress isolation, restore, reset, sync, and correct answers for every migrated set.
- Verify no unrelated auth/framework/database redesign entered the work.

---

## 31. Acceptance criteria per phase

### 31.1 Phase 1

- [ ] Study Hub presents exactly three primary entrances: Past Exams, Book 1, Book 2.
- [ ] Cards are visually distinct but share typography, spacing, buttons, focus, and theme tokens.
- [ ] Mobile stacks cards without horizontal scrolling.
- [ ] Past Exams contains the year selector and both current 2025 paper cards.
- [ ] 科目A and 科目B open through the existing shared quiz flow.
- [ ] All 26 current correct answers remain unchanged.
- [ ] Existing API question loading and Paper A fallback remain unchanged.
- [ ] Existing progress GET/POST/DELETE payloads remain unchanged.
- [ ] Answer counts, resume, viewed-question restore, sync code, and per-paper reset remain functional.
- [ ] Resetting one paper does not affect the other paper, sync code, or theme.
- [ ] Light/dark theme persists from hub through quiz and refresh.
- [ ] Desktop and 320 px mobile layouts have no page-level horizontal overflow.
- [ ] Book cards can show unavailable/empty states without fake quiz data.
- [ ] No backend/schema rewrite is introduced.

### 31.2 Phase 2

- [ ] Single and multiple ordered source images render through one component.
- [ ] Images preserve aspect ratio and remain readable on mobile.
- [ ] Loading, error, alt/transcription gap, and dark-mode states are defined and visible.
- [ ] Accessible lightbox works by pointer and keyboard; focus returns on close.
- [ ] Labels-only mode shows only answer labels beneath an image containing options.
- [ ] Structured-text mode preserves current text-option questions.
- [ ] Current 4-, 6-, 7-, and 10-option examples render usable controls.
- [ ] No engine code assumes four choices or uses a global label list as truth.
- [ ] Correct and selected labels are validated against each question’s options.
- [ ] Translation remains dynamic, collapsed by default, and does not reveal correctness.
- [ ] Option translations map by the same explicit labels used for answer selection.
- [ ] Explanations still render safely and follow category/result defaults.
- [ ] A/B navigator, submit, next, summary, restore, sync, and reset remain functional.
- [ ] Legacy `imagePath`, `image_path`, `imagePaths`, supplemental HTML, and static fallback remain compatible during migration.
- [ ] Wide media never causes page-level horizontal overflow.

### 31.3 Phase 3

- [ ] Book 1 shows overall progress and ordered chapters.
- [ ] Chapter without topics can open/resume directly without an empty topic screen.
- [ ] Chapter with topics shows ordered topic rows/cards.
- [ ] First real textbook set loads through the existing generic set route.
- [ ] Book 1 uses the shared image, answer, translation, feedback, explanation, progress, and reset components.
- [ ] Textbook explanations expand after submit by default.
- [ ] Chapter/book completed totals and accuracy reconcile with underlying submitted question rows.
- [ ] Set reset updates aggregates without affecting other sets.
- [ ] Content import rejects duplicate labels, invalid correct answer, invalid image folder, and count mismatch.
- [ ] Mobile chapter/topic navigation remains usable with hundreds-of-questions scale assumptions.
- [ ] No Test Mode or review system is introduced.

### 31.4 Phase 4

- [ ] Book 2 appears as active content without adding a new quiz controller or route family.
- [ ] Book 2 uses the identical catalog node and question-set contracts as Book 1.
- [ ] Book 1 and Book 2 progress remain isolated by set and correctly aggregated by book.
- [ ] Category accents differ subtly while shared components remain visually consistent.
- [ ] Adding Book 2 is primarily content/catalog configuration plus assets.

### 31.5 Phase 5/future feature gate

- [ ] Each enhancement has a separately approved data/UX specification.
- [ ] Test Mode defines attempt creation, deferred scoring, interruption/resume, submission, and review semantics before code.
- [ ] Review/analytics derive from stable question IDs and classification metadata.
- [ ] Secure scoring is not claimed while correctness remains client-controlled.

---

## 32. Regression risks

| Risk | Current evidence | Mitigation |
|---|---|---|
| Four-choice assumptions | Static `OPTION_LABELS` is ア–エ; runtime has separate ア–コ list | Make explicit per-question labels canonical; validation + current B fixtures |
| Correct-answer index drift | API label converted through global list | Normalize `correctAnswerLabel`; derive UI index only locally |
| Progress serialization drift | Backend stores labels; client state stores index | Restore/save by label; compatibility adapter for old in-memory index |
| Question numbering | `numberToIndex(n) = n - 1` | Keep contiguous numbering initially; later persist stable question ID in progress contract |
| Global question mutation | `QUIZ.questions` overwritten on load | Retain immutable fallback per set; active set owns its array |
| A/B fallback asymmetry | A static fallback, B API-only | Make policy explicit per catalog entry; never reuse stale prior set |
| Singular/multiple image drift | `image_path`, `imagePath`, `imagePaths` | One normalizer → `sourceImages[]`; keep aliases only at boundary |
| Image folder mismatch | Deploy path must match `exam_set_id` | Import/deploy validator; direct asset checks |
| Option duplication | Current option renderer always outputs Japanese text | Explicit `labels-only` vs `structured-text` mode |
| Translation mapping | Current mapping relies on option order | Map by explicit label and validate gaps |
| Explanation behavior | Current explanation always opens | Shared declarative policy, not separate renderer |
| Supplemental HTML drift/XSS | Trusted content enters `innerHTML`; A local-only | Restrict/sanitize allowed schema; migrate A canonical source carefully |
| Reset monotonic trigger | Lowering session row is blocked | Preserve delete-row reset contract |
| Completion semantics | Backend completion = reached last index | Compute UI completion from submitted count |
| Viewed-question restore | Local mirror intentionally outranks backend | Preserve documented precedence; test unanswered navigation refresh |
| Sync identity | Shared code grants full progress access | Preserve but label as non-secure; no auth claims |
| Mobile overflow | Dense images, chips, long code/translation | Component-contained sizing/scroll; 320 px acceptance |
| Dark mode source images | Exam images should not invert | Neutral light image canvas in both themes |
| Import stale rows | Upsert does not delete removed questions | Reconcile counts and explicitly delete/reject stale rows |
| Source/live explanation drift | Explanation `.txt` sources differ from live seed JSON | Reconcile sources before new ingestion; designate one canonical source |

No regression to current 科目A/科目B is acceptable.

---

## 33. Explicit non-goals

Phases 1–4 do not include:

- authentication redesign, email login, JWT, or secure accounts;
- database replacement or large schema normalization;
- React, Vue, another framework, or build-system migration;
- PWA/offline rewrite;
- OCR-based display or automatic question extraction;
- AI-generated translations;
- advanced analytics dashboards;
- Test Mode/attempt scoring;
- Review Later, bookmarks, weak topics, or retry queues;
- three category-specific visual themes;
- a second/third quiz engine;
- advanced image annotation, crop editing, or deep-zoom infrastructure.

---

## 34. Future enhancements

Architecture should leave room for, without implementing now:

- persistent user bookmarks / Review Later;
- Previously Incorrect and Retry Incorrect filters;
- weak-topic and chapter accuracy views;
- real authentication and secure cross-device identity;
- batch progress summaries for large catalogs;
- Test Mode attempts and deferred review;
- content search using Japanese transcription/metadata;
- authored accessibility transcriptions;
- offline asset caching/PWA after image storage and invalidation policies are designed;
- source citations/licensing metadata;
- richer image pan/zoom only if simple lightbox proves insufficient.

---

## 35. Recommended exact first implementation task

**Task:** Introduce a static, generic Study Hub catalog and navigation shell, then place the unchanged current 2025 科目A/科目B paper selector under Past Exams.

### Exact scope

1. Define one catalog configuration with exactly three category nodes and existing Past Exam set references.
2. Replace the current home paper list with three category cards.
3. Add a Past Exams category view that reuses the current year selector and paper-card builder.
4. Route an existing paper selection into the existing `startPaper()` unchanged at its quiz boundary.
5. Add compact Back navigation from category to hub; preserve existing quiz-to-paper behavior with clarified labels.
6. Keep Book 1 and Book 2 as visible intentional empty/coming-soon category states.
7. Reuse current card/theme/responsive tokens; add only category accent tokens and necessary layout rules.
8. Do not change `render()`, selection, submit, explanation, questions, backend, schema, seed, API payloads, progress, sync, or reset.

### Completion proof

Phase 1 acceptance criteria in Section 31.1 pass, and the code diff shows navigation/catalog/UI changes only.

### Decisions that genuinely require product input before later phases

- Official display titles/subtitles and accent identities for Book 1 and Book 2.
- The real Book 1/Book 2 chapter taxonomy and whether each chapter has authored topics.
- Confirmation that textbook source images may be stored/served by this product, including any licensing/access restrictions.
- For each future source set, which questions are `labels-only` versus `structured-text` when images do not contain complete options.

None of these blocks the exact Phase 1 shell task if placeholder Book 1/Book 2 names from this PRD are approved.

