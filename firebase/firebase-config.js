// ============================================
// GALAL ACADEMY — FIREBASE CONFIG
// ============================================
// ده مشروع Firebase الحقيقي بتاع Galal Academy (galal-academy-da457).
// لو غيّرت المشروع مستقبلاً أو عملت مشروع جديد، استبدل القيم من:
// Firebase Console → Project Settings → General → "Your apps" → Web app → Config
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

 const firebaseConfig = {
    apiKey: "AIzaSyAV7rTMOupRkZdIlkt9F3soa-0Nrlou5FA",
    authDomain: "galal-academy-c5b46.firebaseapp.com",
    projectId: "galal-academy-c5b46",
    storageBucket: "galal-academy-c5b46.firebasestorage.app",
    //messagingSenderId: "6343990020",
    appId: "1:6343990020:web:ccb518bced07ad3ebe4e51"
  };

// -------------------- Init --------------------
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics اختياري — بيتفعّل بس لو المتصفح والبيئة بتدعمه (مش هيشتغل مثلاً وقت
// فتح الملفات مباشرة بـ file://، وده طبيعي ومش مشكلة في التطوير المحلي)
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
