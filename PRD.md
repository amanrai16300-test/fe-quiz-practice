# Product Requirements Document (PRD)
## Japanese FE Exam Quiz & Learning Platform

**Version:** 1.2  
**Project:** Japanese IT Exam Quiz & Learning Platform  
**Target exam:** 基本情報技術者試験 科目A / Japanese Fundamental Information Technology Engineer Exam  
**Initial content source:** 令和7年度 基本情報技術者試験 科目A 公開問題 問1〜問20  
**Primary devices:** Desktop browser and iOS Home Screen shortcut  
**Main priority:** Safe backend-first sync across devices  

---

# 1. Overview

This is a personal web application for practicing Japanese IT exam questions.

The app helps the user study Japanese FE exam questions by combining:

- Japanese exam questions
- Romaji reading support
- Simple English translation
- Multiple-choice quiz practice
- Answer checking
- Beginner-friendly explanations
- Wrong-answer review
- Cross-device progress sync

The user will use the app back and forth between:

```text
Desktop browser ↔ iPhone Home Screen shortcut
```

The most important requirement is that progress must sync correctly and must not be lost when switching devices.

---

# 2. Main Problem

The user studies on multiple devices.

The biggest risk is stale local data overwriting newer progress.

Example problem:

```text
Desktop:
問1〜問10 completed

iPhone Home Screen shortcut:
Old local state only has 問1〜問3 completed

iPhone opens and saves old data
        ↓
Desktop progress 問4〜問10 gets overwritten
```

This must never happen.

Therefore:

```text
Backend database = source of truth
localStorage = cache only, or avoided for progress completely
```

---

# 3. Goals and Non-Goals

## 3.1 Goals

- Provide an interactive quiz interface for Japanese FE 科目A questions.
- Show questions and options in Japanese.
- Provide a simple translation button for Japanese/Romaji/English reading support.
- Show explanations only after answering.
- Save progress automatically.
- Sync progress between desktop and iOS Home Screen shortcut.
- Prevent old local device state from overwriting newer backend progress.
- Support future uploaded PDFs/Markdown question sets.

## 3.2 Non-Goals

- No real-time AI generation during the quiz.
- No localStorage as the main database.
- No public multi-user classroom system.
- No paid subscription system.
- No native iOS app in the first version.
- No leaderboard.

---

# 4. Tech Stack

## 4.1 Recommended Simple Stack

```text
Frontend: HTML + CSS + Vanilla JavaScript
Backend/Database: Supabase
Hosting: GitHub Pages / static hosting
AI content generation: Manual ChatGPT workflow before upload
```

React, Vue, or Nuxt can be used later, but the MVP can be built with simple static files.

## 4.2 Supabase Responsibilities

Supabase will be used for:

- Authentication or fixed personal user ID
- Question content storage, or question metadata
- Progress storage
- Completed session history
- Cross-device sync
- Backend-first loading

---

# 5. Database Design

Supabase must act as the strict source of truth.

## 5.1 Table: `questions`

Stores quiz content and pre-generated reading support.

| Column | Type | Purpose |
|---|---|---|
| `id` | text | Stable question ID, e.g. `fe-2025-a-q01` |
| `exam_set_id` | text | Exam set ID, e.g. `fe-2025-a-public` |
| `number` | integer | Question number |
| `japanese_text` | text | Original Japanese question |
| `options` | jsonb | Options ア, イ, ウ, エ |
| `correct_answer` | text | Correct option key |
| `aligned_translation` | jsonb | Japanese/Romaji/English reading table |
| `ai_explanation` | text | Pre-generated explanation |
| `image_path` | text/null | Optional image path |
| `table_data` | jsonb/null | Optional table data |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Updated time |

### Example `aligned_translation`

