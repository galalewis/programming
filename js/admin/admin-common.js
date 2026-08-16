// ============================================
// GALAL ACADEMY — ADMIN COMMON
// حماية + قائمة جانبية مشتركة لكل صفحات الإدمن
// ============================================

import { onAuthChange, logoutUser } from "../../firebase/firebase-auth.js";
import { getUserProfile } from "../../firebase/firebase-firestore.js";

const ADMIN_NAV_ITEMS = [
  { href: "admin-dashboard.html", label: "نظرة عامة", icon: "grid" },
  { href: "admin-students.html", label: "الطلاب", icon: "users" },
  { href: "admin-courses.html", label: "الكورسات", icon: "book" },
  { href: "admin-payments.html", label: "المدفوعات", icon: "card" },
  { href: "admin-competitions.html", label: "المسابقات", icon: "trophy" },
  { href: "admin-rewards.html", label: "الجوائز", icon: "gift" },
  { href: "admin-analytics.html", label: "التحليلات", icon: "chart" },
];

const ICONS = {
  grid: `<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>`,
  users: `<circle cx="9" cy="8" r="3.5"></circle><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"></path><circle cx="17" cy="8" r="3"></circle><path d="M17 5c1.8 0 3 1.5 3 3.5"></path>`,
  book: `<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"></path><line x1="4" y1="4" x2="4" y2="17"></line>`,
  card: `<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>`,
  trophy: `<path d="M8 4h8v5a4 4 0 0 1-8 0z"></path><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4"></path><line x1="12" y1="13" x2="12" y2="18"></line><line x1="8" y1="21" x2="16" y2="21"></line>`,
  gift: `<rect x="3" y="8" width="18" height="13" rx="1"></rect><path d="M3 12h18"></path><path d="M12 8v13"></path><path d="M12 8c-1.5-4-6-4-6-1.5S9 8 12 8zM12 8c1.5-4 6-4 6-1.5S15 8 12 8z"></path>`,
  chart: `<line x1="4" y1="20" x2="4" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="20" y1="20" x2="20" y2="14"></line>`,
};

/**
 * حماية صفحة إدمن — بتوقف تنفيذ باقي الصفحة لحد ما نتأكد إن المستخدم:
 * 1. مسجل دخول
 * 2. role بتاعه = "admin" في Firestore
 * لو مش كده، بيتحوّل بره لوحة الإدمن فورًا.
 */
export function requireAdmin(onReady) {
  onAuthChange(async (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }

    const profile = await getUserProfile(user.uid);
    if (!profile || profile.role !== "admin") {
      window.location.href = "../index.html";
      return;
    }

    renderAdminShell(profile);
    onReady(user.uid, profile);
  });
}

/**
 * بناء القائمة الجانبية + شريط علوي بسيط، بيتكرر في كل صفحات الإدمن
 */
function renderAdminShell(profile) {
  const sidebarEl = document.getElementById("adminSidebar");
  if (sidebarEl) {
    const currentPage = window.location.pathname.split("/").pop();

    sidebarEl.innerHTML = `
      <div class="admin-sidebar__brand">
        <img src="../assets/images/brand/logo.png" alt="جلال أكاديمي" width="32" height="32" />
        <span>لوحة التحكم</span>
      </div>
      <nav class="admin-sidebar__nav">
        ${ADMIN_NAV_ITEMS.map(
          (item) => `
          <a href="${item.href}" class="admin-sidebar__link ${currentPage === item.href ? "is-active" : ""}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${ICONS[item.icon]}</svg>
            <span>${item.label}</span>
          </a>`
        ).join("")}
      </nav>
      <div class="admin-sidebar__footer">
        <a href="../index.html" class="admin-sidebar__link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M10 19l-7-7 7-7"></path><path d="M3 12h18"></path></svg>
          <span>رجوع للموقع</span>
        </a>
        <button id="adminLogoutBtn" class="admin-sidebar__link admin-sidebar__link--btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    `;

    document.getElementById("adminLogoutBtn")?.addEventListener("click", async () => {
      await logoutUser();
      window.location.href = "../index.html";
    });
  }

  const adminNameEl = document.getElementById("adminName");
  if (adminNameEl) adminNameEl.textContent = profile.name || "الإدمن";
}
