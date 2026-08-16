// ============================================
// GALAL ACADEMY — FIRESTORE HELPERS
// كل التعامل مع قاعدة البيانات من مكان واحد
// ============================================

import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  addDoc,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ==================== Users ==================== */

/**
 * إنشاء بروفايل طالب جديد بعد التسجيل
 */
export async function createUserProfile(uid, { name, email, phone, grade, xp = 0, avatarUrl }) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    phone,
    grade,
    xp,
    avatarUrl,
    role: "student", // "student" | "admin"
    createdAt: serverTimestamp(),
  });

  // نسخة عامة آمنة للعرض في لوحة المتصدرين (من غير إيميل أو تليفون)
  await setDoc(doc(db, "leaderboard", uid), {
    name,
    avatarUrl,
    grade,
    xp,
  });
}

/**
 * جلب بروفايل طالب
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * تحديث بيانات بروفايل (اسم، صورة، إلخ)
 */
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

/**
 * إضافة XP لطالب (يُستخدم بعد امتحان، مسابقة، أو إكمال حصة)
 */
export async function addUserXP(uid, amount) {
  await updateDoc(doc(db, "users", uid), {
    xp: increment(amount),
  });
  await updateDoc(doc(db, "leaderboard", uid), {
    xp: increment(amount),
  });
}

/**
 * [Admin] جلب كل الطلاب المسجّلين
 */
export async function getAllStudents() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ==================== Enrollments ==================== */
// معرف المستند: `${uid}_${courseId}` — عشان نضمن اشتراك واحد لكل طالب في كل كورس

/**
 * طلب اشتراك جديد في كورس (يبدأ بحالة pending)
 */
export async function requestEnrollment(uid, courseId, note = "") {
  const enrollmentId = `${uid}_${courseId}`;
  await setDoc(doc(db, "enrollments", enrollmentId), {
    userId: uid,
    courseId,
    status: "pending", // "pending" | "approved" | "rejected"
    paymentProofNote: note,
    requestedAt: serverTimestamp(),
    reviewedAt: null,
  });
  return enrollmentId;
}

/**
 * جلب كل اشتراكات طالب معيّن
 */