```json
[
  {
    "jp": "浮動小数点形式で表現された数値の演算結果における丸め誤差の説明はどれか。",
    "romaji": "Fudou shousuuten keishiki de hyougen sareta suuchi no enzan kekka ni okeru marume gosa no setsumei wa dore ka.",
    "en": "Which explanation describes rounding error in the calculation result of a number represented in floating-point format?"
  }
]
```

For options, translation can be stored inside `options`.

### Example `options`

```json
{
  "ア": {
    "jp": "演算結果がコンピュータの扱える最大値を超えることによって生じる誤差である。",
    "romaji": "Enzan kekka ga konpyuuta no atsukaeru saidaichi o koeru koto ni yotte shoujiru gosa de aru.",
    "en": "An error caused when the calculation result exceeds the maximum value the computer can handle."
  },
  "イ": {
    "jp": "数表現のけた数に限度があるので，最下位けたより小さい部分について四捨五入や切上げ，切捨てを行うことによって生じる誤差である。",
    "romaji": "Suu hyougen no ketasuu ni gendo ga aru node, saikai keta yori chiisai bubun ni tsuite shishagonyuu ya kiriage, kirisute o okonau koto ni yotte shoujiru gosa de aru.",
    "en": "An error caused by rounding, rounding up, or truncating parts smaller than the lowest digit because numeric representation has limited digits."
  }
}
```

---

## 5.2 Table: `question_progress`

Progress must be saved **per question**, not as one large answers JSON object.

This prevents one device from overwriting another device’s answers.

| Column | Type | Purpose |
|---|---|---|
| `user_id` | uuid/text | User ID |
| `exam_set_id` | text | Exam set ID |
| `question_id` | text | Stable question ID |
| `selected_option` | text | Selected answer |
| `is_correct` | boolean | Whether answer is correct |
| `status` | text | `new`, `answered`, `correct`, `wrong`, `review`, `mastered` |
| `attempt_count` | integer | Total attempts |
| `correct_count` | integer | Correct attempts |
| `wrong_count` | integer | Wrong attempts |
| `marked_for_review` | boolean | Manual review flag |
| `answered_at` | timestamp | Answer time |
| `updated_at` | timestamp | Last update time |
| `version` | integer | Incrementing version |
| `device_id` | text | Device that made latest update |

Unique key:

```text
user_id + exam_set_id + question_id
```

Important:

```text
Never overwrite all answers from one device.
Only upsert the specific question that changed.
```

---

## 5.3 Table: `quiz_sessions`

Stores unfinished active sessions.

| Column | Type | Purpose |
|---|---|---|
| `id` | text | Session ID |
| `user_id` | uuid/text | User ID |
| `exam_set_id` | text | Exam set |
| `mode` | text | `main`, `wrong`, `review`, `random` |
| `slot` | text | `mainSlot` or `wrongSlot` |
| `question_order` | jsonb | Frozen question order |
| `option_orders` | jsonb | Frozen option order |
| `current_index` | integer | Current question index |
| `answers` | jsonb | Session answer state |
| `timer_seconds` | integer | Timer state if needed |
| `status` | text | `active`, `completed`, `paused` |
| `updated_at` | timestamp | Last update |
| `version` | integer | Version |
| `device_id` | text | Last device |

---

## 5.4 Table: `quiz_history`

Stores durable completed main-session history.

Important rules:

- Main sessions create history.
- Wrong-answer practice does not create history.
- History is merged by unique history ID.
- A device with fewer history rows must not delete valid history from another device.

| Column | Type | Purpose |
|---|---|---|
| `id` | text | Unique history ID |
| `user_id` | uuid/text | User ID |
| `exam_set_id` | text | Exam set ID |
| `mode` | text | Must be `main` for normal history |
| `score` | integer | Correct count |
| `total_questions` | integer | Total session questions |
| `wrong_question_ids` | jsonb | Wrong question IDs |
| `question_results` | jsonb | Per-question result |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Updated time |

---

# 6. Backend-First Sync Design

## 6.1 Golden Rule

