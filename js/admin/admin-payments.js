// ============================================
// GALAL ACADEMY — ADMIN PAYMENTS
// ============================================

import { requireAdmin } from "./admin-common.js";
import { getEnrollmentsByStatus, reviewEnrollment, getUserProfile } from "../../firebase/firebase-firestore.js";
import { getCourseById } from "../../data/courses.js";

let currentStatus = "pending";

requireAdmin(async () => {
  document.getElementById("authLoading").hidden = true;
  document.getElementById("adminShell").hidden = false;

  await loadPayments(currentStatus);

  document.querySelectorAll(".filter-bar__btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".filter-bar__btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentStatus = btn.dataset.status;
      await loadPayments(currentStatus);
    });
  });
});

async function loadPayments(status) {
  const tbody = document.getElementById("paymentsTableBody");
  const emptyEl = document.getElementById("paymentsEmpty");

  tbody.innerHTML = `<tr><td colspan="5">بنجهز الطلبات...</td></tr>`;
  emptyEl.hidden = true;

  const enrollments = await getEnrollmentsByStatus(status);

  if (enrollments.length === 0) {
    tbody.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }

  const rows = await Promise.all(
    enrollments.map(async (enrollment) => {
      const [student, course] = await Promise.all([
        getUserProfile(enrollment.userId),
        Promise.resolve(getCourseById(enrollment.courseId)),
      ]);

      const statusLabels = { pending: "معلّقة", approved: "مفعّلة", rejected: "مرفوضة" };
      const dateLabel = enrollment.requestedAt?.toDate
        ? enrollment.requestedAt.toDate().toLocaleDateString("ar-EG")
        : "—";

      const actions =
        status === "pending"
          ? `
            <div class="admin-actions">
              <button class="btn btn--success btn--sm" data-action="approve" data-id="${enrollment.id}">موافقة</button>
              <button class="btn btn--danger btn--sm" data-action="reject" data-id="${enrollment.id}">رفض</button>
            </div>`
          : "—";

      return `
        <tr>
          <td>
            <div>${student?.name || "طالب محذوف"}</div>
            <div style="font-size:0.75rem; color:var(--color-text-soft);" dir="ltr">${student?.phone || ""}</div>
          </td>
          <td>${course?.titleAr || enrollment.courseId}</td>
          <td>${dateLabel}</td>
          <td><span class="status-badge status-badge--${enrollment.status}">${statusLabels[enrollment.status]}</span></td>
          <td>${actions}</td>
        </tr>
      `;
    })
  );

  tbody.innerHTML = rows.join("");

  // ربط أزرار الموافقة/الرفض
  tbody.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const enrollmentId = btn.dataset.id;
      const newStatus = btn.dataset.action === "approve" ? "approved" : "rejected";

      btn.disabled = true;
      btn.textContent = "جاري التحديث...";

      await reviewEnrollment(enrollmentId, newStatus);
      await loadPayments(currentStatus);
    });
  });
}
