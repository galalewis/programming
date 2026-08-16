// ============================================
// GALAL ACADEMY — CENTRAL CONFIGURATION
// أي تعديل هنا بينعكس تلقائيًا على الموقع كله
// ============================================

export const config = {
  // -------------------- Brand --------------------
  brand: {
    nameAr: "جلال أكاديمي",
    nameEn: "Galal Academy",
    tagline: "برمج مستقبلك.. من مقاعد الدراسة.",
    taglineEn: "Code your future.. from your school desk.",
  },

  // -------------------- Founder --------------------
  founder: {
    nameAr: "جلال عويس",
    nameEn: "Galal Ewis",
    university: "كلية الحاسبات والمعلومات - جامعة الزقازيق",
    specialty: "Computer Science / Programming",
    bio:
      "جلال عويس، دارس بكلية الحاسبات والمعلومات جامعة الزقازيق، مطور ويب وديسكتوب شغوف باستخدام Python في مجالات الذكاء الاصطناعي والأمن السيبراني. صانع محتوى تعليمي ومؤسس منصة وقناة Galal Academy التعليمية لتبسيط علوم الحاسب ومنهج البرمجة والذكاء الاصطناعي للثانوية العامة (البكالوريا).",
    philosophy:
      "الهدف بناء مبرمج قوي بتقنيات ممنهجة وعملية وحديثة تؤهله لسوق العمل وتساعده على تحقيق أهدافه دون أن يستبدله بالـ AI. المنافس الحقيقي للطالب هو نفسه، والهدف إنه يبقى كل يوم أفضل من نفسه بالأمس.",
    image: "assets/images/founder/profile.jpg",
    coverImage: "assets/images/founder/founder-cover.jpg",
  },

  // -------------------- Contact --------------------
  contact: {
    email: "ewisgalal899@gmail.com",
    phone: "+20 10 38637817",
    whatsapp: "https://wa.me/201038637817",
    telegram: "01202590556",
    location: {
      country: "Egypt",
      governorate: "Sharqia",
      city: "Zagazig",
    },
  },

  // -------------------- Social Media --------------------
  social: {
    youtube: "https://youtube.com/@galalacademy",
    facebook: "https://www.facebook.com/share/1KyWePKFbn/",
    whatsapp: "https://wa.me/201038637817",
    tiktok: "https://www.tiktok.com/@galal.ewis",
    instagram: "https://www.instagram.com/ewisgalal",
    linkedin: "https://www.linkedin.com/in/galal-ewis-2790b83a8",
  },

  // -------------------- Payment --------------------
  payment: {
    method: "Vodafone Cash",
    number: "01038639818",
    whatsappConfirm: "https://wa.me/201038639818",
    instructionsAr:
      "حوّل المبلغ على رقم فودافون كاش، وابعت لينا Screenshot التحويل على واتساب مع ذكر رقم الهاتف المسجل في حسابك.",
  },

  // -------------------- Images --------------------
  images: {
    logo: "assets/images/brand/logo.png",
    logoDark: "assets/images/brand/logo-dark.png",
    favicon: "assets/images/brand/favicon.png",
    heroMain: "assets/images/hero/hero-main.jpg",
    avatarDefault: "assets/images/students/avatar-default.png",
  },

  // -------------------- General Settings --------------------
  settings: {
    defaultTheme: "light", // "light" | "dark"
    currency: "EGP",
    country: "Egypt",
    supportLanguages: ["ar"], // "en" لاحقًا
  },
};
