// ============================================
// GALAL ACADEMY — AUTH.JS
// ربط فورمز الدخول والتسجيل بـ Firebase Authentication
// ============================================

import { registerUser, loginUser, translateAuthError } from "../firebase/firebase-auth.js";

/* ==================== Register Form ==================== */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const errorEl = document.getElementById("registerError");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("registerPhone").value.trim();
    const grade = document.getElementById("registerGrade").value;
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !phone || !grade || !password) {
      errorEl.textContent = "من فضلك املأ كل الحقول.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "بنجهزلك حسابك...";

    try {
      await registerUser({ name, email, phone, grade, password });
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = translateAuthError(err.code);
      submitBtn.disabled = false;
      submitBtn.textContent = "إنشاء الحساب";
    }
  });
}

/* ==================== Login Form ==================== */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const errorEl = document.getElementById("loginError");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      errorEl.textContent = "من فضلك اكتب الإيميل وكلمة المرور.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "بيتم تسجيل الدخول...";

    try {
      await loginUser(email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = translateAuthError(err.code);
      submitBtn.disabled = false;
      submitBtn.textContent = "تسجيل الدخول";
    }
  });
}

/* ==================== Init ==================== */
document.addEventListener("DOMContentLoaded", () => {
  initRegisterForm();
  initLoginForm();
});
