// ============================================
// GALAL ACADEMY — COMPETITIONS.JS
// ============================================

import { onAuthChange } from "../firebase/firebase-auth.js";
import {
  getActiveCompetitions,
  getCompetitionById,
  hasCompletedCompetition,
  submitCompetitionResult,
} from "../firebase/firebase-firestore.js";
import { calculateExamXP } from "./xp-system.js";

let currentUser = null;
let countdownInterval = null;

const params = new URLSearchParams(window.location.search);
const competitionId = params.get("competition");

/* ==================== Auth ==================== */
onAuthChange(async (user) => {
  currentUser = user;
  document.getElementById("navLoginLink")?.toggleAttribute("hidden", !!user);
  document.getElementById("navDashboardLink")?.toggleAttribute("hidden", !user);

  if (competitionId) {
    await initCompetitionTaking();
  } else {
    await renderCompetitionsList();
  }
});

/* ==================== List View ==================== */
async function renderCompetitionsList() {
  const loadingEl = document.getElementById("competitionsLoading");
  const listEl = document.getElementById("competitionsList");
  const emptyEl = document.getElementById("competitionsEmpty");

  // بيانات المسابقة فيها الإجابات الصح، فمنجيبهاش خالص إلا لو الطالب مسجل دخول
  // (الـ Firestore Rule نفسها برضو بترفض القراءة من غير تسجيل دخول)
  if (!currentUser) {
    loadingEl.hidden = true;
    emptyEl.hidden = false;
    document.getElementById("competitionsEmpty").innerHTML = `
      <p>سجّل دخولك الأول عشان تشوف المسابقات المتاحة وتشارك فيها.</p>
      <a href="login.html" class="btn btn--primary">تسجيل الدخول</a>
    `;
    return;
  }

  const competitions = await getActiveCompetitions();
  loadingEl.hidden = true;

  if (competitions.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  listEl.hidden = false;
  listEl.innerHTML = "";

  for (const comp of competitions) {
    const typeLabel = comp.type === "weekly" ? "أسبوعية" : "شهرية";
    let rightSide;

    if (!currentUser) {
      rightSide = `<a href="login.html" class="btn btn--outline btn--sm">سجّل دخول للمشاركة</a>`;
    } else {
      const completed = await hasCompletedCompetition(currentUser.uid, comp.id);
      rightSide = completed
        ? `<span class="exam-list-item__badge">شاركت بالفعل</span>`
        : `<a href="competitions.html?competition=${comp.id}" class="btn btn--primary btn--sm">شارك الآن</a>`;
    }

    const item = document.createElement("div");
    item.className = "exam-list-item";
    item.innerHTML = `
      <div class="exam-list-item__info">
        <strong>${comp.title}</strong>
        <span class="exam-list-item__course">مسابقة ${typeLabel} · ${comp.questions?.length || 0} سؤال</span>
      </div>
      ${rightSide}
    `;
    listEl.appendChild(item);
  }
}

/* ==================== Taking View ==================== */
async function initCompetitionTaking() {
  document.getElementById("competitionsListView").hidden = true;

  if (!currentUser) {
    showBlocked("لازم تسجّل دخول الأول عشان تشارك في المسابقة.");
    return;
  }

  const competition = await getCompetitionById(competitionId);
  if (!competition) {
    showBlocked("المسابقة دي مش موجودة أو اتشالت.");
    return;
  }

  const alreadyDone = await hasCompletedCompetition(currentUser.uid, competitionId);
  if (alreadyDone) {
    showBlocked("انت شاركت في المسابقة دي قبل كده. تقدر تشوف ترتيبك في لوحة المتصدرين.");
    return;
  }

  const questions = competition.questions || [];
  if (questions.length === 0) {
    showBlocked("المسابقة دي لسه من غير أسئلة.");
    return;
  }

  const takingView = document.getElementById("competitionTakingView");
  takingView.hidden = false;
  document.getElementById("competitionTitle").textContent = competition.title;

  renderCompetitionQuestions(questions);
  startTimer(competition.durationSeconds || 300, () => autoSubmit(questions));

  const form = document.getElementById("competitionForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearInterval(countdownInterval);
    handleSubmit(questions, form);
  });

  form.addEventListener("change", () => updateCompetitionProgress(questions.length, form));
}

function renderCompetitionQuestions(questions) {
  const container = document.getElementById("competitionQuestionsContainer");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    let optionsHtml = "";
    if (q.type === "true-false") {
      optionsHtml = `
        <label class="question-option"><input type="radio" name="${q.id}" value="true" required /><span>صح</span></label>
        <label class="question-option"><input type="radio" name="${q.id}" value="false" /><span>غلط</span></label>
      `;
    } else if (q.type === "multiple-choice") {
      optionsHtml = q.options
        .map((opt, i) => `<label class="question-option"><input type="radio" name="${q.id}" value="${i}" required /><span>${opt}</span></label>`)
        .join("");
    }

    card.innerHTML = `
      <span class="question-card__number">سؤال ${index + 1} من ${questions.length}</span>
      <p class="question-card__text">${q.textAr}</p>
      <div class="question-card__options">${optionsHtml}</div>
    `;
    container.appendChild(card);
  });

  updateCompetitionProgress(questions.length, document.getElementById("competitionForm"));
}

function updateCompetitionProgress(total, form) {
  const answered = new Set();
  new FormData(form).forEach((_, key) => answered.add(key));
  const percent = Math.round((answered.size / total) * 100);
  document.getElementById("competitionProgressFill").style.width = `${percent}%`;
  document.getElementById("competitionProgressLabel").textContent = `اتجاوب ${answered.size} من ${total}`;
}

/* ==================== Timer ==================== */
function startTimer(durationSeconds, onExpire) {
  let remaining = durationSeconds;
  const timerEl = document.getElementById("competitionTimer");

  const render = () => {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;
    timerEl.classList.toggle("competition-timer--urgent", remaining <= 30);
  };

  render();
  countdownInterval = setInterval(() => {
    remaining--;
    render();
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      onExpire();
    }
  }, 1000);
}

/* ==================== Submission ==================== */
function autoSubmit(questions) {
  const form = document.getElementById("competitionForm");
  handleSubmit(questions, form);
}

async function handleSubmit(questions, form) {
  const formData = new FormData(form);
  let correctCount = 0;

  questions.forEach((q) => {
    const answer = formData.get(q.id);
    if (q.type === "true-false" && answer === String(q.correctAnswer)) correctCount++;
    if (q.type === "multiple-choice" && Number(answer) === q.correctAnswerIndex) correctCount++;
  });

  const wrongCount = questions.length - correctCount;
  const percentage = Math.round((correctCount / questions.length) * 100);
  const xpEarned = calculateExamXP(percentage, correctCount);

  await submitCompetitionResult({
    uid: currentUser.uid,
    competitionId,
    score: correctCount,
    correctCount,
    wrongCount,
    percentage,
    xpEarned,
  });

  document.getElementById("competitionTakingView").hidden = true;
  document.getElementById("competitionResultView").hidden = false;
  document.getElementById("competitionResultPercentage").textContent = `${percentage}%`;
  document.getElementById("competitionResultCorrect").textContent = correctCount;
  document.getElementById("competitionResultWrong").textContent = wrongCount;
  document.getElementById("competitionResultXP").textContent = xpEarned;
}

/* ==================== Helpers ==================== */
function showBlocked(message) {
  document.getElementById("competitionBlockedView").hidden = false;
  document.getElementById("competitionBlockedMessage").textContent = message;
}
