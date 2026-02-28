/**
 * Home Page — NQSH 3D Viewer
 * Design: "Floating Gallery" — Minimalist Exhibition Space
 * - Full-viewport centered stage for the 3D model
 * - Gallery-like white space with soft spotlight
 * - Frosted glass floating controls
 * - Elegant typography: Playfair Display + DM Sans + Noto Kufi Arabic
 */

import { useState, useRef, useCallback, useEffect } from "react";
import ModelViewer from "@/components/ModelViewer";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028291896/WhHEofVoGfMfAZdiUP5fWK/hero-bg-crpjmXpDPGk3XxWLfPhmYt.webp";
const EMBED_PREVIEW = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028291896/WhHEofVoGfMfAZdiUP5fWK/embed-preview-f5mLHAUGvudsPeceW2BgTB.webp";

// Demo GLB model (astronaut from Google)
const DEMO_MODEL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

export default function Home() {
  const [modelUrl, setModelUrl] = useState(DEMO_MODEL);
  const [modelName, setModelName] = useState("نموذج تجريبي");
  const [hasCustomModel, setHasCustomModel] = useState(false);
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("500px");
  const [embedAutoRotate, setEmbedAutoRotate] = useState(true);
  const [embedShowAR, setEmbedShowAR] = useState(true);
  const [embedBgColor, setEmbedBgColor] = useState("#fafaf9");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"viewer" | "embed">("viewer");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerSectionRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validExtensions = [".glb", ".gltf"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        toast.error("صيغة غير مدعومة", {
          description: "يرجى رفع ملف بصيغة GLB أو GLTF",
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setModelName(file.name.replace(/\.[^/.]+$/, ""));
      setHasCustomModel(true);
      setActiveTab("viewer");
      toast.success("تم تحميل النموذج بنجاح", {
        description: file.name,
      });
    },
    []
  );

  const handleUrlInput = useCallback((url: string) => {
    if (url && (url.endsWith(".glb") || url.endsWith(".gltf") || url.includes("glb") || url.includes("gltf"))) {
      setModelUrl(url);
      setModelName("نموذج خارجي");
      setHasCustomModel(true);
      setActiveTab("viewer");
      toast.success("تم تحميل النموذج من الرابط");
    }
  }, []);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const embedCode = `<iframe
  src="${currentOrigin}/embed?model=${encodeURIComponent(modelUrl)}&autoRotate=${embedAutoRotate}&ar=${embedShowAR}&bg=${encodeURIComponent(embedBgColor)}"
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
    toast.success("تم نسخ كود التضمين");
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToViewer = () => {
    viewerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/80" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-gold" />
              </div>
              <span className="font-arabic text-sm font-medium text-gold-dark tracking-wide">
                نقش | NQSH
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight" dir="ltr">
              3D Viewer
            </h1>

            <p className="font-arabic text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed max-w-xl mx-auto">
              عارض ثلاثي الأبعاد تفاعلي لمنتجاتك
            </p>
            <p className="font-arabic text-sm text-muted-foreground/70 mb-10 max-w-md mx-auto">
              اعرض منتجاتك المطبوعة بتقنية ثلاثية الأبعاد بشكل تفاعلي — دوران 360° وتكبير وواقع معزز
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={scrollToViewer}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-base font-arabic shadow-lg"
              >
                <Eye className="w-4 h-4 ml-2" />
                جرّب العارض
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-8 py-6 text-base font-arabic border-foreground/20 hover:bg-foreground/5"
              >
                <Upload className="w-4 h-4 ml-2" />
                ارفع نموذجك
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground/40" />
        </motion.div>
      </section>

      {/* Main Viewer Section */}
      <section ref={viewerSectionRef} className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTab("viewer")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-arabic transition-all duration-300 ${
                activeTab === "viewer"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Box className="w-4 h-4" />
              العارض
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-arabic transition-all duration-300 ${
                activeTab === "embed"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Code2 className="w-4 h-4" />
              كود التضمين
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "viewer" ? (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Viewer Card */}
                <div className="relative">
                  {/* Model name label */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <h2 className="font-arabic text-sm font-medium text-foreground">
                        {modelName}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-arabic bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        تغيير النموذج
                      </button>
                    </div>
                  </div>

                  {/* The 3D Viewer */}
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-border/50"
                    style={{ aspectRatio: "16/10" }}
                  >
                    <ModelViewer
                      src={modelUrl}
                      alt={modelName}
                      autoRotate={true}
                      showControls={true}
                      showAR={true}
                      backgroundColor="#fafaf9"
                      shadowIntensity={0.8}
                      exposure={1.0}
                    />
                  </div>

                  {/* Upload area for URL */}
                  <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-arabic text-muted-foreground mb-1">
                          أو أدخل رابط النموذج (GLB/GLTF)
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/model.glb"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-body placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                          dir="ltr"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUrlInput((e.target as HTMLInputElement).value);
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value) handleUrlInput(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="embed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Settings Panel */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings2 className="w-5 h-5 text-gold" />
                      <h3 className="font-arabic text-base font-semibold text-foreground">
                        إعدادات التضمين
                      </h3>
                    </div>

                    {/* Size settings */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-arabic font-medium">الأبعاد</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-arabic text-muted-foreground mb-1">
                            العرض
                          </label>
                          <input
                            type="text"
                            value={embedWidth}
                            onChange={(e) => setEmbedWidth(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-arabic text-muted-foreground mb-1">
                            الارتفاع
                          </label>
                          <input
                            type="text"
                            value={embedHeight}
                            onChange={(e) => setEmbedHeight(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Appearance settings */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-arabic font-medium">المظهر</span>
                      </div>

                      <div>
                        <label className="block text-xs font-arabic text-muted-foreground mb-2">
                          لون الخلفية
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={embedBgColor}
                            onChange={(e) => setEmbedBgColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={embedBgColor}
                            onChange={(e) => setEmbedBgColor(e.target.value)}
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-arabic">دوران تلقائي</span>
                        <button
                          onClick={() => setEmbedAutoRotate(!embedAutoRotate)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                            embedAutoRotate ? "bg-gold" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              embedAutoRotate ? "left-0.5" : "left-[22px]"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-arabic">واقع معزز (AR)</span>
                        <button
                          onClick={() => setEmbedShowAR(!embedShowAR)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                            embedShowAR ? "bg-gold" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              embedShowAR ? "left-0.5" : "left-[22px]"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-gold" />
                        <h3 className="font-arabic text-base font-semibold text-foreground">
                          كود التضمين
                        </h3>
                      </div>
                      <Button
                        onClick={copyEmbedCode}
                        variant="outline"
                        className="rounded-full text-xs font-arabic gap-1.5"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "تم النسخ" : "نسخ الكود"}
                      </Button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[#1e1e2e]">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#181825] border-b border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="text-xs text-white/30 font-body mr-3">
                          embed-code.html
                        </span>
                      </div>
                      <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto leading-relaxed" dir="ltr">
                        <code>{embedCode}</code>
                      </pre>
                    </div>

                    {/* Preview of embedded viewer */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs font-arabic text-muted-foreground mb-3">
                        معاينة التضمين
                      </p>
                      <div
                        className="rounded-lg overflow-hidden border border-border/50"
                        style={{ height: "250px" }}
                      >
                        <ModelViewer
                          src={modelUrl}
                          alt={modelName}
                          autoRotate={embedAutoRotate}
                          showControls={true}
                          showAR={embedShowAR}
                          backgroundColor={embedBgColor}
                          embedded={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4" dir="ltr">
              How It Works
            </h2>
            <p className="font-arabic text-muted-foreground text-base">
              ثلاث خطوات بسيطة لعرض منتجاتك بشكل ثلاثي الأبعاد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "جهّز النموذج",
                description:
                  "صدّر نموذجك ثلاثي الأبعاد بصيغة GLB أو GLTF من أي برنامج تصميم",
                icon: <Box className="w-6 h-6" />,
              },
              {
                step: "02",
                title: "خصّص العارض",
                description:
                  "اختر الإعدادات المناسبة — الخلفية والدوران والأبعاد",
                icon: <Settings2 className="w-6 h-6" />,
              },
              {
                step: "03",
                title: "ضمّن في موقعك",
                description:
                  "انسخ كود التضمين والصقه في صفحة المنتج على موقعك",
                icon: <Code2 className="w-6 h-6" />,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <span className="absolute top-4 left-4 font-display text-5xl font-bold text-muted/60">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-arabic text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="font-arabic text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-arabic text-2xl md:text-3xl font-bold text-foreground mb-4">
              الصيغ المدعومة
            </h2>
            <p className="font-arabic text-muted-foreground text-sm">
              يدعم العارض أشهر صيغ النماذج ثلاثية الأبعاد
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { format: "GLB", desc: "Binary glTF", recommended: true },
              { format: "GLTF", desc: "GL Transmission", recommended: true },
              { format: "USDZ", desc: "Apple AR", recommended: false },
              { format: "OBJ", desc: "Wavefront", recommended: false },
            ].map((item) => (
              <div
                key={item.format}
                className={`relative p-5 rounded-xl border text-center transition-all duration-300 hover:shadow-md ${
                  item.recommended
                    ? "bg-gold/5 border-gold/20"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                {item.recommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gold text-white text-[10px] font-arabic">
                    موصى به
                  </span>
                )}
                <p className="font-body text-xl font-bold text-foreground mb-1" dir="ltr">
                  .{item.format}
                </p>
                <p className="font-body text-xs text-muted-foreground" dir="ltr">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Box className="w-4 h-4 text-gold" />
            <span className="font-arabic text-sm font-medium text-foreground">
              نقش | NQSH
            </span>
          </div>
          <p className="font-arabic text-xs text-muted-foreground">
            طبع بحب بأيدي سورية
          </p>
          <a
            href="https://nqsh-3d.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-arabic text-gold hover:text-gold-dark transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            زيارة المتجر
          </a>
        </div>
      </footer>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
