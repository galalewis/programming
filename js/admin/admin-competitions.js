// ============================================
// GALAL ACADEMY — ADMIN COMPETITIONS
// ============================================

import { requireAdmin } from "./admin-common.js";
import { getAllCompetitions, createCompetition, deleteCompetition } from "../../firebase/firebase-firestore.js";

let questionCount = 0;

requireAdmin(async () => {
  document.getElementById("authLoading").hidden = true;
  document.getElementById("adminShell").hidden = false;

  addQuestionRow(); // سؤال واحد افتراضي عند فتح الصفحة
  await renderCompetitionsList();

  document.getElementById("addQuestionBtn").addEventListener("click", addQuestionRow);
  document.getElementById("createCompetitionForm").addEventListener("submit", handleCreateCompetition);
});

/* ==================== Question Builder ==================== */
function addQuestionRow() {
  questionCount++;
  const id = `q${questionCount}`;
  const container = document.getElementById("questionsBuilder");

  const row = document.createElement("div");
  row.className = "admin-card";
  row.dataset.questionId = id;
  row.style.background = "var(--color-surface-alt)";

  row.innerHTML = `
    <div class="form-group">
      <label>نص السؤال</label>
      <input type="text" class="q-text" required placeholder="اكتب السؤال هنا" />
    </div>
    <div class="form-group">
      <label>نوع السؤال</label>
      <select class="q-type">
        <option value="true-false">صح / غلط</option>
        <option value="multiple-choice">اختيار من متعدد</option>
      </select>
    </div>
    <div class="q-tf-answer form-group">
      <label>الإجابة الصح</label>
      <select class="q-tf-correct">
        <option value="true">صح</option>
        <option value="false">غلط</option>
      </select>
    </div>
    <div class="q-mc-options" style="display:none;">
      <div class="form-group">
        <label>الاختيارات (افصل بينهم بفاصلة ,)</label>
        <input type="text" class="q-mc-list" placeholder="اختيار 1, اختيار 2, اختيار 3, اختيار 4" />
      </div>
      <div class="form-group">
        <label>رقم الاختيار الصح (0 = الأول)</label>
        <input type="number" class="q-mc-correct" min="0" value="0" />
      </div>
    </div>
    <button type="button" class="btn btn--ghost btn--sm remove-question">احذف السؤال</button>
  `;

  const typeSelect = row.querySelector(".q-type");
  const tfBlock = row.querySelector(".q-tf-answer");
  const mcBlock = row.querySelector(".q-mc-options");

  typeSelect.addEventListener("change", () => {
    const isTF = typeSelect.value === "true-false";
    tfBlock.style.display = isTF ? "" : "none";
    mcBlock.style.display = isTF ? "none" : "";
  });

  row.querySelector(".remove-question").addEventListener("click", () => row.remove());

  document.getElementById("questionsBuilder").appendChild(row);
}

/* ==================== Create Competition ==================== */
async function handleCreateCompetition(e) {
  e.preventDefault();
  const errorEl = document.getElementById("compFormError");
  errorEl.textContent = "";

  const title = document.getElementById("compTitle").value.trim();
  const type = document.getElementById("compType").value;
  const durationSeconds = Number(document.getElementById("compDuration").value) * 60;
  const startAt = new Date(document.getElementById("compStart").value);
  const endAt = new Date(document.getElementById("compEnd").value);

  const questionRows = document.querySelectorAll("#questionsBuilder > div");
  if (questionRows.length === 0) {
    errorEl.textContent = "ضيف سؤال واحد على الأقل.";
    return;
  }

  const questions = [];
  let hasError = false;

  questionRows.forEach((row, index) => {
    const text = row.querySelector(".q-text").value.trim();
    const type = row.querySelector(".q-type").value;

    if (!text) {
      hasError = true;
      return;
    }

    if (type === "true-false") {
      const correct = row.querySelector(".q-tf-correct").value === "true";
      questions.push({ id: `c${index + 1}`, type, textAr: text, correctAnswer: correct });
    } else {
      const optionsRaw = row.querySelector(".q-mc-list").value.trim();
      const options = optionsRaw.split(",").map((o) => o.trim()).filter(Boolean);
      const correctIndex = Number(row.querySelector(".q-mc-correct").value);

      if (options.length < 2) {
        hasError = true;
        return;
      }

      questions.push({ id: `c${index + 1}`, type, textAr: text, options, correctAnswerIndex: correctIndex });
    }
  });

  if (hasError) {
    errorEl.textContent = "فيه سؤال ناقص بيانات، راجع الأسئلة تاني.";
    return;
  }

  if (endAt <= startAt) {
    errorEl.textContent = "تاريخ النهاية لازم يكون بعد تاريخ البداية.";
    return;
  }

  await createCompetition({ title, type, durationSeconds, startAt, endAt, questions });

  document.getElementById("createCompetitionForm").reset();
  document.getElementById("questionsBuilder").innerHTML = "";
  questionCount = 0;
  addQuestionRow();

  await renderCompetitionsList();
}

/* ==================== List + Delete ==================== */
async function renderCompetitionsList() {
  const competitions = await getAllCompetitions();
  const tbody = document.getElementById("competitionsTableBody");

  if (competitions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">لسه معملتش أي مسابقة.</td></tr>`;
    return;
  }

  tbody.innerHTML = competitions
    .map((comp) => {
      const typeLabel = comp.type === "weekly" ? "أسبوعية" : "شهرية";
      const endLabel = comp.endAt?.toDate ? comp.endAt.toDate().toLocaleString("ar-EG") : "—";
      return `
        <tr>
          <td>${comp.title}</td>
          <td>${typeLabel}</td>
          <td>${comp.questions?.length || 0}</td>
          <td>${endLabel}</td>
          <td><button class="btn btn--danger btn--sm" data-delete="${comp.id}">حذف</button></td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("متأكد إنك عايز تحذف المسابقة دي؟")) return;
      await deleteCompetition(btn.dataset.delete);
      await renderCompetitionsList();
    });
  });
}
