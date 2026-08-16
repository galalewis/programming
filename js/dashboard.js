// ============================================
// GALAL ACADEMY — DASHBOARD.JS
// شغال على dashboard.html و profile.html (بيفرق بينهم حسب العناصر الموجودة في الصفحة)
// ============================================

import { onAuthChange, logoutUser } from "../firebase/firebase-auth.js";
import {
  getUserProfile,
  getUserEnrollments,
  getUserExamResults,
  getUserNotifications,
  getUserRank,
} from "../firebase/firebase-firestore.js";
import { getCourseById } from "../data/courses.js";
import { achievements } from "../data/achievements.js";

const authLoadingEl = document.getElementById("authLoading");
const dashboardContentEl = document.getElementById("dashboardContent");
const profileContentEl = document.getElementById("profileContent");

/* ==================== Auth Guard ==================== */
onAuthChange(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    await renderPage(user.uid);
  } catch (err) {
    console.error("حصل خطأ في تحميل بيانات الطالب:", err);
  }

  if (authLoadingEl) authLoadingEl.hidden = true;
  if (dashboardContentEl) dashboardContentEl.hidden = false;
  if (profileContentEl) profileContentEl.hidden = false;
});

/* ==================== Logout ==================== */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logoutUser();
      window.location.href = "index.html";
    });
  }
});

/* ==================== Main Render ==================== */
async function renderPage(uid) {
  const [profile, enrollments, examResults, notifications] = await Promise.all([
    getUserProfile(uid),
    getUserEnrollments(uid),
    getUserExamResults(uid),
    getUserNotifications(uid).catch(() => []), // ما نوقفش الصفحة لو مفيش إشعارات
  ]);

  if (!profile) return;

  const rank = await getUserRank(profile.xp || 0);

  const approvedEnrollments = enrollments.filter((e) => e.status === "approved");
  const avgScore =
    examResults.length > 0
      ? Math.round(examResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / examResults.length)
      : 0;

  // -------------------- Dashboard Page --------------------
  if (dashboardContentEl) {
    renderDashboard({ profile, enrollments, examResults, notifications, rank, approvedEnrollments });
  }

  // -------------------- Profile Page --------------------
  if (profileContentEl) {
    renderProfile({ profile, enrollments, examResults, rank, avgScore, approvedEnrollments });
  }
}

/* ==================== Dashboard Rendering ==================== */
function renderDashboard({ profile, enrollments, examResults, notifications, rank, approvedEnrollments }) {
  setText("welcomeName", profile.name || "طالبنا");
  setSrc("welcomeAvatar", profile.avatarUrl);

  setText("statXP", profile.xp || 0);
  setText("statRank", `#${rank}`);
  setText("statCourses", approvedEnrollments.length);
  setText("statExams", examResults.length);

  renderMyCourses(enrollments, "myCoursesList", "myCoursesEmpty");
  renderLatestExams(examResults.slice(0, 5), "latestExamsList", "latestExamsEmpty");
  renderNotifications(notifications, "notificationsList", "notificationsEmpty");
}

/* ==================== Profile Rendering ==================== */
function renderProfile({ profile, enrollments, examResults, rank, avgScore, approvedEnrollments }) {
  setText("profileName", profile.name || "طالبنا");
  setText("profileGrade", gradeLabel(profile.grade));
  setSrc("profileAvatar", profile.avatarUrl);
  setText("profileXP", profile.xp || 0);
  setText("profileRank", `#${rank}`);

  setText("statCoursesCompleted", 0); // هيتحدث فعليًا مع نظام تتبع التقدم الكامل في PHASE 7
  setText("statExamsCompleted", examResults.length);
  setText("statAvgScore", `${avgScore}%`);

  const unlockedAchievements = getUnlockedAchievements({
    enrollmentsCount: enrollments.length,
    examsCount: examResults.length,
    xpTotal: profile.xp || 0,
    bestExamScore: examResults.reduce((max, r) => Math.max(max, r.percentage || 0), 0),
    coursesCompleted: 0,
  });

  setText("statAchievements", unlockedAchievements.length);
  renderAchievements(unlockedAchievements);
}