```text
On app load: read backend first.
On answer submit: save backend first.
localStorage: cache only.
Old local data must never overwrite newer backend progress.
```

## 6.2 App Load Flow

When the app opens on desktop or iPhone Home Screen shortcut:

```text
1. Show "Syncing latest progress..."
2. Read Supabase first.
3. Fetch latest question_progress.
4. Fetch active quiz_sessions.
5. Fetch quiz_history.
6. Merge any pending offline changes carefully.
7. Update UI from backend data.
8. Allow answering only after sync finishes.
```

The app must not do this:

```text
Open app
  ↓
Read localStorage first
  ↓
Show stale progress
  ↓
Save stale progress to backend
```

## 6.3 Sync Triggers

Sync must run:

- On app launch
- On page refresh
- Before rendering quiz screen
- Before starting/resuming a session
- After every submitted answer
- After marking/unmarking review
- After finishing a session
- Before logout
- When page becomes hidden
- When app becomes visible again
- When browser window receives focus
- When internet connection returns

Recommended browser events:

```js
window.addEventListener("focus", syncFromBackendFirst)

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncFromBackendFirst()
  }
})

window.addEventListener("online", syncFromBackendFirst)
```

---

# 7. iOS Home Screen Shortcut Requirements

The app must work safely as an iOS Home Screen shortcut.

iOS-specific concerns:

- Home Screen shortcut may behave like a standalone PWA.
- It may not share all normal Safari state.
- It may be suspended in the background.
- It may reopen with stale cached data.
- Realtime connections may disconnect while backgrounded.

Therefore:

```text
On every iOS resume, refetch backend before trusting visible progress.
```

If sync fails:

```text
Show:
"Could not sync latest progress. Please retry before continuing."
```

For the safest MVP:

```text
No backend save = no next question
```

---

# 8. Translation / Reading Support UI

This is a main learning feature.

## 8.1 Translation Button

Each question screen must include one clear translation button:

```text
[🌐 Show Translation]
```

When clicked, it toggles open a 3-column reading table:

```text
Japanese | Romaji | English
```

When open, the button changes to:

```text
[Hide Translation]
```

## 8.2 What the Translation Table Includes

The translation table must include:

- The question text
- Every option ア〜エ
- Important Japanese terms if available

Example:

| Japanese | Romaji | English |
|---|---|---|
| 浮動小数点形式で表現された数値 | fudou shousuuten keishiki de hyougen sareta suuchi | a number represented in floating-point format |
| 丸め誤差 | marume gosa | rounding error |
| ア 演算結果が... | A enzan kekka ga... | A calculation result... |

## 8.3 Button Placement

The translation button must be available **before answering**.

Recommended layout:

```text
問7 / 20

[Japanese question]

[🌐 Show Translation]

Options:
○ ア ...
○ イ ...
○ ウ ...
○ エ ...

[Submit Answer]
```

When opened:

```text
問7 / 20

[Japanese question]

[Hide Translation]

Japanese | Romaji | English table

Options:
○ ア ...
○ イ ...
○ ウ ...
○ エ ...

[Submit Answer]
```

## 8.4 Translation Rules

- Translation must be pre-generated and stored in Supabase.
- No AI call during quiz answering.
- Translation must appear instantly after clicking the button.
- The translation table must be available before and after answering.
- The translation open/closed state is a UI preference only.
- Translation open/closed state does not need to sync across devices.

---

# 9. Quiz UI Flow

## 9.1 State 1: Loading

```text
Syncing latest progress...
```

During this state:

- Read backend first.
- Do not show stale local progress as final.
- Do not allow answering yet.

## 9.2 State 2: Active Question

User sees:

```text
問7 / 20

Japanese question

[🌐 Show Translation]

Options:
○ ア ...
○ イ ...
○ ウ ...
○ エ ...

[Submit Answer]
```

Rules:

