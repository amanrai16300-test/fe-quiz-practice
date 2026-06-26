# FE Quiz Practice

A local, no-build study app for the Japanese **基本情報技術者試験 (FE) 科目A** exam.
Questions are shown in Japanese with romaji and English study aids, plus an ELI5-first
explanation after each answer — built for non-native learners practicing real past-exam
questions.

## Features

- Home / paper selection screen
- Single-paper quiz flow: select → submit → feedback + explanation → next
- Translation panel: Japanese / Romaji / English for the question and each option (ア〜エ)
- ELI5-style explanations revealed after answering
- Question images for 問3 and 問14
- Question chip navigation (問1〜問20) for direct jump to any question
- Per-paper in-memory answer state (restores answered questions on return)
- Progress summary (answered / correct / wrong)
- Paper-tone design, touch-friendly, works on desktop and iPhone width

## Run Locally

No build step. Serve the folder over HTTP:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>.

## Current Question Set

- **令和7年度 基本情報技術者試験 科目A 公開問題** (paper ID `fe-2025-a-public`)
- 20 questions (問1〜問20), all answer keys validated

## Tech Stack

- Static **HTML / CSS / JavaScript** — no framework, no build, no dependencies
- Question data inlined as a JS module (`questions.js`)

## Not Added Yet

- localStorage (progress resets on refresh)
- Supabase / backend sync
- Authentication
- PWA (offline / installable)
- Multiple real papers (structure prepared, one paper wired)

## Next Planned Phase

Add **localStorage** so progress survives refresh.

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for full project status.
