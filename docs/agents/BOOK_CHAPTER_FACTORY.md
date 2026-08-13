# Book Chapter Factory

## Purpose

This document defines the reusable workflow for adding one or more FE textbook chapters to FE Quiz Practice. A future request may be as short as:

> Run the Book Chapter Factory for Book 1 Chapters 7–11.

That request authorizes a batch workflow, not inference. The factory operates only from authoritative source images and authoritative answer-key material supplied by the user. Missing, unreadable, conflicting, or uncertain evidence must be reported, never guessed or silently repaired.

Before every factory run, read and treat as authoritative:

- `docs/PROJECT_CONTEXT.md`, through its latest completed checkpoint;
- `docs/STUDY_ARCHITECTURE_PRD.md`;
- this factory document;
- the source images and answer-key material supplied for the requested batch.

As of this document's creation, the latest completed textbook milestone is **Book 1 Chapter 6 — COMPLETE / DEPLOYED / LIVE-VERIFIED / CLOSED**. Book 1 totals are Chapter 1 = 8, Chapter 2 = 15, Chapter 3 = 22, Chapter 4 = 19, Chapter 5 = 13, and Chapter 6 = 22, for 99 questions. Book 1 Chapters 7–11 are only the next intended batch. Their structure is unknown until authoritative material is supplied and inspected.

## Non-negotiable principles

### Source material is authoritative

For textbook questions:

- Source PNGs are authoritative for visible Japanese.
- Printed question numbers inside images are authoritative.
- Filenames, upload order, timestamps, directory order, and presumed ranges are not sufficient evidence for printed-number mapping.
- User-supplied answer-key screenshots are authoritative for correct labels.
- Never infer a missing correct answer from question logic, explanations, neighboring answers, patterns, or external conventions.
- Never silently repair, crop, regenerate, resize, recompress, rename, remap, or replace uncertain source material.
- Never transcribe accidental answer-revealing annotations into learner content.

If any fact cannot be determined confidently:

1. Mark the affected question or chapter as needing review.
2. Record the exact evidence gap or contradiction.
3. Stop dependent work for that affected unit.
4. Continue auditing independent chapters only where safe.
5. Never guess or silently skip the defect.

Speed must come from batching repetitive inspection, authoring, QA, catalog integration, and deployment verification. It must never come from invented structure or answers, shortened Language Help, shallow explanations, ignored anomalies, or bypassed QA.

### Batching does not merge Practice Sets

The factory supports contiguous or explicitly supplied batches such as Chapters 7–11 or Chapters 12–16. Batching is only an operational optimization.

Every real Practice Set remains a separate terminal question set with:

- its own generic `exam_set_id`;
- independent question identity;
- independent progress;
- independent resume state;
- independent reset behavior;
- independent database identity;
- the existing generic question and progress APIs.

Never combine Practice Sets into one set merely because they are processed in one batch.

## Authorization boundaries

A normal factory run may create new batch source folders and seed files, and update the declarative catalog, only after the applicable gates below pass and only when the user's run request includes implementation.

The factory must never automatically:

- commit;
- push;
- merge;
- rebase;
- deploy;
- import into Oracle;
- restart services;
- document deployment or live-verification success.

Those are separate, explicit user-controlled steps. A normal factory run stops with locally validated files.

Do not modify without explicit separate approval:

- backend architecture;
- database schema;
- importer architecture;
- API routes;
- authentication;
- synchronization;
- Nginx;
- systemd.

If real source material reveals a generic compatibility defect, stop and report it before changing architecture.

## Required input gate

Before Stage A, verify that the user has supplied the actual material for every requested chapter:

- source chapter folders and all candidate PNGs;
- authoritative answer-key screenshots or equivalent user-designated authoritative key material;
- explicit batch identity, such as Book 1 Chapters 7–11.

Do not create placeholder chapter folders, Practice Sets, seed files, catalog nodes, counts, ranges, option modes, or topics for material that has not been supplied.

## Stage A — Source Structure Intake

Inspect every supplied chapter folder before seed authoring. Determine structure from the actual files and visible printed content, not from expectations.

For every chapter, record:

- number of real Practice Sets;
- exact PNG count per set;
- total image count;
- actual filenames;
- printed question number visible inside every image;
- complete filename → printed-number mapping;
- printed-number sequence and gaps;
- duplicate printed numbers;
- missing or unexpected files;
- filename/order inconsistencies;
- suspicious or misplaced files;
- unreadable mappings;
- SHA-256 exact duplicates;
- answer-revealing annotations and other source anomalies.

Do not infer before inspection:

- Practice Set count;
- question count;
- printed-number ranges;
- answer keys;
- filename mappings;
- option modes;
- topic hierarchy.

