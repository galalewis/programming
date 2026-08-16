// ============================================
// GALAL ACADEMY — EXAMS.JS
// شغال على exams.html + exam.html + results.html
// ============================================

import { onAuthChange, logoutUser } from "../firebase/firebase-auth.js";
import { getUserEnrollments, getUserExamResults, submitExamResult } from "../firebase/firebase-firestore.js";
import { getExamsForCourse, getExamQuestions, demoExam } from "../data/exams.js";
import { calculateExamXP, getExamFeedback } from "./xp-system.js";

let currentUserId = null;

/* ==================== Auth Guard ==================== */
onAuthChange(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUserId = user.uid;

  try {
    if (document.getElementById("examsPageContent")) {
      await renderExamsList(user.uid);
    }
    if (document.getElementById("examContent") || document.getElementById("examNotReady")) {
      await initExamPage(user.uid);
    }
    if (document.getElementById("resultsPageContent")) {
      await renderResultsList(user.uid);
    }
  } catch (err) {
    console.error("حصل خطأ في تحميل بيانات الامتحانات:", err);
  }

  document.getElementById("authLoading")?.setAttribute("hidden", "");
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "index.html";
  });
});

/* ==================== exams.html ==================== */
async function renderExamsList(uid) {
  const [enrollments, results] = await Promise.all([getUserEnrollments(uid), getUserExamResults(uid)]);

  const approvedCourses = enrollments.filter((e) => e.status === "approved");
  const resultsByExamId = new Map(results.map((r) => [r.examId, r]));

  const examEntries = [
    { examId: demoExam.id, titleAr: demoExam.titleAr, courseId: "demo", courseTitleAr: "تجريبي", isDemo: true },
  ];

  approvedCourses.forEach((enrollment) => {
    examEntries.push(...getExamsForCourse(enrollment.courseId));
  });

  const listEl = document.getElementById("examsList");
  const emptyEl = document.getElementById("examsEmpty");

  document.getElementById("examsPageContent").hidden = false;

  if (examEntries.length === 1) {
    // مفيش غير الامتحان التجريبي — يعني مفيش كورسات مفعّلة
  }

  listEl.innerHTML = "";
  examEntries.forEach((entry) => {
    const existingResult = resultsByExamId.get(entry.examId);
    const questions = entry.isDemo ? demoExam.questions : getExamQuestions(entry.examId);
    const isReady = Array.isArray(questions) && questions.length > 0;

    const item = document.createElement("div");
    item.className = `exam-list-item ${entry.isDemo ? "exam-list-item--demo" : ""}`;

    let rightSide = "";
    if (existingResult) {
      rightSide = `<span class="exam-list-item__score">${existingResult.percentage}%</span>`;
    } else if (!isReady) {
      rightSide = `<span class="exam-list-item__badge">لسه مش جاهز</span>`;
    } else {
      rightSide = `<a href="exam.html?exam=${entry.examId}&course=${entry.courseId}" class="btn btn--primary btn--sm">ابدأ الامتحان</a>`;
    }

    item.innerHTML = `
      <div class="exam-list-item__info">
        <strong>${entry.titleAr}</strong>
        <span class="exam-list-item__course">${entry.courseTitleAr}</span>
      </div>
      ${rightSide}
    `;
    listEl.appendChild(item);
  });
}

