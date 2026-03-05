/**
 * LanguageToggle — Switch between Arabic and English
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-navy/10 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
      title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      <Globe className="w-4 h-4 text-navy/50 group-hover:text-navy transition-colors" />
      <span className="text-xs font-semibold text-navy/70 group-hover:text-navy transition-colors">
        {lang === "ar" ? "EN" : "عربي"}
      </span>
    </button>
  );
}