Assign exactly one source status to each chapter:

```text
SOURCE INVENTORY: CONFIRMED
```

or:

```text
SOURCE INVENTORY: NEEDS REVIEW
```

`CONFIRMED` requires a complete, readable, unique mapping for every supplied source question and a precise disposition for every file and anomaly. `NEEDS REVIEW` must name the exact chapter, Practice Set, filename, printed number if visible, defect, evidence needed, and downstream work blocked.

Confirmed independent chapters may proceed to Stage B while chapters needing review remain blocked. Do not silently omit blocked chapters from batch reporting.

### Source intake report template

```text
SOURCE INTAKE REPORT

Book: <book>
Requested chapters: <range/list>

Chapter: <chapter>
Real Practice Sets: <count>
Per-set image counts:
- <set identity>: <count>
Total images: <count>

Filename → printed-number mapping:
- <path/filename> → <printed number>

Printed sequence: <sequence>
Gaps: <none/details>
Duplicate printed numbers: <none/details>
Missing/unexpected files: <none/details>
Filename/order inconsistencies: <none/details>
SHA-256 exact duplicates: <none/details>
Source anomalies: <none/details>
Uncertainties: <none/details>
Source status: SOURCE INVENTORY: CONFIRMED | SOURCE INVENTORY: NEEDS REVIEW
```

## Stage B — Answer-Key Lock

Run only after a chapter's source inventory is confirmed. Compare the supplied authoritative answer-key material against the confirmed printed-number inventory.

For every printed question:

- locate exactly one authoritative answer label;
- preserve the Japanese label exactly;
- record the per-question key;
- build a compact per-set sequence;
- build a compact per-chapter sequence;
- identify missing keys;
- identify duplicate or conflicting keys;
- identify keys with no matching source question;
- identify source questions with no key.

Never infer a missing answer from explanation logic or independent solving. The factory may independently sanity-check whether a supplied key appears logically compatible with the question. This check is diagnostic only and cannot replace the authoritative key.

If a genuine contradiction is detected:

1. Preserve the supplied key in the report as the authoritative supplied value.
2. Explain the contradiction and evidence precisely.
3. Mark the affected chapter `ANSWER KEY: NEEDS REVIEW`.
4. Stop authoring that affected chapter until the user resolves it.
5. Continue independent confirmed chapters where safe.

Assign exactly one answer-key status to each chapter:

```text
ANSWER KEY: CONFIRMED
```

or:

```text
ANSWER KEY: NEEDS REVIEW
```

### Answer-key report template

```text
ANSWER-KEY REPORT

Chapter: <chapter>
Per-question key:
- <printed number> → <Japanese label>

Per-set compact keys:
- <set identity>: <labels in printed order>

Per-chapter compact key: <set sequences separated clearly>
Missing keys: <none/details>
Duplicate/conflicting keys: <none/details>
Keys without source questions: <none/details>
Source questions without keys: <none/details>
Logical contradictions: <none/details; supplied key is not replaced>
Answer-key status: ANSWER KEY: CONFIRMED | ANSWER KEY: NEEDS REVIEW
```

## Stage C — Whole-Batch Authoring

Only a chapter with both `SOURCE INVENTORY: CONFIRMED` and `ANSWER KEY: CONFIRMED` may enter authoring.

### Practice Set identity and seed contract

Create one seed per real Practice Set using the proven generic seed envelope used by existing textbook chapters. Use stable generic IDs:

```text
bookN-chXX-setYY
```

For example, the format permits `book1-ch07-set01`; it does not authorize creating that set until source intake proves it exists.

Keep internal question numbers contiguous within each set when required by the current progress mapping. Preserve the actual printed number in the existing generic display-number field. Keep image paths beneath the matching source tree and preserve source order.

### Display mode

Inspect every question independently:

- Use `optionMode: "labels-only"` when the source image contains the complete question and complete answer group.
- Use the existing generic `structured-text` mode only when the question genuinely requires application-rendered option text.
- Never infer display mode from image existence alone.
- Never create a chapter-specific option mode, renderer, or compatibility branch.

### Question Language Help contract

Every question must contain complete:

- Japanese;
- Romaji;
- simple, accurate English.

Preserve all relevant source meaning, including:

- clauses and conditions;
- numbers and values;
- formulas and arithmetic;
- symbols and units;
- sequences and operation order;
- definitions and technical terms;
- table relationships;
- diagram meaning where relevant.

Never use `...` as an omission placeholder.

### Option contract

Every option must have:

- an explicit Japanese label;
- Japanese;
- Romaji;
- English.