- Correct answer hidden.
- Explanation hidden.
- Submit disabled until an option is selected.
- User can change selected option before submit.

## 9.3 State 3: Selected but Not Submitted

User selects an option.

```text
Selected: イ
[Submit Answer]
```

Rules:

- Option is highlighted.
- User can still change answer.
- No correct/wrong feedback yet.
- Explanation still hidden.

## 9.4 State 4: Submitted and Saving

After pressing Submit Answer:

```text
Saving answer...
```

Rules:

- Options locked.
- Submit disabled.
- Save answer to Supabase immediately.
- Do not enable Next until save succeeds.

## 9.5 State 5: Submitted and Saved

After backend confirms save:

```text
✅ Correct
```

or

```text
❌ Incorrect
```

Then show explanation.

Buttons:

```text
[Mark for Review] [Next Question]
```

For the last question:

```text
[Mark for Review] [Finish Session]
```

## 9.6 State 6: Save Failed

If save fails:

```text
Could not save answer.
[Retry Save]
```

For safest MVP:

```text
Do not move to next question until save succeeds.
```

---

# 10. Answer and Explanation Behavior

## 10.1 Before Submit

Before submit:

- Do not show correct answer.
- Do not highlight correct answer.
- Do not show explanation.
- Allow translation table.

## 10.2 After Submit

After submit and successful backend save:

- Show Correct/Incorrect banner.
- Show user’s selected answer.
- Lock options.
- Show explanation.
- Enable Next Question.

## 10.3 Explanation Style

The detailed explanation must follow this style:

```md
# Confirmed Question #___, Full scenario and options:

## Japanese
[Original Japanese]

## Romaji
[Romaji]

## English
[Simple English]

## Options

### ア
Japanese:
Romaji:
English:

### イ
Japanese:
Romaji:
English:

### ウ
Japanese:
Romaji:
English:

### エ
Japanese:
Romaji:
English:

Correct answer: hidden until the end.

---

## ELI5 analogy
[Short simple analogy]

## Technical breakdown
[What the question asks]

## Japanese keywords to remember
- [keyword] = [romaji] = [English]

## Why the best solution works
[Explain without revealing option letter]

## Wrong answer analysis
[Only wrong options]

## Memory trick
[Short memory trick]

Correct answer: ___
```

Important:

```text
The detailed explanation should reveal the correct answer only in the final line.
```

The UI may show Correct/Incorrect after submit, but the explanation text itself must keep the final answer reveal at the bottom.

---

# 11. Question Content and Images

## 11.1 Initial Question Set

Initial exam set:

```text
令和7年度 基本情報技術者試験 科目A 公開問題 問1〜問20
```

## 11.2 Questions With Visual Content

| Question | Type | Website Handling |
|---|---|---|
| 問3 | Binary search tree diagram | Use image |
| 問6 | Product table + SQL | Use HTML table |
| 問14 | PERT/network diagram | Use image |
| 問19 | Business calculation table | Use HTML table |

## 11.3 Required Image Files

Use original cropped images for diagram-heavy questions:

```text
public/questions/fe-2025-a/q03.png
public/questions/fe-2025-a/q14.png
```

Optional image files:

```text
public/questions/fe-2025-a/q06.png
public/questions/fe-2025-a/q19.png
```

Best approach:

```text
問3  → image
問6  → HTML table
問14 → image
問19 → HTML table
```

---

# 12. Quiz Modes

## 12.1 Normal Mode

Standard practice through the selected question set.

Features:

- Show question
- Select option
- Submit answer
- Save immediately
- Show explanation
- Next question

## 12.2 Wrong Answer Review Mode

Shows only previously wrong questions.

Rules:

- Wrong practice can be repeated.
- Wrong practice does not create completed main-session history.
- Wrong practice must not overwrite active main session.

## 12.3 Marked Review Mode

Shows manually marked questions.

Useful for:

- Kanji-heavy questions
- Calculation questions
- Diagram questions
- Concepts not yet understood

## 12.4 Random Practice Mode

Randomizes selected questions.

Important:

```text
Question order must be frozen for the session.
Do not reshuffle after every answer.
```

---

# 13. Session Rules

## 13.1 Main Session

Main session creates durable history when completed.

## 13.2 Wrong/Review Session

Wrong/review session is separate from main session.

Use separate slots:

```text
mainSlot
wrongSlot
```

Rules:

- Starting wrong practice must not delete the active main session.
- Returning to main session must restore the main session.
- Wrong practice must not create `quiz_history` rows.
- Resume Main Session must only restore a valid unfinished session where `mode === "main"`.

---

# 14. Progress States

Each question can have one of these states:

```text
new
answered
correct
wrong
review
mastered
```

Recommended logic:

```text
First correct answer:
    status = correct

Wrong answer:
    status = wrong

Correct 3 times in review:
    status = mastered

Manually marked:
    status = review
```

---

# 15. Data Generation Workflow

To keep the project free, explanations and translations are generated manually before upload.

Workflow:

```text
Upload / convert PDF
  ↓
Create clean Markdown
  ↓
Check all questions and options
  ↓
Crop required images
  ↓
Use ChatGPT to generate Romaji, English, and explanations
  ↓
Format translation into Japanese | Romaji | English table data
  ↓
Insert rows into Supabase
  ↓
Publish exam set
```

## 15.1 Validation Checklist

Before publishing:

- All question numbers exist.
- All options ア〜エ exist.
- Correct answer exists.
- Japanese text is clean.
- Romaji exists.
- English translation exists.
- Explanation exists.
- Diagram images are attached where needed.
- Tables are readable.
- Question IDs are stable.
- No question is renumbered after release.

---

# 16. Recommended File Structure

For simple static frontend:

```text
index.html
app.js
questions.js
style.css
supabase-config.js
supabase-sync.js
supabase-schema.sql

public/
  questions/
    fe-2025-a/
      q03.png
      q14.png
```

For modular frontend:

```text
src/
  data/
    examSets/
      fe-2025-a-public.json
  lib/
    supabase.ts
    sync.ts
    historyMerge.ts
    sessionStore.ts
  components/
    QuizQuestion.vue
    TranslationTable.vue
    SyncStatus.vue
    QuestionImage.vue

public/
  questions/
    fe-2025-a/
      q03.png
      q14.png
```

---

# 17. Sync UI

The app must clearly show sync status.

Possible statuses:

```text
Syncing latest progress...
Synced just now
Saving answer...
Saved
Offline - cannot sync
Sync failed - retry
```

Do not silently fail.

---

# 18. PWA Requirements

The app should support iOS Home Screen shortcut behavior.

Required:

- Responsive mobile layout
- Web app manifest
- Apple touch icon
- Theme color
- Standalone display mode
- Safe-area support for iPhone
- Sync on resume
- Sync on focus
- Sync on online event
- Visible sync status

Example manifest:

