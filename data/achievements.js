// ============================================
// GALAL ACADEMY — ACHIEVEMENTS DATA
// إضافة إنجاز جديد = إضافة Object جديد في المصفوفة
// شرط الفتح (condition) بيتفحص في js/dashboard.js حسب بيانات الطالب
// ============================================

export const achievements = [
  {
    id: "first-step",
    titleAr: "أول خطوة",
    descAr: "سجّلت في أول كورس ليك في جلال أكاديمي.",
    icon: "badge-01",
    condition: { type: "enrollments-count", value: 1 },
  },
  {
    id: "first-exam",
    titleAr: "أول امتحان",
    descAr: "حليت أول امتحان ليك على المنصة.",
    icon: "badge-02",
    condition: { type: "exams-count", value: 1 },
  },
  {
    id: "exam-master",
    titleAr: "محترف الاختبارات",
    descAr: "حليت 10 امتحانات على المنصة.",
    icon: "badge-03",
    condition: { type: "exams-count", value: 10 },
  },
  {
    id: "high-scorer",
    titleAr: "دقة عالية",
    descAr: "حصلت على 90% أو أكتر في امتحان.",
    icon: "badge-04",
    condition: { type: "single-exam-score", value: 90 },
  },
  {
    id: "xp-100",
    titleAr: "100 نقطة",
    descAr: "جمعت أول 100 نقطة خبرة (XP).",
    icon: "badge-05",
    condition: { type: "xp-total", value: 100 },
  },
  {
    id: "xp-500",
    titleAr: "500 نقطة",
    descAr: "وصلت لـ 500 نقطة خبرة.",
    icon: "badge-06",
    condition: { type: "xp-total", value: 500 },
  },
  {
    id: "course-complete",
    titleAr: "كورس كامل",
    descAr: "خلّصت أول كورس ليك بالكامل.",
    icon: "badge-07",
    condition: { type: "courses-completed", value: 1 },
  },
  {
    id: "consistent-learner",
    titleAr: "استمرارية",
    descAr: "دخلت المنصة وحليت امتحانات في 3 أسابيع مختلفة.",
    icon: "badge-08",
    condition: { type: "manual", value: null },
  },
];

export function getAchievementById(id) {
  return achievements.find((a) => a.id === id);
}