Option identity and translation mapping are always label-based. Preserve authored order. Never use array index as answer truth.

For visual or diagram options:

- describe each option neutrally and accurately;
- distinguish the visible alternatives clearly;
- do not invent Japanese that is not printed;
- do not phrase the correct option more favorably than the others;
- use only the existing generic rendering model.

### Explanation contract

Every explanation must contain exactly this section order:

1. `ELI5:`
2. `Technical breakdown:`
3. `Japanese keywords to remember:`
4. `Why the best solution works:`
5. `Wrong answer analysis:`
6. `Memory trick:`
7. `Correct answer: X`

Requirements by section:

- `ELI5:` teaches the central idea to a beginner.
- `Technical breakdown:` gives step-by-step FE exam reasoning. Calculation questions include formula, known values, substitution, arithmetic, units/conversion, and conclusion.
- `Japanese keywords to remember:` uses `Japanese = romaji = English`.
- `Why the best solution works:` explains the underlying reason, not merely that it matches the key.
- `Wrong answer analysis:` analyzes every incorrect Japanese label separately and substantively. A normal four-choice question therefore has three distinct wrong-option explanations.
- `Memory trick:` is short and useful.
- The final line is exactly `Correct answer: X`, where `X` is the authoritative Japanese option label.

Headings alone are insufficient. The explanation must teach the concept, show the reasoning, explain why the best solution works, and explain why every other choice fails.

### Authoring report template

```text
AUTHORING REPORT

Chapter: <chapter>
Created seed files:
- <seed path>: <question count>

Total authored questions: <count>
Option-mode counts:
- labels-only: <count>
- structured-text: <count>

Language Help audit: <result/count>
Explanation audit: <result/count>
Answer conflicts: <none/details>
Blocked or unauthored units: <none/details>
```

## Stage D — Catalog Integration

After all eligible authoring for the requested batch is complete:

1. Update the declarative catalog once.
2. Insert chapters in correct Book order.
3. Create one generic collection node per confirmed chapter.
4. Add only confirmed real Practice Set children.
5. Use actual question counts from completed seeds.
6. Retain descendant-derived chapter and book totals.
7. Verify that no duplicate chapter or Practice Set node exists.

Never add a fake Topic layer. Topic remains optional and may be added only when authoritative product/source structure requires it.

Never create:

- chapter-specific controllers;
- chapter-specific renderers;
- Book-specific APIs;
- chapter-specific progress code;
- stored duplicate chapter/book counters.

If any requested chapter remains blocked, report the partial batch state explicitly. Do not represent the blocked chapter as implemented or available.

## Stage E — Whole-Batch QA

After all eligible chapters are authored and catalog integration is complete, run one comprehensive QA cycle across every new question and the whole batch.

### Source audit

Verify:

- filename → printed-number mapping;
- every referenced source exists;
- every source hash is unchanged from Stage A;
- no unexpected exact duplicates exist;
- every anomaly has an explicit disposition.

### Japanese audit

Verify that the transcription is complete and source-faithful, including clauses, values, formulas, symbols, units, conditions, sequences, tables, and diagrams where relevant.

### Romaji audit

Verify complete coverage. Do not omit operations, formulas, conditions, symbols that require verbalization, or technical terms.

### English audit

Verify complete, simple, technically accurate meaning without answer bias.

### Option audit

Verify:

- labels are explicit, non-empty, and unique;
- authored order is preserved;
- the correct answer belongs to the label set;
- Japanese, Romaji, and English mappings agree by label;
- visual choices are neutral and accurate.

### Answer audit

For every question, confirm that all of these agree with the authoritative key:

- seed `correct_answer`;
- explanation final answer;
- best-solution reasoning;
- wrong-answer analysis.

### Explanation audit

Substantively inspect all seven required sections. Do not pass an explanation merely because a heading search succeeds. Check calculation steps and separately labeled wrong-option reasoning.

### Catalog audit

Verify:

- correct chapter order;
- correct Practice Set children and order;
- no duplicate nodes;
- actual per-set counts;
- correct descendant-derived chapter and Book totals.

### Regression and static validation

Run all existing generic/static validation available in the repository, including:

- the complete seed-validation suite, not only new seeds;
- `node --check app.js`;
- `git diff --check`;
- existing content, catalog, and hash audits;
- DOM-reference and other static checks where available.

Use existing browser automation when already available. Do not install dependencies merely to force browser automation. If unavailable, report exactly:

```text
Browser regression: DEFERRED TO LIVE PRODUCTION QA
```

### Fix scope during QA

QA may fix content defects only in:

- seed files newly created for the current batch;
- declarative catalog entries newly added for the current batch.

