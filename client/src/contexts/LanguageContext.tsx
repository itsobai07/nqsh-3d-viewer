/**
 * Language Context — Arabic/English translation support
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Lang = "ar" | "en";

interface Translations {
  [key: string]: { ar: string; en: string };
}

const translations: Translations = {
  // Hero
  heroSubtitle: { ar: "عارض ثلاثي الأبعاد تفاعلي لمنتجاتك", en: "Interactive 3D Viewer for Your Products" },
  heroDesc: { ar: "اعرض منتجاتك المطبوعة بتقنية ثلاثية الأبعاد بشكل تفاعلي — دوران 360° وتكبير وواقع معزز", en: "Display your 3D printed products interactively — 360° rotation, zoom, and augmented reality" },
  tryViewer: { ar: "جرّب العارض", en: "Try the Viewer" },
  uploadModel: { ar: "ارفع نموذجك", en: "Upload Model" },
  supports: { ar: "يدعم:", en: "Supports:" },
  // Tabs
  tabViewer: { ar: "العارض", en: "Viewer" },
  tabSettings: { ar: "الإعدادات", en: "Settings" },
  tabEmbed: { ar: "كود التضمين", en: "Embed Code" },
  // Viewer
  demoModel: { ar: "نموذج تجريبي", en: "Demo Model" },
  changeModel: { ar: "تغيير النموذج", en: "Change Model" },
  enterUrl: { ar: "أو أدخل رابط النموذج (GLB / GLTF / STL)", en: "Or enter a model URL (GLB / GLTF / STL)" },
  externalModel: { ar: "نموذج خارجي", en: "External Model" },
  // Settings
  bgColor: { ar: "لون الخلفية", en: "Background Color" },
  autoRotate: { ar: "الدوران التلقائي", en: "Auto Rotate" },
  arMode: { ar: "الواقع المعزز (AR)", en: "Augmented Reality (AR)" },
  arMobileOnly: { ar: "يعمل على الأجهزة المحمولة فقط", en: "Works on mobile devices only" },
  modelColor: { ar: "لون النموذج (STL)", en: "Model Color (STL)" },
  wireframe: { ar: "الإطار السلكي (STL)", en: "Wireframe (STL)" },
  lighting: { ar: "الإضاءة", en: "Lighting" },
  lightingDesc: { ar: "تحكم بشدة الإضاءة على النموذج", en: "Control the lighting intensity on the model" },
  enabled: { ar: "مفعّل", en: "Enabled" },
  disabled: { ar: "معطّل", en: "Disabled" },
  // Embed
  embedSettings: { ar: "إعدادات التضمين", en: "Embed Settings" },
  dimensions: { ar: "الأبعاد", en: "Dimensions" },
  width: { ar: "العرض", en: "Width" },
  height: { ar: "الارتفاع", en: "Height" },
  embedPreview: { ar: "معاينة التضمين", en: "Embed Preview" },
  embedCodeTitle: { ar: "كود التضمين", en: "Embed Code" },
  copyCode: { ar: "نسخ الكود", en: "Copy Code" },
  copied: { ar: "تم النسخ", en: "Copied" },
  embedTip: { ar: "انسخ هذا الكود والصقه في صفحة المنتج على موقعك. يمكنك تعديل الأبعاد والخلفية من الإعدادات.", en: "Copy this code and paste it into your product page. You can adjust dimensions and background from settings." },
  // Products
  fromStore: { ar: "من متجر نقش", en: "From NQSH Store" },
  productsTitle: { ar: "منتجاتنا المطبوعة ثلاثياً", en: "Our 3D Printed Products" },
  productsDesc: { ar: "تصفح منتجاتنا المصممة بعناية — قريباً ستتمكن من معاينة كل منتج بعرض ثلاثي الأبعاد تفاعلي", en: "Browse our carefully designed products — soon you'll be able to preview each product with an interactive 3D view" },
  soon3D: { ar: "قريباً 3D", en: "3D Soon" },
  view3D: { ar: "عرض 3D", en: "View 3D" },
  sale: { ar: "خصم", en: "Sale" },
  visitStore: { ar: "زيارة المتجر الكامل", en: "Visit Full Store" },
  // How It Works
  howItWorks: { ar: "كيف يعمل", en: "How It Works" },
  howItWorksDesc: { ar: "ثلاث خطوات بسيطة لعرض منتجاتك بشكل ثلاثي الأبعاد", en: "Three simple steps to display your products in 3D" },
  step1Title: { ar: "جهّز النموذج", en: "Prepare the Model" },
  step1Desc: { ar: "صدّر نموذجك ثلاثي الأبعاد بصيغة GLB أو GLTF أو STL من أي برنامج تصميم", en: "Export your 3D model as GLB, GLTF, or STL from any design software" },
  step2Title: { ar: "خصّص العارض", en: "Customize the Viewer" },
  step2Desc: { ar: "اختر الإعدادات المناسبة — الخلفية والدوران والأبعاد واللون", en: "Choose the right settings — background, rotation, dimensions, and color" },
  step3Title: { ar: "ضمّن في موقعك", en: "Embed in Your Site" },
  step3Desc: { ar: "انسخ كود التضمين والصقه في صفحة المنتج على موقعك", en: "Copy the embed code and paste it into your product page" },
  // Formats
  formatsTitle: { ar: "الصيغ المدعومة", en: "Supported Formats" },
  formatsDesc: { ar: "يدعم العارض أشهر صيغ النماذج ثلاثية الأبعاد", en: "The viewer supports the most popular 3D model formats" },
  recommended: { ar: "موصى به", en: "Recommended" },
  // Footer
  footerTagline: { ar: "طبع بحب بأيدي سورية", en: "Printed with love by Syrian hands" },
  visitStoreShort: { ar: "زيارة المتجر", en: "Visit Store" },
  instagram: { ar: "انستغرام", en: "Instagram" },
  // Viewer controls
  dragToRotate: { ar: "اسحب للتدوير • اضغط للتكبير", en: "Drag to rotate • Pinch to zoom" },
  stopRotation: { ar: "إيقاف الدوران", en: "Stop Rotation" },
  startRotation: { ar: "تشغيل الدوران", en: "Start Rotation" },
  zoomIn: { ar: "تكبير", en: "Zoom In" },
  zoomOut: { ar: "تصغير", en: "Zoom Out" },
  resetCamera: { ar: "إعادة ضبط الكاميرا", en: "Reset Camera" },
  lightBg: { ar: "خلفية فاتحة", en: "Light Background" },
  darkBg: { ar: "خلفية داكنة", en: "Dark Background" },
  fullscreen: { ar: "ملء الشاشة", en: "Fullscreen" },
  exitFullscreen: { ar: "تصغير", en: "Exit Fullscreen" },
  arView: { ar: "عرض بالواقع المعزز", en: "View in AR" },
  // Toasts
  uploadSuccess: { ar: "تم تحميل النموذج بنجاح", en: "Model uploaded successfully" },
  uploadError: { ar: "صيغة غير مدعومة", en: "Unsupported format" },
  uploadErrorDesc: { ar: "يرجى رفع ملف بصيغة GLB أو GLTF أو STL", en: "Please upload a GLB, GLTF, or STL file" },
  urlSuccess: { ar: "تم تحميل النموذج من الرابط", en: "Model loaded from URL" },
  urlError: { ar: "رابط غير صالح", en: "Invalid URL" },
  urlErrorDesc: { ar: "يرجى إدخال رابط ينتهي بـ .glb أو .gltf أو .stl", en: "Please enter a URL ending with .glb, .gltf, or .stl" },
  embedCopied: { ar: "تم نسخ كود التضمين", en: "Embed code copied" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.ar || key;
    },
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
