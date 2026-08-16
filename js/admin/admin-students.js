// ============================================
// GALAL ACADEMY — ADMIN STUDENTS
// ============================================

import { requireAdmin } from "./admin-common.js";
import { getAllStudents } from "../../firebase/firebase-firestore.js";

let allStudents = [];

requireAdmin(async () => {
  document.getElementById("authLoading").hidden = true;
  document.getElementById("adminShell").hidden = false;

  allStudents = await getAllStudents();
  document.getElementById("studentsCount").textContent = allStudents.length;
  renderTable(allStudents);

  document.getElementById("studentSearch").addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();
    const filtered = allStudents.filter(
      (s) => s.name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term)
    );
    renderTable(filtered);
  });
});

function renderTable(students) {
  const tbody = document.getElementById("studentsTableBody");
  const emptyEl = document.getElementById("studentsEmpty");

  if (students.length === 0) {
    tbody.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  tbody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td>${s.name || "—"}</td>
      <td dir="ltr" style="text-align:right;">${s.email || "—"}</td>
      <td dir="ltr" style="text-align:right;">${s.phone || "—"}</td>
      <td>${gradeLabel(s.grade)}</td>
      <td><strong>${s.xp || 0}</strong></td>
      <td>${formatDate(s.createdAt)}</td>
    </tr>`
    )
    .join("");
}

function gradeLabel(grade) {
  const labels = {
    foundation: "تأسيسي",
    "first-secondary": "أولى ثانوي",
    "second-secondary": "ثانية ثانوي",
    other: "مرحلة تانية",
  };
  return labels[grade] || grade || "—";
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "—";
  return timestamp.toDate().toLocaleDateString("ar-EG");
}