Do not modify authoritative source images without explicit user instruction. Do not modify older chapters as collateral cleanup.

After any fix:

1. Rerun the affected focused audits.
2. Rerun the complete seed-validation suite.
3. Reconfirm source hashes when paths or source references were involved.
4. Update the QA report with the final verified result.

### Final QA report template

```text
FINAL QA REPORT

Chapter: <chapter>
Japanese: <result/count>
Romaji: <result/count>
English: <result/count>
Option mappings: <result/count>
Explanation quality: <result/count>
Authoritative answer audit: <result/count>
Source-image integrity: <result/count>
Catalog/totals: <result>
Validation: <result>
Static regression: <result>
Browser regression: <result or required deferred message>
Blockers: <none/details>

Whole batch:
Eligible chapters completed: <list>
Blocked chapters/questions: <none/details>
Created seeds/questions: <counts>
Catalog result: <result>
Complete validation result: <result>
Outstanding concerns: <none/details>
```

End the final QA report with exactly one of:

```text
BOOK CHAPTER FACTORY QA: PASSED — READY FOR IMPLEMENTATION COMMITS
```

or:

```text
BOOK CHAPTER FACTORY QA: FAILED — DO NOT COMMIT
```

Use `PASSED` only when every requested chapter is fully confirmed, authored, cataloged, and locally validated with no unresolved content or structural blocker. A batch with any unresolved requested chapter ends `FAILED`, even if independent chapters were safely audited or authored.

## Architecture guardrails

Preserve these proven contracts unless a genuine generic defect is demonstrated and separately approved:

- one shared quiz engine;
- generic `exam_set_id`;
- generic question API;
- generic progress GET/POST/DELETE;
- independent per-set progress, resume, and reset;
- explicit Japanese option labels;
- label-mapped Language Help;
- shared explanation renderer;
- shared lightbox/image viewer;
- source-image-first textbook presentation;
- descendant-derived totals;
- generic Oracle importer.

## Git policy

The factory never commits, pushes, merges, rebases, or deploys automatically. Locally validated files are the stopping point unless the user issues a separate explicit instruction.

Recommended later Git strategy:

- author multiple chapters in one factory run;
- keep file and report boundaries clear by chapter;
- allow separate chapter-level implementation commits afterward if desired;
- push those commits together;
- optionally deploy the entire validated multi-chapter batch to Oracle once.

This preserves fast processing and clear rollback boundaries.

## Oracle deployment policy

Oracle deployment is a separate controlled gate after implementation commits and pushes are completed manually.

Current architecture:

- Oracle source repo: `/home/ubuntu/fe-quiz-src`;
- frontend root: `/var/www/html`;
- backend: `/opt/fe-quiz-api/main.py`;
- FastAPI: `127.0.0.1:8010`;
- Nginx proxy: `/api/fe/`;
- DB environment: `/etc/fe-quiz-api.env`;
- generic importer: `scripts/import_seed_oracle.js`.

Never expose environment credentials.

When separately authorized, a multi-chapter deployment may:

1. Pull once.
2. Validate all new seeds.
3. Copy `app.js` once if its declarative catalog changed.
4. Deploy every new source-image directory.
5. Import every new generic set.
6. Perform health, API, and image verification once for the batch.
7. Perform live browser QA.

Do not restart the backend when no backend change occurred.

## Documentation checkpoint policy

Write the final project checkpoint only after all of the following actually occurred:

1. Local QA passed.
2. Implementation was committed and pushed.
3. Oracle deployment and imports completed.
4. Health, API, and image validation passed.
5. Live-browser verification passed.

Document only confirmed results. Never pre-document deployment, import, API, image, or live-browser success.

## Standard factory stop conditions

Stop dependent work and report when any of these occurs:

- missing or unreadable source image;
- uncertain filename → printed-number mapping;
- missing, duplicate, or conflicting printed number;
- unexplained SHA-256 duplicate;
- answer-revealing or misplaced source anomaly without user disposition;
- missing, duplicate, or conflicting authoritative key;
- key with no source question or source question with no key;
- genuine source/key contradiction;
- incomplete or uncertain option group;
- generic compatibility defect requiring architecture change;
- validation failure that cannot be corrected within new batch seeds or catalog entries.

Always identify the smallest affected unit and the exact evidence needed. Continue only with independent work that cannot be contaminated by the uncertainty.

## Factory completion rule

A chapter is factory-complete only when its source inventory and answer key are confirmed, all real Practice Sets are authored as independent generic sets, Language Help and explanations pass substantive audit, catalog integration is correct, source hashes remain intact, and all available local validation passes.

Batching changes throughput, not truth standards. If evidence is missing, stop and ask for it. Never invent it.
