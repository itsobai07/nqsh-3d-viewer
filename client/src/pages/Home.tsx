/**
 * Home Page — NQSH 3D Viewer
 * Theme: Deep Navy (#0a1628) + Warm Beige (#d4c4b0)
 * FIXES:
 *   1. Model upload now works (key={src} on viewers, reset loaded state)
 *   2. English translation via LanguageContext
 *   3. Antigravity cursor effect ONLY in hero + How It Works sections
 *   4. Logo is bigger (matches "3D Viewer" heading size)
 */

import { useState, useRef, useCallback, lazy, Suspense } from "react";
import ModelViewer from "@/components/ModelViewer";
import AntigravityEffect from "@/components/AntigravityEffect";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Upload,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Box,
  Sparkles,
  ArrowDown,
  Settings2,
  Palette,
  Ruler,
  Eye,
  ShoppingBag,
  Cuboid,
  RotateCcw,
  Layers,
  Sun,
  Grid3x3,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STLViewer = lazy(() => import("@/components/STLViewer"));

const LOGO_DARK = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028291896/WhHEofVoGfMfAZdiUP5fWK/IMG_6623_f500d39f.PNG";

const DEMO_MODEL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

// Products from nqsh-3d.com
const PRODUCTS = [
  { name: "Fidget Knife", nameAr: "سكين فيدجت", price: "$2.3", oldPrice: "$2.5", link: "https://nqsh-3d.com/products/k94qgj", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/su5dsfgsb66pybszflom", has3D: false },
  { name: "Mic Holder", nameAr: "حامل مايك", price: "$6", oldPrice: null, link: "https://nqsh-3d.com/products/k3k464", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/stqp9kw4lvedorgykxhk", has3D: false },
  { name: "Benchy Ship", nameAr: "سفينة Benchy", price: "$1.2", oldPrice: null, link: "https://nqsh-3d.com/products/zvzh66", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/rd3uify2xuk1y1en8ilq", has3D: false },
  { name: "Engineer Helmet", nameAr: "خوذة المهندس (ميدالية)", price: "$1", oldPrice: "$1.5", link: "https://nqsh-3d.com/products/4iqnnc", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/bng8uquc0pctcijvindx", has3D: false },
  { name: "Zen Incense", nameAr: "Zen (قاعدة بخور)", price: "$1.5", oldPrice: "$2", link: "https://nqsh-3d.com/products/1novli", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/x92wjae7dq3ntxblgmvq", has3D: false },
  { name: "Tidy Cable Clips", nameAr: "Tidy (منظم كبلات) 6 قطع", price: "$2.1", oldPrice: "$2.5", link: "https://nqsh-3d.com/products/rbvjc9", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/wtigu9b75h1b9rnfhnfb", has3D: false },
  { name: "Orbit Headphone Stand", nameAr: "حامل السماعات Orbit", price: "$3.5", oldPrice: "$4", link: "https://nqsh-3d.com/products/i3vmje", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/rz9llx59hlopmxrelwtk", has3D: false },
  { name: "SideKick Phone Mount", nameAr: "حامل الهاتف SideKick", price: "$3", oldPrice: "$3.8", link: "https://nqsh-3d.com/products/9b613h", image: "https://res.cloudinary.com/dnvayjlqu/image/upload/f_auto,q_auto,dpr_auto,c_fill,g_auto,w_400/nqsh/amzcgk1wxt8exabxmzus", has3D: false },
];

type FileType = "glb" | "gltf" | "stl";

export default function Home() {
  const { t, lang, dir } = useLanguage();
  const [modelUrl, setModelUrl] = useState(DEMO_MODEL);
  const [modelName, setModelName] = useState("Demo Model");
  const [fileType, setFileType] = useState<FileType>("glb");
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("500px");
  const [embedAutoRotate, setEmbedAutoRotate] = useState(true);
  const [embedShowAR, setEmbedShowAR] = useState(true);
  const [embedBgColor, setEmbedBgColor] = useState("#f5f0eb");
  const [stlColor, setStlColor] = useState("#0a1628");
  const [stlWireframe, setStlWireframe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"viewer" | "embed" | "settings">("viewer");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerSectionRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".glb", ".gltf", ".stl"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error(t("uploadError"), { description: t("uploadErrorDesc") });
      return;
    }

    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setModelName(file.name.replace(/\.[^/.]+$/, ""));
    setFileType(ext.replace(".", "") as FileType);
    setActiveTab("viewer");
    toast.success(t("uploadSuccess"), { description: file.name });
  }, [t]);

  const handleUrlInput = useCallback((url: string) => {
    if (!url) return;
    const lower = url.toLowerCase();
    if (lower.includes(".glb") || lower.includes(".gltf") || lower.includes(".stl")) {
      setModelUrl(url);
      setModelName(lang === "ar" ? "نموذج خارجي" : "External Model");
      if (lower.includes(".stl")) setFileType("stl");
      else setFileType("glb");
      setActiveTab("viewer");
      toast.success(t("urlSuccess"));
    } else {
      toast.error(t("urlError"), { description: t("urlErrorDesc") });
    }
  }, [t, lang]);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const embedCode = `<iframe
  src="${currentOrigin}/embed?model=${encodeURIComponent(modelUrl)}&autoRotate=${embedAutoRotate}&ar=${embedShowAR}&bg=${encodeURIComponent(embedBgColor)}&type=${fileType}"
  width="${embedWidth}"
  height="${embedHeight}"
  frameborder="0"
  allow="autoplay; fullscreen; xr-spatial-tracking"
  allowfullscreen
  style="border: none; border-radius: 12px; overflow: hidden;"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success(t("embedCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToViewer = () => {
    viewerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isSTL = fileType === "stl";
  const isRTL = dir === "rtl";

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      {/* Language toggle — fixed position */}
      <LanguageToggle />

      {/* ===== HERO SECTION — with Antigravity effect ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Antigravity floating elements — ONLY in hero */}
        <AntigravityEffect density={1.2} />

        {/* Navy gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/[0.03] via-transparent to-background z-[1]" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {/* Logo — BIGGER: matches heading size */}
            <div className="flex items-center justify-center mb-6">
              <img
                src={LOGO_DARK}
                alt="نقش"
                className="h-24 md:h-32 lg:h-36 object-contain"
              />
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-navy mb-6 leading-tight" dir="ltr">
              3D Viewer
            </h1>

            <p className={`${isRTL ? "font-arabic" : "font-body"} text-lg md:text-xl text-navy/70 mb-4 leading-relaxed max-w-xl mx-auto`}>
              {t("heroSubtitle")}
            </p>
            <p className={`${isRTL ? "font-arabic" : "font-body"} text-sm text-navy/50 mb-10 max-w-md mx-auto`}>
              {t("heroDesc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={scrollToViewer}
                className="btn-hover bg-navy text-cream hover:bg-navy-light rounded-full px-8 py-6 text-base shadow-lg"
              >
                <Eye className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("tryViewer")}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="btn-hover rounded-full px-8 py-6 text-base border-navy/20 hover:bg-navy/5 text-navy"
              >
                <Upload className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("uploadModel")}
              </Button>
            </div>

            {/* Supported formats badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-body text-navy/40">
              <span>{t("supports")}</span>
              <span className="px-2 py-0.5 rounded bg-navy/5 text-navy/60">.GLB</span>
              <span className="px-2 py-0.5 rounded bg-navy/5 text-navy/60">.GLTF</span>
              <span className="px-2 py-0.5 rounded bg-beige-dark/20 text-beige-dark font-semibold">.STL</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-navy/30" />
        </motion.div>
      </section>

      {/* ===== MAIN VIEWER SECTION — NO antigravity here ===== */}
      <section ref={viewerSectionRef} className="py-16 md:py-24 relative z-10">
        <div className="container max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { id: "viewer" as const, icon: <Box className="w-4 h-4" />, label: t("tabViewer") },
              { id: "settings" as const, icon: <Settings2 className="w-4 h-4" />, label: t("tabSettings") },
              { id: "embed" as const, icon: <Code2 className="w-4 h-4" />, label: t("tabEmbed") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-hover flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-navy text-cream shadow-md"
                    : "bg-beige/30 text-navy/60 hover:bg-beige/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "viewer" && (
              <motion.div key="viewer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="relative">
                  {/* Model name label */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-beige-dark" />
                      <h2 className="text-sm font-medium text-navy">{modelName}</h2>
                      {isSTL && <span className="px-2 py-0.5 rounded-full bg-beige/50 text-beige-dark text-[10px] font-bold">STL</span>}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-hover flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-beige/30 hover:bg-beige/50 text-navy/60 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      {t("changeModel")}
                    </button>
                  </div>

                  {/* The 3D Viewer */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-navy/10 border border-navy/10" style={{ aspectRatio: "16/10" }}>
                    {isSTL ? (
                      <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-cream"><div className="w-10 h-10 border-2 border-navy/20 border-t-navy rounded-full animate-spin" /></div>}>
                        <STLViewer
                          key={modelUrl}
                          src={modelUrl}
                          alt={modelName}
                          autoRotate={true}
                          showControls={true}
                          backgroundColor="#f5f0eb"
                          modelColor={stlColor}
                          wireframe={stlWireframe}
                        />
                      </Suspense>
                    ) : (
                      <ModelViewer
                        src={modelUrl}
                        alt={modelName}
                        autoRotate={true}
                        showControls={true}
                        showAR={true}
                        backgroundColor="#f5f0eb"
                        shadowIntensity={0.8}
                        exposure={1.0}
                      />
                    )}
                  </div>

                  {/* Upload area for URL */}
                  <div className="mt-6 p-4 rounded-xl bg-beige/20 border border-navy/8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 text-navy/50" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-navy/50 mb-1">
                          {t("enterUrl")}
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/model.glb"
                          className="w-full bg-white border border-navy/10 rounded-lg px-3 py-2 text-sm font-body placeholder:text-navy/25 focus:outline-none focus:ring-2 focus:ring-navy/15 focus:border-navy/20 transition-all"
                          dir="ltr"
                          onKeyDown={(e) => { if (e.key === "Enter") handleUrlInput((e.target as HTMLInputElement).value); }}
                          onBlur={(e) => { if (e.target.value) handleUrlInput(e.target.value); }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Background Color */}
                  <SettingsCard icon={<Palette className="w-5 h-5" />} title={t("bgColor")}>
                    <div className="flex items-center gap-2">
                      <input type="color" value={embedBgColor} onChange={(e) => setEmbedBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-navy/10 cursor-pointer" />
                      <input type="text" value={embedBgColor} onChange={(e) => setEmbedBgColor(e.target.value)} className="flex-1 bg-white border border-navy/10 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-navy/15" dir="ltr" />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {["#f5f0eb", "#ffffff", "#0a1628", "#1a1a2e", "#f0e6d3", "#e8e0d4"].map((c) => (
                        <button key={c} onClick={() => setEmbedBgColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${embedBgColor === c ? "border-navy ring-2 ring-navy/20" : "border-navy/10"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </SettingsCard>

                  {/* Auto Rotate */}
                  <SettingsCard icon={<RotateCcw className="w-5 h-5" />} title={t("autoRotate")}>
                    <ToggleSwitch checked={embedAutoRotate} onChange={setEmbedAutoRotate} labelOn={t("enabled")} labelOff={t("disabled")} />
                  </SettingsCard>

                  {/* AR */}
                  <SettingsCard icon={<Cuboid className="w-5 h-5" />} title={t("arMode")}>
                    <ToggleSwitch checked={embedShowAR} onChange={setEmbedShowAR} labelOn={t("enabled")} labelOff={t("disabled")} />
                    <p className="text-[10px] text-navy/40 mt-2">{t("arMobileOnly")}</p>
                  </SettingsCard>

                  {/* STL Color */}
                  <SettingsCard icon={<Layers className="w-5 h-5" />} title={t("modelColor")}>
                    <div className="flex items-center gap-2">
                      <input type="color" value={stlColor} onChange={(e) => setStlColor(e.target.value)} className="w-10 h-10 rounded-lg border border-navy/10 cursor-pointer" />
                      <input type="text" value={stlColor} onChange={(e) => setStlColor(e.target.value)} className="flex-1 bg-white border border-navy/10 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-navy/15" dir="ltr" />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {["#0a1628", "#d4c4b0", "#4a90d9", "#e74c3c", "#2ecc71", "#f39c12"].map((c) => (
                        <button key={c} onClick={() => setStlColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${stlColor === c ? "border-navy ring-2 ring-navy/20" : "border-navy/10"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </SettingsCard>

                  {/* Wireframe */}
                  <SettingsCard icon={<Grid3x3 className="w-5 h-5" />} title={t("wireframe")}>
                    <ToggleSwitch checked={stlWireframe} onChange={setStlWireframe} labelOn={t("enabled")} labelOff={t("disabled")} />
                  </SettingsCard>

                  {/* Exposure */}
                  <SettingsCard icon={<Sun className="w-5 h-5" />} title={t("lighting")}>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full accent-navy"
                    />
                    <p className="text-[10px] text-navy/40 mt-1">{t("lightingDesc")}</p>
                  </SettingsCard>
                </div>
              </motion.div>
            )}

            {activeTab === "embed" && (
              <motion.div key="embed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Size Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Ruler className="w-5 h-5 text-beige-dark" />
                      <h3 className="text-base font-semibold text-navy">{t("embedSettings")}</h3>
                    </div>

                    <div className="p-4 rounded-xl bg-beige/20 border border-navy/8 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-navy/40" />
                        <span className="text-sm font-medium text-navy">{t("dimensions")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-navy/50 mb-1">{t("width")}</label>
                          <input type="text" value={embedWidth} onChange={(e) => setEmbedWidth(e.target.value)} className="w-full bg-white border border-navy/10 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-navy/15" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-xs text-navy/50 mb-1">{t("height")}</label>
                          <input type="text" value={embedHeight} onChange={(e) => setEmbedHeight(e.target.value)} className="w-full bg-white border border-navy/10 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-navy/15" dir="ltr" />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-xl bg-beige/20 border border-navy/8">
                      <p className="text-xs text-navy/50 mb-3">{t("embedPreview")}</p>
                      <div className="rounded-lg overflow-hidden border border-navy/10" style={{ height: "250px" }}>
                        {isSTL ? (
                          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full animate-spin" /></div>}>
                            <STLViewer key={`embed-${modelUrl}`} src={modelUrl} alt={modelName} autoRotate={embedAutoRotate} showControls={true} backgroundColor={embedBgColor} modelColor={stlColor} wireframe={stlWireframe} embedded={true} />
                          </Suspense>
                        ) : (
                          <ModelViewer src={modelUrl} alt={modelName} autoRotate={embedAutoRotate} showControls={true} showAR={embedShowAR} backgroundColor={embedBgColor} embedded={true} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-beige-dark" />
                        <h3 className="text-base font-semibold text-navy">{t("embedCodeTitle")}</h3>
                      </div>
                      <Button onClick={copyEmbedCode} variant="outline" className="btn-hover rounded-full text-xs gap-1.5 border-navy/15 text-navy/70">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? t("copied") : t("copyCode")}
                      </Button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-navy/10 bg-navy">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-navy-dark border-b border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="text-xs text-beige/30 font-body ml-3">embed-code.html</span>
                      </div>
                      <pre className="p-4 text-sm font-mono text-beige/80 overflow-x-auto leading-relaxed" dir="ltr">
                        <code>{embedCode}</code>
                      </pre>
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-beige/20 border border-navy/8">
                      <Lightbulb className="w-4 h-4 text-beige-dark shrink-0 mt-0.5" />
                      <p className="text-xs text-navy/50 leading-relaxed">
                        {t("embedTip")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ===== PRODUCTS SHOWCASE — NO antigravity here ===== */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-beige-dark" />
              <span className="text-sm font-medium text-beige-dark">{t("fromStore")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
              {t("productsTitle")}
            </h2>
            <p className="text-sm text-navy/50 max-w-lg mx-auto">
              {t("productsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {PRODUCTS.map((product) => (
              <a
                key={product.link}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group relative rounded-2xl overflow-hidden bg-white border border-navy/8 block"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-cream">
                  <img
                    src={product.image}
                    alt={lang === "ar" ? product.nameAr : product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* 3D badge — placeholder for future */}
                  <div className="absolute top-2 right-2">
                    {product.has3D ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-navy text-cream text-[10px] font-bold shadow-md">
                        <Cuboid className="w-3 h-3" />
                        {t("view3D")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-beige/80 text-navy/60 text-[10px] backdrop-blur-sm">
                        <Cuboid className="w-3 h-3" />
                        {t("soon3D")}
                      </span>
                    )}
                  </div>
                  {/* Sale badge */}
                  {product.oldPrice && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{t("sale")}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-xs md:text-sm font-semibold text-navy mb-1 line-clamp-1">
                    {lang === "ar" ? product.nameAr : product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm font-bold text-navy" dir="ltr">{product.price}</span>
                    {product.oldPrice && (
                      <span className="font-body text-xs text-navy/40 line-through" dir="ltr">{product.oldPrice}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Visit store CTA */}
          <div className="text-center mt-10">
            <a
              href="https://nqsh-3d.com/products"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="btn-hover bg-navy text-cream hover:bg-navy-light rounded-full px-8 py-5 text-sm shadow-lg">
                <ShoppingBag className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("visitStore")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — with Antigravity effect ===== */}
      <section className="py-16 md:py-24 bg-navy/[0.03] relative z-10 overflow-hidden">
        {/* Antigravity floating elements — also in How It Works */}
        <AntigravityEffect density={0.7} />

        <div className="container max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-4" dir="ltr">
              {t("howItWorks")}
            </h2>
            <p className="text-navy/60 text-base">
              {t("howItWorksDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t("step1Title"), description: t("step1Desc"), icon: <Box className="w-6 h-6" /> },
              { step: "02", title: t("step2Title"), description: t("step2Desc"), icon: <Settings2 className="w-6 h-6" /> },
              { step: "03", title: t("step3Title"), description: t("step3Desc"), icon: <Code2 className="w-6 h-6" /> },
            ].map((item) => (
              <div key={item.step} className="card-hover relative p-6 rounded-2xl bg-white border border-navy/8 shadow-sm">
                <span className="absolute top-4 left-4 font-display text-5xl font-bold text-beige/60">{item.step}</span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-navy/8 flex items-center justify-center text-navy mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-navy/50 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED FORMATS ===== */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">{t("formatsTitle")}</h2>
            <p className="text-navy/50 text-sm">{t("formatsDesc")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { format: "GLB", desc: "Binary glTF", rec: true },
              { format: "GLTF", desc: "GL Transmission", rec: true },
              { format: "STL", desc: "Stereolithography", rec: true },
              { format: "USDZ", desc: "Apple AR", rec: false },
              { format: "OBJ", desc: "Wavefront", rec: false },
            ].map((item) => (
              <div key={item.format} className={`card-hover relative p-5 rounded-xl border text-center ${item.rec ? "bg-navy/5 border-navy/15" : "bg-beige/10 border-navy/8"}`}>
                {item.rec && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-navy text-cream text-[10px] font-bold">{t("recommended")}</span>
                )}
                <p className="font-body text-xl font-bold text-navy mb-1" dir="ltr">.{item.format}</p>
                <p className="font-body text-xs text-navy/40" dir="ltr">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 border-t border-navy/8 relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto text-center">
          <img src={LOGO_DARK} alt="نقش" className="h-14 mx-auto mb-3 object-contain" />
          <p className="text-xs text-navy/40 mb-3">{t("footerTagline")}</p>
          <div className="flex items-center justify-center gap-4">
            <a href="https://nqsh-3d.com" target="_blank" rel="noopener noreferrer" className="btn-hover inline-flex items-center gap-1 text-xs text-navy/50 hover:text-navy transition-colors px-3 py-1.5 rounded-full bg-beige/20">
              <ExternalLink className="w-3 h-3" />
              {t("visitStoreShort")}
            </a>
            <a href="https://instagram.com/nqsh_3d_printing" target="_blank" rel="noopener noreferrer" className="btn-hover inline-flex items-center gap-1 text-xs text-navy/50 hover:text-navy transition-colors px-3 py-1.5 rounded-full bg-beige/20">
              <ExternalLink className="w-3 h-3" />
              {t("instagram")}
            </a>
          </div>
        </div>
      </footer>

      {/* Hidden file input — accepts STL too */}
      <input ref={fileInputRef} type="file" accept=".glb,.gltf,.stl" className="hidden" onChange={handleFileUpload} />
    </div>
  );
}

/* ===== Reusable Sub-components ===== */

function SettingsCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-hover p-5 rounded-xl bg-white border border-navy/8 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-beige-dark">{icon}</div>
        <h4 className="text-sm font-semibold text-navy">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, labelOn, labelOff }: { checked: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-navy/60">{checked ? labelOn : labelOff}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? "bg-navy" : "bg-beige"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "left-0.5" : "left-[22px]"}`} />
      </button>
    </div>
  );
}