/* ==================== Sub-renderers ==================== */
function renderMyCourses(enrollments, listId, emptyId) {
  const listEl = document.getElementById(listId);
  const emptyEl = document.getElementById(emptyId);
  if (!listEl) return;

  if (enrollments.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = "";
  enrollments.forEach((enrollment) => {
    const course = getCourseById(enrollment.courseId);
    if (!course) return;

    const statusLabels = {
      pending: "بانتظار المراجعة",
      approved: "مفعّل",
      rejected: "مرفوض",
    };

    const item = document.createElement("div");
    item.className = "my-course-item";
    item.innerHTML = `
      <img src="${course.image}" alt="${course.titleAr}" class="my-course-item__image" />
      <div class="my-course-item__body">
        <p class="my-course-item__title">${course.titleAr}</p>
        <span class="my-course-item__status my-course-item__status--${enrollment.status}">
          ${statusLabels[enrollment.status] || enrollment.status}
        </span>
        ${
          enrollment.status === "approved"
            ? `<div class="my-course-item__progress-bar"><div class="my-course-item__progress-fill" style="width: 0%"></div></div>`
            : ""
        }
      </div>
      <a href="course-details.html?course=${course.id}" class="btn btn--ghost btn--sm">التفاصيل</a>
    `;
    listEl.appendChild(item);
  });
}

function renderLatestExams(results, listId, emptyId) {
  const listEl = document.getElementById(listId);
  const emptyEl = document.getElementById(emptyId);
  if (!listEl) return;

  if (results.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = "";
  results.forEach((result) => {
    const item = document.createElement("div");
    item.className = "exam-result-item";
    item.innerHTML = `
      <span>${result.examId || "امتحان"}</span>
      <span class="exam-result-item__score">${result.percentage || 0}%</span>
    `;
    listEl.appendChild(item);
  });
}

function renderNotifications(notifications, listId, emptyId) {
  const listEl = document.getElementById(listId);
  const emptyEl = document.getElementById(emptyId);
  if (!listEl) return;

  if (!notifications || notifications.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = "";
  notifications.forEach((n) => {
    const item = document.createElement("div");
    item.className = "notification-item";
    item.textContent = n.message;
    listEl.appendChild(item);
  });
}

function renderAchievements(unlockedIds) {
  const gridEl = document.getElementById("achievementsGrid");
  if (!gridEl) return;

  gridEl.innerHTML = "";
  achievements.forEach((achievement) => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    const card = document.createElement("div");
    card.className = `achievement-card ${isUnlocked ? "" : "achievement-card--locked"}`;
    card.innerHTML = `
      <span class="achievement-card__icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M12 2l2.6 5.6L21 9l-4.5 4.2L17.6 20 12 16.8 6.4 20l1.1-6.8L3 9l6.4-1.4z"></path>
        </svg>
      </span>
      <span class="achievement-card__title">${achievement.titleAr}</span>
      <span class="achievement-card__desc">${achievement.descAr}</span>
    `;
    gridEl.appendChild(card);
  });
}

/* ==================== Achievement Logic ==================== */
function getUnlockedAchievements({ enrollmentsCount, examsCount, xpTotal, bestExamScore, coursesCompleted }) {
  return achievements
    .filter((a) => {
      switch (a.condition.type) {
        case "enrollments-count":
          return enrollmentsCount >= a.condition.value;
        case "exams-count":
          return examsCount >= a.condition.value;
        case "xp-total":
          return xpTotal >= a.condition.value;
        case "single-exam-score":
          return bestExamScore >= a.condition.value;
        case "courses-completed":
          return coursesCompleted >= a.condition.value;
        default:
          return false; // "manual" type — بيتفتح يدويًا بس من الإدمن
      }
    })
    .map((a) => a.id);
}

/* ==================== Helpers ==================== */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setSrc(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.src = value;
}

function gradeLabel(grade) {
  const labels = {
    foundation: "تأسيسي",
    "first-secondary": "أولى ثانوي",
    "second-secondary": "ثانية ثانوي",
    other: "مرحلة تانية",
  };
  return labels[grade] || grade || "";
}