```json
{
  "name": "FE Quiz Practice",
  "short_name": "FE Quiz",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#111827",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

# 19. Acceptance Criteria

## 19.1 Translation Acceptance Criteria

The app passes if:

- Each question has `[🌐 Show Translation]`.
- Clicking it shows a Japanese/Romaji/English table.
- The table includes question text.
- The table includes all options ア〜エ.
- The translation table is available before answering.
- The translation table is also available after answering.
- Translation appears instantly from stored data.
- No AI generation runs during quiz answering.

## 19.2 Sync Acceptance Criteria

The app passes if:

- App reads Supabase first on desktop load.
- App reads Supabase first on iOS Home Screen shortcut load.
- Desktop answers appear on iPhone.
- iPhone answers appear on desktop.
- Refresh does not lose progress.
- Reopening iOS Home Screen shortcut does not lose progress.
- Old local state does not overwrite newer backend progress.
- Answer is saved after every submit.
- Next Question is disabled until save succeeds.
- Main-session history is not deleted by another device.
- Wrong practice does not create main-session history.

## 19.3 Quiz Acceptance Criteria

The app passes if:

- 問1〜問20 are available.
- 問3 and 問14 show images.
- 問6 and 問19 show readable tables.
- Options ア〜エ display correctly.
- Correct answer is hidden before submit.
- Explanation is hidden before submit.
- Explanation appears after submit.
- Wrong-answer review works.
- Mark for review works.

---

# 20. Testing Plan

## 20.1 Translation Test

```text
1. Open 問1.
2. Confirm only Japanese question is visible first.
3. Click [🌐 Show Translation].
4. Confirm Japanese/Romaji/English table appears.
5. Confirm question and all options are included.
6. Click [Hide Translation].
7. Confirm table hides.
```

## 20.2 Backend-First Load Test

```text
1. Answer 問1 on desktop.
2. Confirm Supabase updated.
3. Create stale local state on iPhone.
4. Open iPhone Home Screen shortcut.
5. Confirm app reads Supabase first.
6. Confirm stale local state does not overwrite backend.
```

## 20.3 Cross-Device Test

```text
1. Open desktop.
2. Answer 問1.
3. Open iPhone Home Screen shortcut.
4. Confirm 問1 is already answered.
5. Answer 問2 on iPhone.
6. Refresh desktop.
7. Confirm 問2 is already answered.
```

## 20.4 Save Failure Test

```text
1. Disconnect internet.
2. Select an answer.
3. Press Submit.
4. Confirm app shows save failed or offline state.
5. Confirm Next Question is not enabled until save succeeds.
```

## 20.5 iOS Resume Test

```text
1. Open app from iPhone Home Screen shortcut.
2. Answer a question.
3. Lock iPhone.
4. Answer another question on desktop.
5. Unlock iPhone.
6. Confirm app refetches backend before allowing another answer.
```

## 20.6 Diagram Test

```text
1. Open 問3.
2. Confirm tree diagram image displays.
3. Open 問14.
4. Confirm PERT/network diagram image displays.
5. Confirm both images fit mobile screen width.
```

---

# 21. Risks and Mitigations

## 21.1 Old iOS Data Overwrites Desktop Progress

Mitigation:

```text
Backend-first load.
Per-question upsert.
No full answers overwrite.
updated_at/version checks.
```

## 21.2 Translation Data Is Missing or Poor

Mitigation:

```text
Manual pre-generation and review.
Validation checklist before publishing.
Fallback to Japanese-only if translation missing.
```

## 21.3 Diagram Conversion Is Wrong

Mitigation:

```text
Use original cropped image for 問3 and 問14.
```

## 21.4 Save Fails but User Moves Forward

Mitigation:

```text
No backend save = no next question.
Show Retry Save.
```

---

# 22. MVP Scope

## MVP Must Include

- FE 2025 科目A 問1〜問20
- Stable question IDs
- Japanese question display
- Options ア〜エ
- `[🌐 Show Translation]` button
- Japanese/Romaji/English translation table
- Images for 問3 and 問14
- HTML tables for 問6 and 問19
- Submit answer
- Backend save after submit
- Explanation after answer
- Backend-first sync
- Desktop + iOS Home Screen support
- Wrong-answer review
- Mark for review

## MVP Can Skip

- Admin dashboard
- Public multi-user system
- Payment system
- Native iOS app
- Real-time AI generation
- Leaderboard

---

# 23. Final Product Rule

The product must follow these two core rules:

```text
Rule 1:
The user can understand Japanese questions by opening one translation table:
Japanese | Romaji | English

Rule 2:
The user can switch between desktop browser and iPhone Home Screen shortcut anytime:
progress must always follow the user, and old local state must never overwrite backend progress.
```
