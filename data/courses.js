// ============================================
// GALAL ACADEMY — COURSES DATA
// لإضافة كورس جديد: انسخ Object كامل وعدّل بياناته
// لإضافة حصة/فيديو/ملف جديد: أضفه جوه sections الخاصة بالكورس
// ============================================

export const courses = [
  // ============ COURSE 01 — كورس التأسيس ============
  {
    id: "foundation",
    titleAr: "كورس التأسيس",
    subtitleAr: "أولى خطوة في عالم البرمجة، بأسلوب مبسّط ومنظم",
    price: 150,
    currency: "EGP",
    status: "active", // "active" | "coming-soon"
    grade: "تأسيسي",
    image: "assets/images/courses/course-foundation.jpg",
    description: "CONTENT_TO_BE_ADDED",

    stats: {
      sessionsCount: 20,
    },

    sessionTemplate: [
      { type: "exam", labelAr: "امتحان على الحصة السابقة" },
      { type: "video-explain", labelAr: "فيديو شرح" },
      { type: "video-solve", labelAr: "فيديو حل" },
      { type: "file-explain", labelAr: "ملف شرح" },
      { type: "file-solve", labelAr: "ملف حل" },
    ],

    sessions: Array.from({ length: 20 }, (_, i) => ({
      id: `foundation-session-${i + 1}`,
      order: i + 1,
      titleAr: `الحصة ${i + 1}`,
      exam: {
        titleAr: `امتحان الحصة ${i + 1}`,
        data: "EXAM_DATA_HERE",
      },
      videoExplain: { titleAr: "فيديو الشرح", url: "YOUTUBE_LINK_HERE" },
      videoSolve: { titleAr: "فيديو الحل", url: "YOUTUBE_LINK_HERE" },
      fileExplain: { titleAr: "ملف الشرح", url: "DRIVE_LINK_HERE" },
      fileSolve: { titleAr: "ملف الحل", url: "DRIVE_LINK_HERE" },
    })),
  },

  // ============ COURSE 02 — أولى ثانوي - الترم الأول ============
  {
    id: "first-secondary-term1",
    titleAr: "كورس أولى ثانوي - الترم الأول",
    subtitleAr: "منهج البرمجة كامل بالشرح النظري والعملي وحل الكتاب والتقييمات",
    price: 350,
    currency: "EGP",
    status: "active",
    grade: "أولى ثانوي",
    image: "assets/images/courses/course-first-secondary.jpg",
    description: "CONTENT_TO_BE_ADDED",

    parts: [
      {
        id: "theory",
        titleAr: "الشرح النظري",
        type: "video-series",
        videosCount: 25,
        videos: Array.from({ length: 25 }, (_, i) => ({
          id: `fs-theory-${i + 1}`,
          order: i + 1,
          titleAr: `فيديو الشرح النظري ${i + 1}`,
          url: "YOUTUBE_LINK_HERE",
        })),
      },
      {
        id: "practical",
        titleAr: "الشرح العملي",
        type: "session-series",
        sessionsCount: 20,
        sessions: Array.from({ length: 20 }, (_, i) => ({
          id: `fs-practical-${i + 1}`,
          order: i + 1,
          titleAr: `الحصة العملية ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
          exam: { data: "EXAM_DATA_HERE" },
        })),
      },
      {
        id: "book-solve",
        titleAr: "حل كتاب المدرسة",
        type: "video-file-series",
        videosCount: 25,
        filesCount: 25,
        items: Array.from({ length: 25 }, (_, i) => ({
          id: `fs-book-${i + 1}`,
          order: i + 1,
          titleAr: `حل كتاب المدرسة ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
          file: { url: "DRIVE_LINK_HERE" },
        })),
      },
      {
        id: "assessments",
        titleAr: "حل التقييمات",
        type: "video-file-series",
        videosCount: 12,
        filesCount: 12,
        items: Array.from({ length: 12 }, (_, i) => ({
          id: `fs-assess-${i + 1}`,
          order: i + 1,
          titleAr: `حل التقييم ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
          file: { url: "DRIVE_LINK_HERE" },
        })),
      },
      {
        id: "quryo-tawfas",
        titleAr: "حل منصة كيريو واختبارات توفاس",
        type: "video-series",
        videosCount: 20,
        videos: Array.from({ length: 20 }, (_, i) => ({
          id: `fs-quryo-${i + 1}`,
          order: i + 1,
          titleAr: `حل كيريو / توفاس ${i + 1}`,
          url: "YOUTUBE_LINK_HERE",
        })),
      },
    ],
  },

  // ============ COURSE 03 — ثانية ثانوي - الترم الأول ============
  {
    id: "second-secondary-term1",
    titleAr: "كورس ثانية ثانوي - الترم الأول",
    subtitleAr: "منهج متكامل شرحًا نظريًا وعمليًا مع حل الكتب المدرسية والخارجية",
    price: 500,
    currency: "EGP",
    status: "active",
    grade: "ثانية ثانوي",
    image: "assets/images/courses/course-second-secondary.jpg",
    description: "CONTENT_TO_BE_ADDED",

    parts: [
      {
        id: "theory",
        titleAr: "الشرح النظري",
        type: "video-series",
        videosCount: 25,
        videos: Array.from({ length: 25 }, (_, i) => ({
          id: `ss-theory-${i + 1}`,
          order: i + 1,
          titleAr: `فيديو الشرح النظري ${i + 1}`,
          url: "YOUTUBE_LINK_HERE",
        })),
      },
      {
        id: "practical",
        titleAr: "الشرح العملي",
        type: "session-series",
        sessionsCount: 20,
        sessions: Array.from({ length: 20 }, (_, i) => ({
          id: `ss-practical-${i + 1}`,
          order: i + 1,
          titleAr: `الحصة العملية ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
        })),
      },
      {
        id: "book-solve",
        titleAr: "حل كتاب المدرسة",
        type: "video-file-series",
        videosCount: 25,
        filesCount: 25,
        items: Array.from({ length: 25 }, (_, i) => ({
          id: `ss-book-${i + 1}`,
          order: i + 1,
          titleAr: `حل كتاب المدرسة ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
          file: { url: "DRIVE_LINK_HERE" },
        })),
      },
      {
        id: "assessments",
        titleAr: "حل التقييمات",
        type: "video-file-series",
        videosCount: 12,
        filesCount: 12,
        items: Array.from({ length: 12 }, (_, i) => ({
          id: `ss-assess-${i + 1}`,
          order: i + 1,
          titleAr: `حل التقييم ${i + 1}`,
          video: { url: "YOUTUBE_LINK_HERE" },
          file: { url: "DRIVE_LINK_HERE" },
        })),
      },
      {
        id: "quryo-tawfas",
        titleAr: "حل منصة كيريو واختبارات توفاس",
        type: "video-series",
        videosCount: 20,
        videos: Array.from({ length: 20 }, (_, i) => ({
          id: `ss-quryo-${i + 1}`,
          order: i + 1,
          titleAr: `حل كيريو / توفاس ${i + 1}`,
          url: "YOUTUBE_LINK_HERE",
        })),
      },
      {
        id: "external-books",
        titleAr: "حل الكتب الخارجية",
        type: "video-series",
        videosCount: 25,
        videos: Array.from({ length: 25 }, (_, i) => ({
          id: `ss-external-${i + 1}`,
          order: i + 1,
          titleAr: `حل كتاب خارجي ${i + 1}`,
          url: "YOUTUBE_LINK_HERE",
        })),
      },
    ],
  },
];

// ============ Coming Soon Courses ============
export const comingSoonCourses = [
  { id: "cpp-basics", titleAr: "أساسيات البرمجة باستخدام C++" },
  { id: "csharp-basics", titleAr: "أساسيات البرمجة باستخدام C#" },
  { id: "python-pro", titleAr: "احترف Python من الصفر" },
  { id: "web-development", titleAr: "Web Development" },
  { id: "ai-course", titleAr: "Artificial Intelligence" },
  { id: "cybersecurity", titleAr: "Cybersecurity" },
  {
    id: "frontend-development",
    titleAr: "Front-End Development",
    includes: ["HTML", "CSS", "JavaScript", "Responsive Design", "Web Design", "Projects"],
  },
];

// ============ Helper Functions ============
export function getCourseById(id) {
  return courses.find((c) => c.id === id);
}

export function getActiveCourses() {
  return courses.filter((c) => c.status === "active");
}
