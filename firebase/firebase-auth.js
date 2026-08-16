// ============================================
// GALAL ACADEMY — FIREBASE AUTH
// كل عمليات تسجيل الدخول والخروج وإنشاء الحساب
// ============================================

import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { createUserProfile } from "./firebase-firestore.js";

/**
 * إنشاء حساب جديد + إنشاء بروفايل الطالب في Firestore
 * @param {Object} data - { name, email, phone, grade, password }
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function registerUser({ name, email, phone, grade, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await createUserProfile(credential.user.uid, {
    name,
    email,
    phone,
    grade,
    xp: 0,
    avatarUrl: "assets/images/students/avatar-default.png",
  });

  return credential.user;
}

/**
 * تسجيل الدخول
 * @param {string} email
 * @param {string} password
 */
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * تسجيل الخروج
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * مراقبة حالة تسجيل الدخول (Login/Logout) — تستخدم لحماية الصفحات
 * @param {(user: import('firebase/auth').User | null) => void} callback
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * ترجمة أكواد أخطاء Firebase لرسائل عربية مفهومة للطالب
 */
export function translateAuthError(errorCode) {
  const messages = {
    "auth/email-already-in-use": "البريد الإلكتروني ده مستخدم بالفعل.",
    "auth/invalid-email": "البريد الإلكتروني مش صحيح.",
    "auth/weak-password": "كلمة المرور لازم تكون 6 أحرف على الأقل.",
    "auth/user-not-found": "مفيش حساب بالبيانات دي.",
    "auth/wrong-password": "كلمة المرور غلط.",
    "auth/invalid-credential": "بيانات الدخول غلط، تأكد من الإيميل وكلمة المرور.",
    "auth/too-many-requests": "محاولات كتير غلط. جرّب تاني بعد شوية.",
  };
  return messages[errorCode] || "حصل خطأ، جرّب تاني.";
}
