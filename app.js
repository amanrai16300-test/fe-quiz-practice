// FE 科目A 演習 — quiz controller.
// Flow: render → select option → submit (lock + feedback + explanation) → next.
// Depends on QUIZ / OPTION_LABELS from questions.js.

const els = {
  home: document.getElementById("home"),
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
  qFigure: document.getElementById("qFigure"),
  qImage: document.getElementById("qImage"),
  translateBtn: document.getElementById("translateBtn"),
  translation: document.getElementById("translation"),
  transJa: document.getElementById("transJa"),
  transRomaji: document.getElementById("transRomaji"),
  transEn: document.getElementById("transEn"),
  optionTrans: document.getElementById("optionTrans"),
  options: document.getElementById("options"),
  explanationCard: document.getElementById("explanationCard"),
  verdict: document.getElementById("verdict"),
  answerLine: document.getElementById("answerLine"),
  explanationBody: document.getElementById("explanationBody"),
  submitBtn: document.getElementById("submitBtn"),
  nextBtn: document.getElementById("nextBtn"),
};

const state = {
  index: 0,
  selected: null, // option index, or null
  submitted: false,
  paperId: null,
};

// In-memory answer store, scoped by paper ID. Lives only for this browser session.
// Shape: answers[paperId][index] = { selected, submitted, isCorrect }.
// ponytail: plain object, no persistence — sync layer can serialize this later.
const answers = {};
function paperStore() {
  return (answers[state.paperId] ??= {});
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

function render() {
  const q = currentQuestion();
  state.selected = null;
  state.submitted = false;

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
  els.qText.textContent = q.text;

  // Image (imagePath optional).
  if (q.imagePath) {
    els.qImage.src = q.imagePath;
    els.qImage.alt = `${q.number} の図`;
    els.qFigure.hidden = false;
  } else {
    els.qImage.removeAttribute("src");
    els.qFigure.hidden = true;
  }

  // Translation panel — reset to collapsed each question.
  els.transJa.textContent = q.translation.japanese;
  els.transRomaji.textContent = q.translation.romaji;
  els.transEn.textContent = q.translation.english;

  // Per-option translation cards (ア〜エ). Does NOT reveal the correct answer —
  // just the same options in jp/romaji/en. Rebuilt each question.
  els.optionTrans.innerHTML = "";
  q.optionTranslations.forEach((o, i) => {
    const card = document.createElement("div");
    card.className = "opt-trans";
    card.innerHTML = `
      <span class="opt-trans-label">${OPTION_LABELS[i]}</span>
      <div class="opt-trans-lines">
        <p class="opt-trans-jp"></p>
        <p class="opt-trans-romaji"></p>
        <p class="opt-trans-en"></p>
      </div>`;
    card.querySelector(".opt-trans-jp").textContent = o.jp;
    card.querySelector(".opt-trans-romaji").textContent = o.romaji;
    card.querySelector(".opt-trans-en").textContent = o.en;
    els.optionTrans.appendChild(card);
  });

  els.translation.hidden = true;
  els.translateBtn.setAttribute("aria-expanded", "false");

  // Options.
  els.options.innerHTML = "";
  q.options.forEach((text, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.dataset.index = String(i);
    btn.setAttribute("role", "option");
    btn.innerHTML = `<span class="option-label">${OPTION_LABELS[i]}</span><span class="option-text"></span>`;
    btn.querySelector(".option-text").textContent = text;
    btn.addEventListener("click", () => selectOption(i));
    li.appendChild(btn);
    els.options.appendChild(li);
  });

  // Explanation hidden until submit (never reveal correctAnswer early).
  els.explanationCard.hidden = true;

  // Buttons.
  els.submitBtn.hidden = false;
  els.submitBtn.disabled = true;
  els.nextBtn.hidden = true;

  // Replay saved answer for this question, if any (in-session, per paper).
  const saved = store[state.index];
  if (saved) {
    if (saved.submitted) {
      state.selected = saved.selected;
      applyVerdictUI(q);
    } else if (saved.selected !== null) {
      selectOption(saved.selected);
    }
  }
}

function selectOption(i) {
  if (state.submitted) return;
  state.selected = i;
  [...els.options.querySelectorAll(".option")].forEach((btn, idx) => {
    btn.classList.toggle("selected", idx === i);
    btn.setAttribute("aria-selected", idx === i ? "true" : "false");
  });
  els.submitBtn.disabled = false; // enable only once an option is picked
  // Persist selection so a pre-submit pick survives jump/return.
  paperStore()[state.index] = { selected: i, submitted: false, isCorrect: null };
}

// Lock options, show verdict + explanation, swap to Next. Used by submit() and by
// render() when replaying a previously submitted answer.
function applyVerdictUI(q) {
  const correct = q.correctAnswer;
  const isRight = state.selected === correct;

  [...els.options.querySelectorAll(".option")].forEach((btn, idx) => {
    btn.disabled = true;
    btn.classList.remove("selected");
    if (idx === correct) btn.classList.add("correct");
    else if (idx === state.selected) btn.classList.add("incorrect");
  });

  els.verdict.textContent = isRight ? "正解！" : "不正解";
  els.verdict.className = `explanation-verdict ${isRight ? "is-correct" : "is-wrong"}`;
  els.answerLine.textContent = `正解: ${OPTION_LABELS[correct]}`;
  els.explanationBody.innerHTML = renderExplanation(q.explanation);
  els.explanationCard.hidden = false;

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
  updateSummary();
}

// Escape then mark exact heading lines so CSS can style them.
// Headings only — body stays plain text, line breaks preserved by CSS white-space.
const EXP_HEADINGS = new Set([
  "ELI5:",
  "Technical breakdown:",
  "Wrong answer analysis:",
  "Correct answer:",
]);
function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function renderExplanation(text) {
  return (text || "")
    .split("\n")
    .map((line) => {
      const esc = escapeHtml(line);
      return EXP_HEADINGS.has(line.trim())
        ? `<strong class="exp-h">${esc}</strong>`
        : esc;
    })
    .join("\n");
}

function next() {
  state.index = (state.index + 1) % QUIZ.questions.length;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Question jump navigator — chips render fresh; does not touch answer data.
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

els.translateBtn.addEventListener("click", () => {
  const open = els.translation.hidden;
  els.translation.hidden = !open;
  els.translateBtn.setAttribute("aria-expanded", String(open));
});
els.submitBtn.addEventListener("click", submit);
els.nextBtn.addEventListener("click", next);

// Paper selection. EXAM_SETS prepared for multiple papers; only QUIZ wired today.
// ponytail: single paper inlined from QUIZ — add real multi-paper data when a 2nd exists.
const EXAM_SETS = [
  {
    id: "fe-2025-a-public",
    title: "令和7年度 基本情報技術者試験 科目A 公開問題",
    desc: "Practice with Japanese questions, romaji support, English translation, and explanations.",
    count: QUIZ.questions.length,
    quiz: QUIZ,
  },
];

function showHome() {
  els.quizApp.hidden = true;
  els.home.hidden = false;
  window.scrollTo({ top: 0 });
}

function startPaper(paper) {
  state.paperId = paper.id;   // resumes in-memory state if this paper was started before
  els.home.hidden = true;
  els.quizApp.hidden = false;
  state.index = 0;
  render();
  window.scrollTo({ top: 0 });
}

EXAM_SETS.forEach((paper) => {
  const li = document.createElement("li");
  li.className = "card paper-card";
  li.innerHTML = `
    <p class="paper-title"></p>
    <p class="paper-desc"></p>
    <p class="paper-meta"></p>
    <button class="btn btn-primary paper-start" type="button">Start Practice</button>`;
  li.querySelector(".paper-title").textContent = paper.title;
  li.querySelector(".paper-desc").textContent = paper.desc;
  li.querySelector(".paper-meta").textContent = `${paper.count} questions`;
  li.querySelector(".paper-start").addEventListener("click", () => startPaper(paper));
  els.paperList.appendChild(li);
});

els.backBtn.addEventListener("click", showHome);