export async function getUserEnrollments(uid) {
  const q = query(collection(db, "enrollments"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * التحقق هل طالب معيّن عنده صلاحية دخول كورس معيّن (approved)
 */
export async function hasCourseAccess(uid, courseId) {
  const snap = await getDoc(doc(db, "enrollments", `${uid}_${courseId}`));
  return snap.exists() && snap.data().status === "approved";
}

/**
 * [Admin] تحديث حالة اشتراك (موافقة / رفض) + إشعار الطالب تلقائيًا
 */
export async function reviewEnrollment(enrollmentId, status) {
  await updateDoc(doc(db, "enrollments", enrollmentId), {
    status, // "approved" | "rejected"
    reviewedAt: serverTimestamp(),
  });

  const enrollmentSnap = await getDoc(doc(db, "enrollments", enrollmentId));
  if (enrollmentSnap.exists()) {
    const { userId } = enrollmentSnap.data();
    const message =
      status === "approved"
        ? "تم تفعيل اشتراكك في الكورس! تقدر تدخل عليه دلوقتي من صفحة كورساتي."
        : "للأسف لم نتمكن من تأكيد اشتراكك. راسلنا على واتساب للمراجعة.";
    await sendNotification(userId, message);
  }
}

/**
 * [Admin] جلب الاشتراكات حسب الحالة (pending / approved / rejected)
 */
export async function getEnrollmentsByStatus(status) {
  const q = query(collection(db, "enrollments"), where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * [Admin] جلب كل الاشتراكات المعلّقة
 */
export async function getPendingEnrollments() {
  return getEnrollmentsByStatus("pending");
}

/* ==================== Progress ==================== */

/**
 * تحديث تقدم طالب في كورس معيّن
 */
export async function updateCourseProgress(uid, courseId, { completedLessons, completedPercentage }) {
  await setDoc(
    doc(db, "progress", uid, "courses", courseId),
    {
      completedLessons,
      completedPercentage,
      lastAccessedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * جلب تقدم طالب في كورس معيّن
 */
export async function getCourseProgress(uid, courseId) {
  const snap = await getDoc(doc(db, "progress", uid, "courses", courseId));
  return snap.exists() ? snap.data() : null;
}

/* ==================== Exam Results ==================== */

/**
 * تسجيل نتيجة امتحان + إضافة XP تلقائيًا
 */
export async function submitExamResult({ uid, examId, courseId, score, correctCount, wrongCount, percentage, xpEarned }) {
  const resultRef = await addDoc(collection(db, "examResults"), {
    userId: uid,
    examId,
    courseId,
    score,
    correctCount,
    wrongCount,
    percentage,
    xpEarned,
    submittedAt: serverTimestamp(),
  });

  if (xpEarned > 0) {
    await addUserXP(uid, xpEarned);
  }

  return resultRef.id;
}

/**
 * جلب كل نتائج امتحانات طالب معيّن
 */
export async function getUserExamResults(uid) {
  const q = query(
    collection(db, "examResults"),
    where("userId", "==", uid),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ==================== Leaderboard ==================== */

/**
 * جلب أعلى الطلاب بالـ XP (كل الوقت)
 * (Weekly/Monthly leaderboards هتحتاج تجميع بيانات إضافي، هيتضاف في PHASE 8)
 */
export async function getTopStudents(limitCount = 20) {
  const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d, index) => ({ id: d.id, rank: index + 1, ...d.data() }));
}

/**
 * حساب ترتيب طالب معيّن (حتى لو مش موجود في أعلى 20)
 * بيحسب عدد الطلاب اللي XP بتاعهم أكبر منه + 1
 */
export async function getUserRank(userXp) {
  const q = query(collection(db, "leaderboard"), where("xp", ">", userXp));
  const snap = await getCountFromServer(q);
  return snap.data().count + 1;
}

/**
 * جلب نتائج امتحانات كل الطلاب من تاريخ معيّن (لحساب ترتيب أسبوعي/شهري)
 */
export async function getExamResultsSince(sinceDate) {
  const q = query(collection(db, "examResults"), where("submittedAt", ">=", sinceDate));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/**
 * جلب نتائج مسابقات كل الطلاب من تاريخ معيّن (لحساب ترتيب أسبوعي/شهري)
 */
export async function getCompetitionResultsSince(sinceDate) {
  const q = query(collection(db, "competitionResults"), where("completedAt", ">=", sinceDate));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/* ==================== Competitions ==================== */

/**
 * جلب المسابقات النشطة حاليًا (لسه في وقتها)
 */
export async function getActiveCompetitions() {
  const now = new Date();
  const q = query(collection(db, "competitions"), where("endAt", ">=", now), orderBy("endAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * جلب مسابقة واحدة بالتفصيل (بأسئلتها)
 */
export async function getCompetitionById(competitionId) {
  const snap = await getDoc(doc(db, "competitions", competitionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * التحقق هل الطالب شارك في المسابقة دي قبل كده
 */
export async function hasCompletedCompetition(uid, competitionId) {
  const q = query(
    collection(db, "competitionResults"),
    where("userId", "==", uid),
    where("competitionId", "==", competitionId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * تسجيل نتيجة مسابقة + إضافة XP تلقائيًا
 */
export async function submitCompetitionResult({ uid, competitionId, score, correctCount, wrongCount, percentage, xpEarned }) {
  const resultRef = await addDoc(collection(db, "competitionResults"), {
    userId: uid,
    competitionId,
    score,
    correctCount,
    wrongCount,
    percentage,
    xpEarned,
    completedAt: serverTimestamp(),
  });

  if (xpEarned > 0) {
    await addUserXP(uid, xpEarned);
  }

  return resultRef.id;
}

/**
 * [Admin] جلب كل المسابقات (نشطة ومنتهية) للإدارة
 */
export async function getAllCompetitions() {
  const q = query(collection(db, "competitions"), orderBy("startAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * [Admin] إنشاء مسابقة جديدة
 */
export async function createCompetition({ title, type, durationSeconds, startAt, endAt, questions }) {
  const ref = await addDoc(collection(db, "competitions"), {
    title,
    type, // "weekly" | "monthly"
    durationSeconds,
    startAt,
    endAt,
    questions,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * [Admin] حذف مسابقة
 */
export async function deleteCompetition(competitionId) {
  await deleteDoc(doc(db, "competitions", competitionId));
}

/* ==================== Rewards ==================== */

/**
 * جلب كل الجوائز (متاحة لأي حد يشوفها كتحفيز)
 */
export async function getRewards() {
  const q = query(collection(db, "rewards"), orderBy("xpRequired", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * [Admin] إضافة جائزة جديدة
 */
export async function addReward({ titleAr, descAr, xpRequired }) {
  const ref = await addDoc(collection(db, "rewards"), {
    titleAr,
    descAr,
    xpRequired,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * [Admin] حذف جائزة
 */
export async function deleteReward(rewardId) {
  await deleteDoc(doc(db, "rewards", rewardId));
}

/**
 * إرسال إشعار لطالب
 */
export async function sendNotification(uid, message) {
  await addDoc(collection(db, "notifications", uid, "items"), {
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * جلب إشعارات طالب
 */
export async function getUserNotifications(uid) {
  const q = query(
    collection(db, "notifications", uid, "items"),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
