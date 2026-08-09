// FE 科目A 演習 — quiz controller.
// Flow: render → select option → submit (lock + feedback + explanation) → next.
// Depends on QUIZ from questions.js.

const els = {
  studyHub: document.getElementById("studyHub"),
  studySourceList: document.getElementById("studySourceList"),
  pastExams: document.getElementById("pastExams"),
  studyHubBackBtn: document.getElementById("studyHubBackBtn"),
  paperList: document.getElementById("paperList"),
  quizApp: document.getElementById("quizApp"),
  backBtn: document.getElementById("backBtn"),
  examSet: document.getElementById("examSet"),
  examTitle: document.getElementById("examTitle"),
  progressLabel: document.getElementById("progressLabel"),
  progressFill: document.getElementById("progressFill"),
  qNav: document.getElementById("qNav"),
  sumAnswered: document.getElementById("sumAnswered"),
  sumTotal: document.getElementById("sumTotal"),
  sumCorrect: document.getElementById("sumCorrect"),
  sumWrong: document.getElementById("sumWrong"),
  qNumber: document.getElementById("qNumber"),
  qText: document.getElementById("qText"),
  qImages: document.getElementById("qImages"),
  qSupplemental: document.getElementById("qSupplemental"),
  translateBtn: document.getElementById("translateBtn"),
  translation: document.getElementById("translation"),
  transJaRow: document.getElementById("transJaRow"),
  transJa: document.getElementById("transJa"),
  transRomaji: document.getElementById("transRomaji"),
  transEn: document.getElementById("transEn"),
  optionTrans: document.getElementById("optionTrans"),
  answerPrompt: document.getElementById("answerPrompt"),
  options: document.getElementById("options"),
  explanationCard: document.getElementById("explanationCard"),
  verdict: document.getElementById("verdict"),
  answerLine: document.getElementById("answerLine"),
  explanationToggle: document.getElementById("explanationToggle"),
  explanationToggleText: document.getElementById("explanationToggleText"),
  explanationBody: document.getElementById("explanationBody"),
  imageLightbox: document.getElementById("imageLightbox"),
  lightboxPosition: document.getElementById("lightboxPosition"),
  lightboxViewport: document.getElementById("lightboxViewport"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxClose: document.getElementById("lightboxClose"),
  submitBtn: document.getElementById("submitBtn"),
  nextBtn: document.getElementById("nextBtn"),
  themeToggle: document.getElementById("themeToggle"),
  sourceStatus: document.getElementById("sourceStatus"),
  syncStatus: document.getElementById("syncStatus"),
  syncCode: document.getElementById("syncCode"),
  syncSave: document.getElementById("syncSave"),
  syncCodeStatus: document.getElementById("syncCodeStatus"),
};

// Compatibility only: static questions.js has no authored labels. Once a question
// crosses normalizeQuestion(), its own optionLabels are authoritative everywhere.
const LEGACY_POSITIONAL_LABELS = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ"];
const OPTION_DISPLAY_MODES = new Set(["labels-only", "structured-text"]);
let warnedAboutLegacyLabels = false;

function normalizeQuestion(raw, { sourceName = "question source", supplementalHtml } = {}) {
  const numberValue = raw.number ?? raw.id;
  const displayNumber = typeof numberValue === "string" && numberValue.startsWith("問")
    ? numberValue
    : `問${numberValue}`;

  const sourceImageValues = Array.isArray(raw.sourceImages)
    ? raw.sourceImages
    : Array.isArray(raw.imagePaths) && raw.imagePaths.length
      ? raw.imagePaths
      : [raw.image_path ?? raw.imagePath].filter(Boolean);
  const sourceImages = sourceImageValues.map((image, index) => {
    const entry = typeof image === "string" ? { path: image } : image;
    if (!entry || typeof entry.path !== "string" || !entry.path.trim()) {
      throw new Error(`${sourceName} ${displayNumber}: source image ${index + 1} has no path`);
    }
    return {
      path: entry.path,
      alt: entry.alt || `${displayNumber} の問題画像`,
      caption: entry.caption || "",
    };
  });

  const rawOptions = Array.isArray(raw.options) ? raw.options : [];
  if (!rawOptions.length) throw new Error(`${sourceName} ${displayNumber}: options are missing`);
  const authoredTranslations = Array.isArray(raw.optionTranslations)
    ? raw.optionTranslations
    : rawOptions;
  const optionObjects = rawOptions.map((option, index) => {
    const authored = typeof option === "object" && option !== null
      ? option
      : authoredTranslations[index] || { jp: option };
    return {
      explicitLabel: typeof authored.label === "string" ? authored.label.trim() : "",
      japanese: authored.jp ?? String(option ?? ""),
      romaji: authored.romaji ?? "",
      english: authored.en ?? "",
    };
  });

  const explicitCount = optionObjects.filter((option) => option.explicitLabel).length;
  let optionLabels;
  if (explicitCount === optionObjects.length) {
    optionLabels = optionObjects.map((option) => option.explicitLabel);
  } else if (explicitCount === 0) {
    optionLabels = optionObjects.map((_, index) => LEGACY_POSITIONAL_LABELS[index]);
    if (optionLabels.some((label) => !label)) {
      throw new Error(`${sourceName} ${displayNumber}: legacy positional labels support at most ${LEGACY_POSITIONAL_LABELS.length} options`);
    }
    if (!warnedAboutLegacyLabels) {
      console.warn("Using legacy positional option labels for questions.js compatibility.");
      warnedAboutLegacyLabels = true;
    }
  } else {
    throw new Error(`${sourceName} ${displayNumber}: option labels must be present on every option or none`);
  }
  if (optionLabels.some((label) => !label) || new Set(optionLabels).size !== optionLabels.length) {
    throw new Error(`${sourceName} ${displayNumber}: option labels must be non-empty and unique`);
  }

  const structuredOptions = optionObjects.map((option, index) => ({
    label: optionLabels[index],
    japanese: option.japanese,
    romaji: option.romaji,
    english: option.english,
  }));
  const explicitCorrect = raw.correctAnswerLabel ?? raw.correct_answer;
  const correctAnswerLabel = typeof explicitCorrect === "string"
    ? explicitCorrect.trim()
    : Number.isInteger(raw.correctAnswer)
      ? optionLabels[raw.correctAnswer]
      : null;
  if (!correctAnswerLabel || !optionLabels.includes(correctAnswerLabel)) {
    throw new Error(`${sourceName} ${displayNumber}: correct answer is not an authored option label`);
  }

  let optionDisplayMode = raw.optionDisplayMode ?? raw.optionMode ?? raw.display?.optionMode ?? "structured-text";
  if (!OPTION_DISPLAY_MODES.has(optionDisplayMode)) {
    throw new Error(`${sourceName} ${displayNumber}: unknown option display mode "${optionDisplayMode}"`);
  }
  if (optionDisplayMode === "labels-only" && sourceImages.length === 0) {
    console.error(`${sourceName} ${displayNumber}: labels-only requires a source image; using structured-text`);
    optionDisplayMode = "structured-text";
  }

  const questionTranslation = {
    japanese: raw.questionTranslation?.japanese ?? raw.translation?.japanese ?? raw.jp ?? raw.text ?? "",
    romaji: raw.questionTranslation?.romaji ?? raw.translation?.romaji ?? raw.romaji ?? "",
    english: raw.questionTranslation?.english ?? raw.translation?.english ?? raw.en ?? "",
  };
  const optionTranslationsByLabel = Object.fromEntries(
    structuredOptions.map((option) => [option.label, option])
  );

  return {
    id: raw.id ?? numberValue,
    number: displayNumber,
    sourceImages,
    optionDisplayMode,
    optionLabels,
    structuredOptions,
    correctAnswerLabel,
    questionTranslation,
    optionTranslationsByLabel,
    explanation: raw.explanation ?? "",
    supplementalHtml: raw.supplementalHtml ?? raw.supplemental_html ?? supplementalHtml ?? "",
    metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
  };
}

// Retain the original static A source independently. API switching mutates only
// the active QUIZ.questions array, never this normalized fallback.
const LOCAL_QUIZ_FALLBACK = {
  ...QUIZ,
  questions: QUIZ.questions.map((question) =>
    normalizeQuestion(question, { sourceName: "questions.js" })
  ),
};

// Shared presentation policy. Future textbook sets can select `textbook`
// without adding a second explanation renderer or source-ID branches.
const QUIZ_CONTEXT_POLICIES = Object.freeze({
  pastExam: Object.freeze({
    explanation: Object.freeze({
      correctExpanded: false,
      correctAction: "Review explanation",
      wrongExpanded: true,
      wrongAction: "Understand why",
    }),
  }),
  textbook: Object.freeze({
    explanation: Object.freeze({
      correctExpanded: true,
      correctAction: "Review explanation",
      wrongExpanded: true,
      wrongAction: "Understand why",
    }),
  }),
});
let activeQuizContext = {
  ...QUIZ_CONTEXT_POLICIES.pastExam,
  imageContainsQuestionText: false,
};

const state = {
  index: 0,
  selected: null, // canonical option label, or null
  submitted: false,
  paperId: null,
  furthest: 0, // high-water mark of furthest question index reached (0-based)
};

// In-memory answer store, scoped by paper ID. Lives only for this browser session.
// Shape: answers[paperId][index] = { selected: label|null, submitted, isCorrect }.
// ponytail: plain object, no persistence — sync layer can serialize this later.
const answers = {};
const explanationStates = {};
function paperStore() {
  return (answers[state.paperId] ??= {});
}

function explanationStore() {
  return (explanationStates[state.paperId] ??= {});
}

function currentQuestion() {
  return QUIZ.questions[state.index];
}

// Derive answered/correct/wrong from the in-memory store for the current paper.
function updateSummary() {
  const submitted = Object.values(paperStore()).filter((a) => a.submitted);
  const correct = submitted.filter((a) => a.isCorrect).length;
  els.sumAnswered.textContent = submitted.length;
  els.sumTotal.textContent = QUIZ.questions.length;
  els.sumCorrect.textContent = correct;
  els.sumWrong.textContent = submitted.length - correct;
}

let lightboxOpener = null;

function closeImageLightbox({ restoreFocus = true } = {}) {
  if (els.imageLightbox.hidden) return;
  els.imageLightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  els.lightboxImage.removeAttribute("src");
  if (restoreFocus && lightboxOpener?.isConnected) lightboxOpener.focus();
  lightboxOpener = null;
}

function openImageLightbox(sourceImage, index, total, opener) {
  lightboxOpener = opener;
  els.lightboxImage.src = sourceImage.path;
  els.lightboxImage.alt = sourceImage.alt;
  els.lightboxPosition.textContent = total > 1 ? `Image ${index + 1} of ${total}` : "Image 1 of 1";
  els.imageLightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  els.lightboxViewport.scrollTo({ top: 0, left: 0 });
  els.lightboxClose.focus();
}

function lightboxFocusableElements() {
  return [...els.imageLightbox.querySelectorAll(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden);
}

els.lightboxClose.addEventListener("click", () => closeImageLightbox());
els.imageLightbox.addEventListener("click", (event) => {
  if (event.target === els.imageLightbox) closeImageLightbox();
});
document.addEventListener("keydown", (event) => {
  if (els.imageLightbox.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeImageLightbox();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = lightboxFocusableElements();
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !els.imageLightbox.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !els.imageLightbox.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
});

function renderSourceImages(question) {
  els.qImages.innerHTML = "";
  question.sourceImages.forEach((sourceImage, index) => {
    const figure = document.createElement("figure");
    figure.className = "q-source-figure is-loading";

    const frame = document.createElement("div");
    frame.className = "q-source-frame";
    const status = document.createElement("div");
    status.className = "q-image-status";
    status.setAttribute("aria-live", "polite");
    const image = document.createElement("img");
    image.className = "q-source-image";
    image.alt = sourceImage.alt;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    if (index === 0) image.fetchPriority = "high";

    const enlarge = document.createElement("button");
    enlarge.type = "button";
    enlarge.className = "q-image-enlarge";
    enlarge.textContent = "⤢ Enlarge image";
    enlarge.setAttribute(
      "aria-label",
      `Enlarge ${question.number} image ${index + 1} of ${question.sourceImages.length}`
    );
    enlarge.hidden = true;
    enlarge.addEventListener("click", () =>
      openImageLightbox(sourceImage, index, question.sourceImages.length, enlarge)
    );

    const showLoading = () => {
      figure.classList.remove("is-loaded", "is-error");
      figure.classList.add("is-loading");
      image.hidden = false;
      enlarge.hidden = true;
      status.hidden = false;
      status.className = "q-image-status";
      status.replaceChildren(document.createTextNode("Loading question image…"));
    };
    const loadImage = () => {
      showLoading();
      image.removeAttribute("src");
      requestAnimationFrame(() => image.setAttribute("src", sourceImage.path));
    };
    image.addEventListener("load", () => {
      figure.classList.remove("is-loading", "is-error");
      figure.classList.add("is-loaded");
      status.hidden = true;
      enlarge.hidden = false;
    });
    image.addEventListener("error", () => {
      figure.classList.remove("is-loading", "is-loaded");
      figure.classList.add("is-error");
      image.hidden = true;
      enlarge.hidden = true;
      status.hidden = false;
      status.className = "q-image-status is-error";
      const message = document.createElement("p");
      message.textContent = "The question image could not be loaded.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "q-image-retry";
      retry.textContent = "Retry";
      retry.addEventListener("click", loadImage);
      status.replaceChildren(message, retry);
    });

    frame.append(status, image);
    figure.append(frame, enlarge);
    if (sourceImage.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = sourceImage.caption;
      figure.appendChild(caption);
    }
    els.qImages.appendChild(figure);
    loadImage();
  });
  els.qImages.hidden = question.sourceImages.length === 0;
}

function render() {
  closeImageLightbox({ restoreFocus: false });
  const q = currentQuestion();
  state.selected = null;
  state.submitted = false;

  // Mirror current index locally so a reload can restore it even when the
  // backend has no saved progress (offline / new sync code / fetch failed).
  localStorage.setItem(ACTIVE_INDEX_STORAGE, String(state.index));

  // Header.
  els.examSet.textContent = QUIZ.examSet;
  els.examTitle.textContent = QUIZ.year;

  // Progress.
  const total = QUIZ.questions.length;
  els.progressLabel.textContent = `${state.index + 1} / ${total} 問`;
  els.progressFill.style.width = `${((state.index + 1) / total) * 100}%`;
  updateSummary();
  const store = paperStore();
  [...els.qNav.children].forEach((btn, i) => {
    const active = i === state.index;
    btn.classList.toggle("is-active", active);
    btn.classList.toggle("answered", !!store[i]?.submitted);
    btn.setAttribute("aria-current", active ? "true" : "false");
  });

  // Question.
  els.qNumber.textContent = q.number;
  const isImageFirstLabels = q.optionDisplayMode === "labels-only" && q.sourceImages.length > 0;
  els.qText.textContent = q.questionTranslation.japanese;
  els.qText.hidden = isImageFirstLabels || !q.questionTranslation.japanese;

  renderSourceImages(q);

  // Supplemental HTML remains a trusted legacy fallback. Source images retain
  // their established priority so B does not render its recreated HTML twice.
  if (q.sourceImages.length === 0 && q.supplementalHtml) {
    els.qSupplemental.innerHTML = q.supplementalHtml;
    els.qSupplemental.hidden = false;
  } else {
    els.qSupplemental.innerHTML = "";
    els.qSupplemental.hidden = true;
  }

  // Language Help stays secondary to the source. Japanese transcription remains
  // in the model, but is visually omitted when the image is the primary source.
  const imageJapaneseIsPrimary = q.sourceImages.length > 0 && (
    q.optionDisplayMode === "labels-only" || activeQuizContext.imageContainsQuestionText
  );
  els.transJa.textContent = q.questionTranslation.japanese;
  els.transRomaji.textContent = q.questionTranslation.romaji;
  els.transEn.textContent = q.questionTranslation.english;
  els.transJaRow.hidden = imageJapaneseIsPrimary;

  // Translation identity follows the same explicit labels as answer controls.
  els.optionTrans.innerHTML = "";
  q.optionLabels.forEach((label) => {
    const option = q.optionTranslationsByLabel[label];
    const card = document.createElement("article");
    card.className = "opt-trans";
    const optionLabel = document.createElement("h4");
    optionLabel.className = "opt-trans-label";
    optionLabel.textContent = label;
    const lines = document.createElement("div");
    lines.className = "opt-trans-lines";
    const addHelpLine = (term, value, className) => {
      const row = document.createElement("div");
      row.className = "opt-trans-row";
      const key = document.createElement("span");
      key.className = "opt-trans-term";
      key.textContent = term;
      const text = document.createElement("p");
      text.className = className;
      text.textContent = value || "Translation not available";
      row.append(key, text);
      lines.appendChild(row);
    };
    if (!imageJapaneseIsPrimary) addHelpLine("Japanese", option.japanese, "opt-trans-jp");
    addHelpLine("Romaji", option.romaji, "opt-trans-romaji");
    addHelpLine("English", option.english, "opt-trans-en");
    card.append(optionLabel, lines);
    els.optionTrans.appendChild(card);
  });

  els.translation.hidden = true;
  els.translateBtn.setAttribute("aria-expanded", "false");

  // Options.
  els.options.innerHTML = "";
  const labelsOnly = q.optionDisplayMode === "labels-only";
  els.answerPrompt.hidden = !labelsOnly;
  els.options.classList.toggle("is-labels-only", labelsOnly);
  q.structuredOptions.forEach((option) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.dataset.label = option.label;
    btn.setAttribute("role", "option");
    const optionLabel = document.createElement("span");
    optionLabel.className = "option-label";
    optionLabel.textContent = option.label;
    btn.appendChild(optionLabel);
    if (!labelsOnly) {
      const optionText = document.createElement("span");
      optionText.className = "option-text";
      optionText.textContent = option.japanese;
      btn.appendChild(optionText);
    }
    btn.addEventListener("click", () => selectOption(option.label));
    li.appendChild(btn);
    els.options.appendChild(li);
  });

  // Explanation hidden until submit (never reveal correctAnswer early).
  els.explanationCard.hidden = true;
  els.explanationBody.hidden = true;
  els.explanationToggle.setAttribute("aria-expanded", "false");

  // Buttons.
  els.submitBtn.hidden = false;
  els.submitBtn.disabled = true;
  els.nextBtn.hidden = true;

  // Replay saved answer for this question, if any (in-session, per paper).
  const saved = store[state.index];
  if (saved) {
    const selectedLabel = normalizeStoredSelection(q, saved.selected);
    if (saved.submitted) {
      state.selected = selectedLabel;
      applyVerdictUI(q);
    } else if (selectedLabel !== null) {
      selectOption(selectedLabel);
    }
  }
}

function normalizeStoredSelection(question, selection) {
  if (typeof selection === "string" && question.optionLabels.includes(selection)) return selection;
  if (Number.isInteger(selection)) return question.optionLabels[selection] ?? null;
  return null;
}

function selectOption(label) {
  if (state.submitted) return;
  const q = currentQuestion();
  if (!q.optionLabels.includes(label)) {
    console.error(`${q.number}: ignored unknown option label "${label}"`);
    return;
  }
  state.selected = label;
  [...els.options.querySelectorAll(".option")].forEach((btn) => {
    const selected = btn.dataset.label === label;
    btn.classList.toggle("selected", selected);
    btn.setAttribute("aria-selected", selected ? "true" : "false");
  });
  els.submitBtn.disabled = false; // enable only once an option is picked
  // Persist selection so a pre-submit pick survives jump/return.
  paperStore()[state.index] = { selected: label, submitted: false, isCorrect: null };
}

function setExplanationExpanded(expanded, { remember = true } = {}) {
  els.explanationBody.hidden = !expanded;
  els.explanationToggle.setAttribute("aria-expanded", String(expanded));
  if (remember) explanationStore()[state.index] = expanded;
}

function explanationPresentation(isRight) {
  const policy = activeQuizContext.explanation || QUIZ_CONTEXT_POLICIES.pastExam.explanation;
  return isRight
    ? { expanded: policy.correctExpanded, action: policy.correctAction }
    : { expanded: policy.wrongExpanded, action: policy.wrongAction };
}

// Lock options, show verdict + explanation, swap to Next. Used by submit() and by
// render() when replaying a previously submitted answer.
function applyVerdictUI(q) {
  const correct = q.correctAnswerLabel;
  const isRight = state.selected === correct;

  [...els.options.querySelectorAll(".option")].forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("selected");
    if (btn.dataset.label === correct) btn.classList.add("correct");
    else if (btn.dataset.label === state.selected) btn.classList.add("incorrect");
  });

  els.verdict.textContent = isRight ? "正解！" : "不正解";
  els.verdict.className = `explanation-verdict ${isRight ? "is-correct" : "is-wrong"}`;
  els.answerLine.textContent = `正解: ${correct}`;
  els.explanationBody.innerHTML = renderExplanation(q.explanation);
  els.explanationCard.hidden = false;
  const presentation = explanationPresentation(isRight);
  els.explanationToggleText.textContent = presentation.action;
  const remembered = explanationStore()[state.index];
  setExplanationExpanded(
    typeof remembered === "boolean" ? remembered : presentation.expanded,
    { remember: false }
  );

  els.submitBtn.hidden = true;
  els.nextBtn.hidden = false;
  els.nextBtn.textContent =
    state.index >= QUIZ.questions.length - 1 ? "最初に戻る ↺" : "次の問題 →";
  return isRight;
}

