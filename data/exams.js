// ============================================
// GALAL ACADEMY — EXAMS DATA
// ============================================
// ملحوظة مهمة: أسئلة امتحانات الكورسات الحقيقية (بتاعة كل حصة) لسه Placeholder
// (EXAM_DATA_HERE) جوه data/courses.js لحد ما تحطها بنفسك. النظام هنا بيتعامل
// مع الحالة دي بشكل طبيعي (بيوري "الامتحان لسه مش جاهز" بدل ما يكسر).
//
// عشان تقدر تجرب نظام الامتحانات فورًا، فيه امتحان واحد بس DEMO حقيقي وشغال،
// موضّح بوضوح إنه تجريبي مش من كورساتك.
// ============================================

import { courses } from "./courses.js";

/* ==================== DEMO Exam (للتجربة فقط) ==================== */
export const demoExam = {
  id: "demo-exam",
  titleAr: "امتحان تجريبي (DEMO)",
  isDemo: true,
  questions: [
    {
      id: "d1",
      type: "true-false",
      textAr: "لغة HTML هي لغة برمجة كاملة زي Python.",
      correctAnswer: false,
    },
    {
      id: "d2",
      type: "multiple-choice",
      textAr: "أنهي رمز بيُستخدم لطباعة نص في لغة Python؟",
      options: ["echo", "print", "console.log", "printf"],
      correctAnswerIndex: 1,
    },
    {
      id: "d3",
      type: "true-false",
      textAr: "الـ CSS بتُستخدم لتنسيق شكل صفحات الويب.",
      correctAnswer: true,
    },
    {
      id: "d4",
      type: "multiple-choice",
      textAr: "إيه الامتداد الصحيح لملفات جافا سكريبت؟",
      options: [".js", ".java", ".jsx", ".py"],
      correctAnswerIndex: 0,
    },
  ],
};

/* ==================== Real Course Exams ==================== */
/**
 * بيدوّر على امتحان حصة معيّنة جوه بيانات الكورس، ويرجع الأسئلة لو موجودة فعليًا،
 * أو null لو لسه Placeholder (يعني مفيش أسئلة حقيقية اتحطت لحد دلوقتي)
 */
export function getExamQuestions(examId) {
  if (examId === "demo-exam") {
    return demoExam.questions;
  }

  for (const course of courses) {
    // كورس التأسيس: exam جوه sessions مباشرة
    if (course.sessions) {
      const session = course.sessions.find((s) => s.exam && s.id === examId.replace("-exam", ""));
      if (session && Array.isArray(session.exam.data)) {
        return session.exam.data;
      }
      if (session) return null; // موجود بس لسه EXAM_DATA_HERE
    }

    // كورسات الثانوي: exam جوه parts.practical.sessions
    if (course.parts) {
      const practicalPart = course.parts.find((p) => p.id === "practical");
      if (practicalPart && practicalPart.sessions) {
        const session = practicalPart.sessions.find((s) => s.exam && s.id === examId.replace("-exam", ""));
        if (session && Array.isArray(session.exam.data)) {
          return session.exam.data;
        }
        if (session) return null;
      }
    }
  }

  return null;
}

/**
 * بيرجع قائمة كل الامتحانات المتاحة لكورس معيّن (للعرض في exams.html)
 */
export function getExamsForCourse(courseId) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return [];

  const examList = [];

  if (course.sessions) {
    course.sessions.forEach((s) => {
      examList.push({
        examId: `${s.id}-exam`,
        titleAr: s.exam.titleAr,
        courseId: course.id,
        courseTitleAr: course.titleAr,
        ready: false, // لحد ما تتحط أسئلة حقيقية، هتفضل false تلقائيًا
      });
    });
  }

  if (course.parts) {
    const practicalPart = course.parts.find((p) => p.id === "practical");
    if (practicalPart && practicalPart.sessions) {
      practicalPart.sessions.forEach((s) => {
        if (s.exam) {
          examList.push({
            examId: `${s.id}-exam`,
            titleAr: `امتحان ${s.titleAr}`,
            courseId: course.id,
            courseTitleAr: course.titleAr,
            ready: false,
          });
        }
      });
    }
  }

  return examList;
}