/* ==================== exam.html ==================== */
async function initExamPage(uid) {
  const params = new URLSearchParams(window.location.search);
  const examId = params.get("exam");
  const courseId = params.get("course") || "demo";

  const notReadyEl = document.getElementById("examNotReady");
  const contentEl = document.getElementById("examContent");
  const resultViewEl = document.getElementById("examResultView");

  const questions = examId === demoExam.id ? demoExam.questions : getExamQuestions(examId);
  const title = examId === demoExam.id ? demoExam.titleAr : "امتحان الحصة";

  if (!Array.isArray(questions) || questions.length === 0) {
    notReadyEl.hidden = false;
    return;
  }

  contentEl.hidden = false;
  document.getElementById("examTitle").textContent = title;
  renderQuestions(questions);

  const form = document.getElementById("examForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { correctCount, wrongCount, percentage } = gradeExam(questions, form);
    const xpEarned = calculateExamXP(percentage, correctCount);

    await submitExamResult({
      uid,
      examId,
      courseId,
      score: correctCount,
      correctCount,
      wrongCount,
      percentage,
      xpEarned,
    });

    contentEl.hidden = true;
    resultViewEl.hidden = false;

    document.getElementById("resultPercentage").textContent = `${percentage}%`;
    document.getElementById("resultCorrect").textContent = correctCount;
    document.getElementById("resultWrong").textContent = wrongCount;
    document.getElementById("resultXP").textContent = xpEarned;
    document.getElementById("resultFeedback").textContent = getExamFeedback(percentage);
  });

  // تحديث شريط التقدم مع كل إجابة
  form.addEventListener("change", () => updateExamProgress(questions.length, form));
}

function renderQuestions(questions) {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    let optionsHtml = "";
    if (q.type === "true-false") {
      optionsHtml = `
        <label class="question-option">
          <input type="radio" name="${q.id}" value="true" required />
          <span>صح</span>
        </label>
        <label class="question-option">
          <input type="radio" name="${q.id}" value="false" />
          <span>غلط</span>
        </label>
      `;
    } else if (q.type === "multiple-choice") {
      optionsHtml = q.options
        .map(
          (opt, i) => `
        <label class="question-option">
          <input type="radio" name="${q.id}" value="${i}" required />
          <span>${opt}</span>
        </label>`
        )
        .join("");
    }

    card.innerHTML = `
      <span class="question-card__number">سؤال ${index + 1} من ${questions.length}</span>
      <p class="question-card__text">${q.textAr}</p>
      <div class="question-card__options">${optionsHtml}</div>
    `;
    container.appendChild(card);
  });

  updateExamProgress(questions.length, document.getElementById("examForm"));
}

function updateExamProgress(totalQuestions, form) {
  const answered = new Set();
  new FormData(form).forEach((_, key) => answered.add(key));
  const percent = Math.round((answered.size / totalQuestions) * 100);

  document.getElementById("examProgressFill").style.width = `${percent}%`;
  document.getElementById("examProgressLabel").textContent = `اتجاوب ${answered.size} من ${totalQuestions}`;
}

function gradeExam(questions, form) {
  const formData = new FormData(form);
  let correctCount = 0;

  questions.forEach((q) => {
    const answer = formData.get(q.id);
    if (q.type === "true-false") {
      if (answer === String(q.correctAnswer)) correctCount++;
    } else if (q.type === "multiple-choice") {
      if (Number(answer) === q.correctAnswerIndex) correctCount++;
    }
  });

  const wrongCount = questions.length - correctCount;
  const percentage = Math.round((correctCount / questions.length) * 100);

  return { correctCount, wrongCount, percentage };
}

/* ==================== results.html ==================== */
async function renderResultsList(uid) {
  const results = await getUserExamResults(uid);

  document.getElementById("resultsPageContent").hidden = false;

  const listEl = document.getElementById("resultsList");
  const emptyEl = document.getElementById("resultsEmpty");

  if (results.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = "";
  results.forEach((result) => {
    const item = document.createElement("div");
    item.className = "result-list-item";

    const dateLabel = result.submittedAt?.toDate
      ? result.submittedAt.toDate().toLocaleDateString("ar-EG")
      : "";

    item.innerHTML = `
      <div class="result-list-item__meta">
        <strong>${labelForExam(result.examId)}</strong>
        <span class="result-list-item__date">${dateLabel}</span>
      </div>
      <span class="result-list-item__score">${result.percentage}%</span>
    `;
    listEl.appendChild(item);
  });
}

function labelForExam(examId) {
  if (examId === demoExam.id) return demoExam.titleAr;
  return `امتحان (${examId})`;
}
