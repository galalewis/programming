// ============================================
// GALAL ACADEMY — LEADERBOARD.JS
// شغال بدون تسجيل دخول إجباري — بيتفعّل التخصيص لو الطالب مسجل دخول
// ============================================

import { onAuthChange } from "../firebase/firebase-auth.js";
import {
  getTopStudents,
  getUserProfile,
  getUserRank,
  getExamResultsSince,
  getCompetitionResultsSince,
} from "../firebase/firebase-firestore.js";
import { db } from "../firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let currentPeriod = "all-time";
let currentUser = null;

/* ==================== Auth (اختياري هنا) ==================== */
onAuthChange(async (user) => {
  currentUser = user;
  document.getElementById("navLoginLink")?.toggleAttribute("hidden", !!user);
  document.getElementById("navDashboardLink")?.toggleAttribute("hidden", !user);

  if (user) {
    const profile = await getUserProfile(user.uid);
    if (profile) {
      const rank = await getUserRank(profile.xp || 0);
      document.getElementById("yourRankValue").textContent = `#${rank}`;
      document.getElementById("yourXPValue").textContent = profile.xp || 0;
    }
  }

  await loadLeaderboard(currentPeriod);
});

/* ==================== Tabs ==================== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filter-bar__btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".filter-bar__btn").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      currentPeriod = btn.dataset.period;
      await loadLeaderboard(currentPeriod);
    });
  });
});

/* ==================== Load & Render ==================== */
async function loadLeaderboard(period) {
  const loadingEl = document.getElementById("leaderboardLoading");
  const listEl = document.getElementById("leaderboardList");
  const emptyEl = document.getElementById("leaderboardEmpty");
  const yourRankCard = document.getElementById("yourRankCard");

  loadingEl.hidden = false;
  listEl.hidden = true;
  emptyEl.hidden = true;

  // "ترتيبك" له معنى دقيق في تبويب "كل الوقت" بس (XP الإجمالي بتاعك فعليًا)
  yourRankCard.hidden = !(currentUser && period === "all-time");

  let students = [];

  if (period === "all-time") {
    students = await getTopStudents(20);
  } else {
    students = await getPeriodLeaderboard(period);
  }

  loadingEl.hidden = true;

  if (students.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  listEl.hidden = false;
  listEl.innerHTML = "";

  students.forEach((student, index) => {
    const row = document.createElement("div");
    row.className = `leaderboard-row ${index < 3 ? "leaderboard-row--top3" : ""}`;
    row.innerHTML = `
      <span class="leaderboard-row__rank">${index + 1}</span>
      <img src="${student.avatarUrl || "assets/images/students/avatar-default.png"}" alt="${student.name}" class="leaderboard-row__avatar" />
      <span class="leaderboard-row__name">${student.name}</span>
      <span class="leaderboard-row__xp">${student.xp} XP</span>
    `;
    listEl.appendChild(row);
  });
}

/**
 * ترتيب أسبوعي/شهري: بيجمع XP المكتسب من الامتحانات والمسابقات في الفترة بس،
 * مش الـ XP الإجمالي بتاع الطالب
 */
async function getPeriodLeaderboard(period) {
  const sinceDate = period === "weekly" ? daysAgo(7) : daysAgo(30);

  const [examResults, competitionResults] = await Promise.all([
    getExamResultsSince(sinceDate),
    getCompetitionResultsSince(sinceDate),
  ]);

  const xpByUser = new Map();
  [...examResults, ...competitionResults].forEach((r) => {
    const current = xpByUser.get(r.userId) || 0;
    xpByUser.set(r.userId, current + (r.xpEarned || 0));
  });

  const sortedEntries = [...xpByUser.entries()]
    .filter(([, xp]) => xp > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const students = await Promise.all(
    sortedEntries.map(async ([uid, xp]) => {
      const snap = await getDoc(doc(db, "leaderboard", uid));
      const data = snap.exists() ? snap.data() : { name: "طالب", avatarUrl: "" };
      return { name: data.name, avatarUrl: data.avatarUrl, xp };
    })
  );

  return students;
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
