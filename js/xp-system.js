// ============================================
// GALAL ACADEMY — XP SYSTEM
// معادلة حساب النقاط ورسائل التقييم — مكان واحد لتعديل القواعد مستقبلًا
// ============================================

/**
 * حساب XP المكتسب من امتحان حسب عدد الأسئلة والنسبة المئوية
 * القاعدة الحالية: 5 XP لكل سؤال صح، + بونص 10 XP لو النسبة 90% أو أكتر
 */
export function calculateExamXP(percentage, correctCount) {
  const baseXP = correctCount * 5;
  const bonusXP = percentage >= 90 ? 10 : 0;
  return baseXP + bonusXP;
}

/**
 * رسالة تقييم مناسبة حسب النسبة المئوية — نصوص بشرية مش عامة
 */
export function getExamFeedback(percentage) {
  if (percentage >= 90) return "أداء ممتاز، كده انت فاهم الدرس كويس جدًا.";
  if (percentage >= 75) return "أداء كويس، بس راجع الأسئلة اللي غلطت فيها.";
  if (percentage >= 50) return "تمام، بس محتاج تراجع الحصة تاني قبل ما تكمل.";
  return "يفضل تراجع الفيديو والملف تاني قبل ما تكمل للحصة اللي بعدها.";
}