function submit() {
  if (state.submitted || state.selected === null) return;
  state.submitted = true;
  const q = currentQuestion();
  const isRight = applyVerdictUI(q);
  // Persist submitted result for in-session replay on return.
  paperStore()[state.index] = {
    selected: state.selected,
    submitted: true,
    isCorrect: isRight,
  };
  state.furthest = Math.max(state.furthest, state.index);
  updateSummary();
  saveProgress(); // fire-and-forget backend sync
}

// Known section labels (full line OR inline "Label: value"). Each maps to a
// short title + a kind that drives the panel's accent color. Generic — every
// paper (科目A/B, current + future) uses the same four sections; an explanation
// with none of these just renders as plain paragraphs.
const EXP_SECTIONS = [
  { label: "ELI5:", title: "ELI5", kind: "eli5" },
  { label: "Technical breakdown:", title: "Technical breakdown", kind: "tech" },
  { label: "Wrong answer analysis:", title: "Wrong answer analysis", kind: "wrong" },
  { label: "Correct answer:", title: "Correct answer", kind: "answer" },
];
const EXP_LABELS = new Map(EXP_SECTIONS.map((s) => [s.label, s]));

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

// body text -> paragraphs. Every non-empty line becomes its own <p> (both blank
// lines AND single newlines break paragraphs), so explanations authored with
// single-newline breaks still read as separated paragraphs. Empty lines are
// dropped — spacing comes from .exp-p margin, not blank lines / pre-wrap.
function explanationParagraphs(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p class="exp-p">${escapeHtml(line)}</p>`)
    .join("");
}

// Match a known section at the start of a line: "Label" alone OR "Label: value".
// Returns {section, inline} or null. Used to split the flat text into sections.
function matchSectionHeading(line) {
  const t = line.trim();
  if (EXP_LABELS.has(t)) return { section: EXP_LABELS.get(t), inline: "" };
  const colon = t.indexOf(":");
  if (colon !== -1) {
    const label = t.slice(0, colon + 1);
    if (EXP_LABELS.has(label)) {
      return { section: EXP_LABELS.get(label), inline: t.slice(colon + 1).trim() };
    }
  }
  return null;
}

// Plain explanation text -> safe, structured section panels. Walk lines, start a
// new section at each known heading, accumulate body until the next heading. Text
// before the first heading becomes a lead paragraph. Content is never altered —
// only escaped and wrapped. Same renderer serves all current/future papers.
function renderExplanation(text) {
  const lines = (text || "").split("\n");
  const lead = []; // paragraphs before the first known heading
  const sections = []; // { section, body: string[] }
  let current = null;

  for (const line of lines) {
    const hit = matchSectionHeading(line);
    if (hit) {
      current = { section: hit.section, body: hit.inline ? [hit.inline] : [] };
      sections.push(current);
    } else if (current) {
      current.body.push(line);
    } else {
      lead.push(line);
    }
  }

  // No recognized headings → fall back to plain paragraphs (still readable).
  if (sections.length === 0) return explanationParagraphs(text);

  let html = explanationParagraphs(lead.join("\n"));
  for (const { section, body } of sections) {
    html += `
      <section class="exp-section exp-${section.kind}">
        <span class="exp-badge">${escapeHtml(section.title)}</span>
        <div class="exp-section-body">${explanationParagraphs(body.join("\n"))}</div>
      </section>`;
  }
  return html;
}

function next() {
  state.index = (state.index + 1) % QUIZ.questions.length;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Question jump navigator — chips render fresh; does not touch answer data.
// Built after question source resolves (API or local fallback), see init().
function buildQNav() {
  els.qNav.innerHTML = "";
  QUIZ.questions.forEach((q, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qnav-chip";
    btn.textContent = q.number;
    btn.addEventListener("click", () => {
      state.index = i;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    els.qNav.appendChild(btn);
  });
}

els.translateBtn.addEventListener("click", () => {
  const open = els.translation.hidden;
  els.translation.hidden = !open;
  els.translateBtn.setAttribute("aria-expanded", String(open));
});
els.explanationToggle.addEventListener("click", () => {
  setExplanationExpanded(els.explanationBody.hidden);
});
els.submitBtn.addEventListener("click", submit);
els.nextBtn.addEventListener("click", next);

// Phase 1 study-source catalog. Only Past Exams opens real content; textbook
// sources establish the product hierarchy without inventing chapters/questions.
const STUDY_SOURCES = [
  {
    id: "past-exams",
    marker: "EXAM",
    tone: "exam",
    title: "Past Exam Questions",
    japaneseTitle: "過去問題",
    description: "Practice official FE questions by year and exam section.",
    available: true,
  },
  {
    id: "textbook-1",
    marker: "B1",
    tone: "book-one",
    title: "Textbook Practice — Book 1",
    japaneseTitle: "テキスト演習 1",
    description: "Textbook practice content is being prepared.",
    available: false,
  },
  {
    id: "textbook-2",
    marker: "B2",
    tone: "book-two",
    title: "Textbook Practice — Book 2",
    japaneseTitle: "テキスト演習 2",
    description: "Textbook practice content is being prepared.",
    available: false,
  },
];

// Exam sets grouped by year → section (科目A / 科目B). `available` gates whether a
// card can be started; an unavailable section has no question data yet and stays a
// disabled "coming soon" card. Both current papers use the API; `quiz` is the
// static fallback source available for 科目A only.
const EXAM_YEAR = "令和7年度（2025）";
const EXAM_SETS = [
  {
    id: "fe-2025-a-public",
    year: EXAM_YEAR,
    section: "科目A 公開問題",
    desc: "Japanese questions with romaji, English translation, and explanations.",
    questionCount: 20,
    quiz: LOCAL_QUIZ_FALLBACK, // immutable normalized questions.js fallback
    contextPolicy: "pastExam",
    imageContainsQuestionText: false,
    available: true,
  },
  {
    id: "fe-2025-b-public",
    year: EXAM_YEAR,
    section: "科目B 公開問題",
    desc: "Algorithm & programming questions (問1〜問6), loaded from the backend.",
    questionCount: 6,
    quiz: null,          // API-only: no questions.js fallback. Must load from Oracle.
    contextPolicy: "pastExam",
    imageContainsQuestionText: true,
    available: true,
  },
];

// Minimal reload view-state: which paper is open in practice mode, if any.
// Set on Start Practice, cleared on Back to home. Read on init to reopen.
const ACTIVE_PAPER_STORAGE = "fe-quiz-active-paper";
// Local mirror of the current question index, written on every render(). Used as
// the reload fallback when backend progress is missing/offline (backend wins when
// it has a value; see init() reopen flow).
const ACTIVE_INDEX_STORAGE = "fe-quiz-active-index";

function clearActiveQuizViewState() {
  closeImageLightbox({ restoreFocus: false });
  localStorage.removeItem(ACTIVE_PAPER_STORAGE);
  localStorage.removeItem(ACTIVE_INDEX_STORAGE);
}

function showStudyHub() {
  clearActiveQuizViewState();
  els.quizApp.hidden = true;
  els.pastExams.hidden = true;
  els.studyHub.hidden = false;
  window.scrollTo({ top: 0 });
}

function showPastExams({ preserveStatus = false } = {}) {
  clearActiveQuizViewState();
  if (!preserveStatus) setSourceStatus("");
  els.quizApp.hidden = true;
  els.studyHub.hidden = true;
  els.pastExams.hidden = false;
  window.scrollTo({ top: 0 });
}

async function startPaper(paper, { reopen = false } = {}) {
  if (!paper.available) return; // future disabled paper — never starts

  activeQuizContext = {
    ...(QUIZ_CONTEXT_POLICIES[paper.contextPolicy] || QUIZ_CONTEXT_POLICIES.pastExam),
    imageContainsQuestionText: !!paper.imageContainsQuestionText,
  };

  localStorage.setItem(ACTIVE_PAPER_STORAGE, paper.id);

  // Load this paper's questions + backend progress before showing the quiz, so the
  // first render has the right content and answers. loadProgress sets state.paperId
  // and may set state.index; returns whether the backend supplied an index.
  const loaded = await loadQuestions(paper);
  if (!loaded) {
    // API-only paper failed to load (e.g. 科目B backend unreachable). Don't fall
    // through to another paper's data — return to Past Exams with a clear message.
    localStorage.removeItem(ACTIVE_PAPER_STORAGE);
    localStorage.removeItem(ACTIVE_INDEX_STORAGE);
    setSourceStatus(`${paper.section} を読み込めませんでした。あとでもう一度お試しください。/ Could not load questions; please try again later.`);
    showPastExams({ preserveStatus: true });
    return;
  }
  const backendHasIndex = await loadProgress(paper.id);
  state.paperId = paper.id; // ensure set even if loadProgress failed
  buildQNav();

  if (reopen) {
    // Reload restore: pick the question the user was VIEWING. The local mirror is
    // source of truth (written every render(), tracks unanswered navigation);
    // backend index is fallback; else Q1.
    const raw = localStorage.getItem(ACTIVE_INDEX_STORAGE);
    if (raw !== null && raw !== "") {
      const localIdx = Number(raw);
      if (Number.isInteger(localIdx)) {
        state.index = Math.min(Math.max(localIdx, 0), QUIZ.questions.length - 1);
      }
    } else if (!backendHasIndex) {
      state.index = 0;
    } // else: keep backend index already set by loadProgress()
  } else if (!backendHasIndex) {
    // Fresh start with no synced index → begin at Q1.
    state.index = 0;
  } // else: backend restored a current index for this paper — resume there.

  els.studyHub.hidden = true;
  els.pastExams.hidden = true;
  els.quizApp.hidden = false;
  render();
  window.scrollTo({ top: 0 });
}

function buildStudyHub() {
  els.studySourceList.innerHTML = "";
  STUDY_SOURCES.forEach((source) => {
    const item = document.createElement("li");
    item.className = "study-source-item";

    const card = document.createElement("article");
    card.className = `source-card source-${source.tone}${source.available ? "" : " is-coming-soon"}`;

    const header = document.createElement("div");
    header.className = "source-card-header";

    const marker = document.createElement("span");
    marker.className = "source-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = source.marker;
    header.appendChild(marker);

    const status = document.createElement("span");
    status.className = "source-availability";
    status.textContent = source.available ? "Available" : "Coming soon";
    header.appendChild(status);
    card.appendChild(header);

    const title = document.createElement("h2");
    title.className = "source-title";
    title.textContent = source.title;
    card.appendChild(title);

    const japaneseTitle = document.createElement("p");
    japaneseTitle.className = "source-title-ja";
    japaneseTitle.textContent = source.japaneseTitle;
    card.appendChild(japaneseTitle);

    const description = document.createElement("p");
    description.className = "source-description";
    description.textContent = source.description;
    card.appendChild(description);

    const action = document.createElement("button");
    action.type = "button";
    action.className = `btn source-action${source.available ? " btn-primary" : " btn-secondary"}`;
    if (source.available) {
      action.textContent = "Open Past Exams";
      action.addEventListener("click", showPastExams);
    } else {
      action.textContent = "Coming soon";
      action.disabled = true;
    }
    card.appendChild(action);

    item.appendChild(card);
    els.studySourceList.appendChild(item);
  });
}

function buildPapers() {
  els.paperList.innerHTML = "";
  // Group papers by year so the year selector drives which section cards show.
  const byYear = new Map();
  EXAM_SETS.forEach((p) => {
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year).push(p);
  });
  const years = [...byYear.keys()];

  const li = document.createElement("li");
  li.className = "card year-card";

  // Year selector: an obvious labelled dropdown, even with a single year today.
  const label = document.createElement("label");
  label.className = "year-label";
  label.setAttribute("for", "yearSelect");
  label.textContent = "年度を選択 / Select year";
  li.appendChild(label);

  const select = document.createElement("select");
  select.className = "year-select";
  select.id = "yearSelect";
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    select.appendChild(opt);
  });
  li.appendChild(select);

  // Section cards for the selected year, re-rendered on change.
  const sections = document.createElement("div");
  sections.className = "section-list";
  const renderSections = (year) => {
    sections.innerHTML = "";
    byYear.get(year).forEach((paper) => sections.appendChild(buildSectionCard(paper)));
  };
  select.addEventListener("change", () => renderSections(select.value));
  renderSections(years[0]);
  li.appendChild(sections);

  els.paperList.appendChild(li);
}

// One 科目 section card. Available → Start/Resume button. Unavailable → disabled
// "未追加" card that can't be started.
function buildSectionCard(paper) {
  const card = document.createElement("div");
  card.className = "section-card" + (paper.available ? "" : " is-disabled");

  const title = document.createElement("p");
  title.className = "paper-title";
  title.textContent = paper.section;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "paper-desc";
  desc.textContent = paper.desc;
  card.appendChild(desc);

  const meta = document.createElement("p");
  meta.className = "paper-meta";
  meta.textContent = paper.available
    ? `${paper.questionCount} questions`
    : "未追加 / Coming soon";
  card.appendChild(meta);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-primary paper-start";
  if (paper.available) {
    btn.textContent = "Start Practice";
    btn.addEventListener("click", () => startPaper(paper));
  } else {
    btn.textContent = "Coming soon";
    btn.disabled = true;
  }
  card.appendChild(btn);

  // Reset button — only on enabled papers. Clears this paper's progress (backend
  // + local) after a confirm; leaves Start/Resume, sync code, theme untouched.
  if (paper.available) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn btn-reset paper-reset";
    reset.textContent = "Reset progress";
    reset.addEventListener("click", () => resetProgress(paper.id));
    card.appendChild(reset);
  }
  return card;
}

els.studyHubBackBtn.addEventListener("click", showStudyHub);
els.backBtn.addEventListener("click", showPastExams);

// Light/dark theme — flip one data-attr on <html>; CSS tokens do the rest.
// Persisted in localStorage so reload keeps the choice (home and practice screens).
const THEME_STORAGE = "fe-quiz-theme";

function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  els.themeToggle.setAttribute("aria-pressed", String(dark));
  els.themeToggle.querySelector(".theme-toggle-text").textContent = dark ? "Light" : "Dark";
  els.themeToggle.querySelector("[aria-hidden]").textContent = dark ? "☀️" : "🌙";
}

els.themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") !== "dark";
  applyTheme(dark);
  localStorage.setItem(THEME_STORAGE, dark ? "dark" : "light");
});

// --- Backend question loading (read-only, with questions.js fallback) -------
// API URLs are derived from the selected exam_set_id, so every paper drives its own
// questions/progress endpoints. Try the Oracle FE Quiz API for questions; on any
// failure fall back to the paper's static `quiz` (questions.js) data.
const questionsUrl = (id) => `/api/fe/exam-sets/${id}/questions`;
const progressUrl = (id) => `/api/fe/progress/${id}`;

// Trusted A-only supplemental fallback, keyed by normalized numeric question ID.
const LOCAL_SUPPLEMENTAL = new Map(
  LOCAL_QUIZ_FALLBACK.questions
    .filter((q) => q.supplementalHtml)
    .map((q) => [q.id, q.supplementalHtml])
);

function setSourceStatus(text) {
  if (els.sourceStatus) els.sourceStatus.textContent = text;
}

// Load questions for the given paper into QUIZ.questions (the live array app.js
// renders). Try the API first; on failure fall back to the paper's static `quiz`.
// Returns true when QUIZ.questions holds this paper's data, false when neither the
// API nor a static fallback could supply it (API-only papers like 科目B). The
// caller must abort to home on false so we never render the wrong paper's content.
async function loadQuestions(paper) {
  try {
    const res = await fetch(questionsUrl(paper.id), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const apiQuestions = data && Array.isArray(data.questions) ? data.questions : null;
    if (!apiQuestions || apiQuestions.length === 0) throw new Error("empty question set");

    // Only 科目A may reuse the static questions.js supplemental map (Q6/Q19).
    const useLocalSupplemental = paper.id === "fe-2025-a-public";
    const normalizedQuestions = apiQuestions.map((question) =>
      normalizeQuestion(question, {
        sourceName: `API ${paper.id}`,
        supplementalHtml: useLocalSupplemental
          ? LOCAL_SUPPLEMENTAL.get(question.number)
          : undefined,
      })
    );
    QUIZ.questions.length = 0;
    normalizedQuestions.forEach((question) => QUIZ.questions.push(question));
    setSourceStatus(""); // online: no banner needed
    return true;
  } catch (error) {
    const contractFailure = error instanceof Error && /^(questions\.js|API )/.test(error.message);
    if (contractFailure) console.error(`Question contract failed for ${paper.id}:`, error);
    else console.warn(`Question load failed for ${paper.id}:`, error);
    // Fall back only to this paper's independent normalized static source.
    if (paper.quiz) {
      QUIZ.questions.length = 0;
      paper.quiz.questions.forEach((q) => QUIZ.questions.push(q));
      setSourceStatus("Offline / local question set");
      return true;
    }
    // API-only paper (科目B) and the API failed: do NOT keep the previously loaded
    // paper's questions (that would silently show 科目A). Clear and signal failure.
    QUIZ.questions.length = 0;
    setSourceStatus("");
    return false;
  }
}

// --- Backend progress sync (per-browser key, optional, never blocks) --------
// Saves/loads quiz progress via the Oracle FE Quiz API. Auth is a single
// browser-local key sent as X-FE-User-Key — no login, email, or password.
// The backend turns an unknown key into a users row server-side; we never send
// user_id/username. Any failure leaves the in-memory experience untouched.
// Progress URLs are derived per exam_set_id via progressUrl().
const USER_KEY_STORAGE = "fe-quiz-user-key";
const SYNC_CODE_STORAGE = "fe-quiz-sync-code";
// Sync code = a shareable identity the user types on each device. Same chars the
// backend stores as users.username. Letters/digits/hyphen/underscore, 4–40.
const SYNC_CODE_RE = /^[A-Za-z0-9_-]{4,40}$/;

// The identity sent as X-FE-User-Key. A user-typed sync code wins (lets two
// devices share progress); otherwise fall back to a per-browser random key
// generated on first use and reused forever. The random key is never shown.
function getUserKey() {
  const code = localStorage.getItem(SYNC_CODE_STORAGE);
  if (code) return code;
  let key = localStorage.getItem(USER_KEY_STORAGE);
  if (!key) {
    key = (crypto.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(USER_KEY_STORAGE, key);
  }
  return key;
}

// Apply a typed sync code: validate, store, then re-pull progress for the new
// identity and redraw. Never erases backend data or the loaded questions.
async function applySyncCode() {
  const code = (els.syncCode.value || "").trim();
  if (!SYNC_CODE_RE.test(code)) {
    els.syncCodeStatus.textContent =
      "Use 4–40 letters, numbers, - or _ (no spaces).";
    return;
  }
  localStorage.setItem(SYNC_CODE_STORAGE, code);
  els.syncCodeStatus.textContent = "Loading…";
  // Drop any progress from the previous identity, then reload for this code.
  for (const k of Object.keys(answers)) delete answers[k];
  state.index = 0;
  state.furthest = 0;
  // Reload progress for whichever paper is currently open (if any).
  if (state.paperId) await loadProgress(state.paperId);
  if (!els.quizApp.hidden) render(); // refresh live quiz view if open
  els.syncCodeStatus.textContent = `Synced as “${code}”.`;
}

function setSyncStatus(text) {
  if (els.syncStatus) els.syncStatus.textContent = text;
}

// Single wired paper is sequential 問1..問N, so question number == index + 1.
// ponytail: this 1:1 holds while one paper is wired; revisit if papers ever
// skip/renumber questions.
const numberToIndex = (n) => n - 1;
const indexToNumber = (i) => i + 1;

// Fetch saved progress and replay it into the in-memory store. Called after
// questions load. Failure is silent — the app keeps its local behavior.
async function loadProgress(examSetId) {
  try {
    const res = await fetch(progressUrl(examSetId), {
      headers: { Accept: "application/json", "X-FE-User-Key": getUserKey() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Seed the in-memory store under this paper so its answers resume.
    state.paperId = examSetId;
    const store = paperStore();
    (data.items || []).forEach((it) => {
      const idx = numberToIndex(it.number);
      const question = QUIZ.questions[idx];
      const selected = question
        ? normalizeStoredSelection(question, it.selected_answer)
        : null;
      if (it.selected_answer && selected === null) {
        console.error(`Progress Q${it.number}: unknown saved option label "${it.selected_answer}"`);
      }
      store[idx] = {
        selected,
        submitted: !!it.submitted,
        isCorrect: selected !== null && it.submitted
          ? selected === question.correctAnswerLabel
          : it.is_correct ?? null,
      };
    });
    state.index = Math.min(data.current_question_index ?? 0, QUIZ.questions.length - 1);
    state.furthest = Math.max(state.furthest, data.furthest_question_index ?? 0);
    setSyncStatus("Synced");
    // Backend is the source of truth for the current question when reachable.
    return data.current_question_index != null;
  } catch {
    setSyncStatus(""); // offline / no saved progress — stay quiet
    return false; // caller falls back to the locally mirrored index
  }
}

// POST every answered question in the store plus the current/furthest indices.
// Fire-and-forget: never throws into the UI, just a tiny status note.
async function saveProgress() {
  const store = paperStore();
  const items = Object.entries(store)
    .filter(([, a]) => a.submitted)
    .map(([idx, a]) => ({
      number: indexToNumber(Number(idx)),
      selected_answer: a.selected,
      is_correct: a.isCorrect,
    }));
  try {
    const res = await fetch(progressUrl(state.paperId), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-FE-User-Key": getUserKey() },
      body: JSON.stringify({
        current_question_index: state.index,
        furthest_question_index: state.furthest,
        items,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setSyncStatus("Saved");
  } catch {
    setSyncStatus("Saved locally");
  }
}

// Reset ONE paper's progress: confirm, DELETE backend rows for this exam_set_id
// under the current sync code/user key, then clear local state for that paper
// only. Sync code, theme, and other papers are untouched. If the open paper was
// reset, redraw it fresh from 問1.
async function resetProgress(examSetId) {
  if (!confirm("この科目の学習状況をリセットしますか？\nReset this paper's progress and start over from 問1?")) {
    return;
  }
  // Backend: drop this user's rows for this paper (best-effort; local clears regardless).
  try {
    await fetch(progressUrl(examSetId), {
      method: "DELETE",
      headers: { "X-FE-User-Key": getUserKey() },
    });
  } catch {
    /* offline: local reset still applies; backend reset retried on next reset. */
  }

  // Local: clear in-memory answers for THIS paper only.
  delete answers[examSetId];
  delete explanationStates[examSetId];

  // Local: clear viewed/active state only if this is the paper currently open.
  if (localStorage.getItem(ACTIVE_PAPER_STORAGE) === examSetId) {
    localStorage.removeItem(ACTIVE_INDEX_STORAGE);
  }
  if (state.paperId === examSetId) {
    state.index = 0;
    state.furthest = 0;
    if (!els.quizApp.hidden) render(); // open paper → redraw fresh at 問1
  }
}

// Sync code UI wiring. Prefill the input with the saved code (never the random
// key) so the user can see/copy what they're synced as.
els.syncSave.addEventListener("click", applySyncCode);
els.syncCode.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applySyncCode();
});

async function init() {
  // Apply persisted theme first so neither home nor practice flashes the wrong mode.
  applyTheme(localStorage.getItem(THEME_STORAGE) === "dark");
  els.syncCode.value = localStorage.getItem(SYNC_CODE_STORAGE) || "";
  buildStudyHub();
  buildPapers();

  // Reload restore: if a paper was being practiced before refresh, reopen it.
  // startPaper() handles loading questions/progress and resolving the viewed index
  // (local mirror → backend → Q1). Disabled/unknown saved ids are ignored.
  const activeId = localStorage.getItem(ACTIVE_PAPER_STORAGE);
  const paper = activeId && EXAM_SETS.find((p) => p.id === activeId && p.available);
  if (paper) {
    await startPaper(paper, { reopen: true });
  } else {
    showStudyHub();
  }
}

init();
