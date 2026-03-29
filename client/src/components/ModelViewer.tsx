/**
 * ModelViewer Component — Navy/Beige Theme
 * 
 * FINAL APPROACH: Render model-viewer WITHOUT src in JSX.
 * Use useEffect to directly set src on the DOM element after mount.
 * This completely bypasses React's prop system and avoids Lit update conflicts.
 */

import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Box,
  Smartphone,
  Play,
  Pause,
  Sun,
  Moon,
} from "lucide-react";

interface ModelViewerProps {
  src: string;
  alt?: string;
  poster?: string;
  autoRotate?: boolean;
  showControls?: boolean;
  showAR?: boolean;
  backgroundColor?: string;
  shadowIntensity?: number;
  exposure?: number;
  embedded?: boolean;
}

export default function ModelViewer({
  src,
  alt = "3D Model",
  poster,
  autoRotate = true,
  showControls = true,
  showAR = true,
  backgroundColor = "#f5f0eb",
  shadowIntensity = 0.8,
  exposure = 1.0,
  embedded = false,
}: ModelViewerProps) {
  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showControlBar, setShowControlBar] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const controlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up event listeners on mount
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let hasLoaded = false;

    const markLoaded = () => {
      if (hasLoaded) return;
      hasLoaded = true;
      console.log("[ModelViewer] Model loaded");
      setIsLoaded(true);
      setLoadProgress(100);
    };

    const handleLoad = () => {
      console.log("[ModelViewer] load event");
      markLoaded();
    };

    const handleProgress = (e: any) => {
      const progress = e.detail?.totalProgress ?? 0;
      const pct = Math.round(progress * 100);
      setLoadProgress(pct);
      if (pct >= 100) {
        setTimeout(markLoaded, 200);
      }
    };

    const handleError = (e: any) => {
      console.error("[ModelViewer] error:", e);
      markLoaded();
    };

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("progress", handleProgress);
    viewer.addEventListener("error", handleError);

    // Fallback: check if model is loaded by inspecting the element
    const checkLoaded = setInterval(() => {
      try {
        if (viewer.loaded || viewer.modelIsVisible) {
          markLoaded();
        }
      } catch {}
    }, 500);

    // Ultimate fallback
    const timeout = setTimeout(() => {
      console.log("[ModelViewer] fallback timeout");
      markLoaded();
    }, 15000);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("progress", handleProgress);
      viewer.removeEventListener("error", handleError);
      clearInterval(checkLoaded);
      clearTimeout(timeout);
    };
  }, []);

  // When src changes, directly set it on the DOM element
  // This bypasses React's JSX prop system and avoids Lit conflicts
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !src) return;

    console.log("[ModelViewer] Setting src:", src);
    setIsLoaded(false);
    setLoadProgress(0);

    // Directly set the src attribute on the web component
    // This is the key: we bypass React's prop system entirely
    viewer.src = src;
  }, [src]);

  const handleMouseMove = () => {
    setShowControlBar(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => setShowControlBar(false), 3000);
  };

  const handleMouseLeave = () => {
    controlTimeoutRef.current = setTimeout(() => setShowControlBar(false), 1000);
  };

  const handleZoomIn = () => {
    const v = viewerRef.current;
    if (v) { try { const fov = v.getFieldOfView(); v.fieldOfView = `${Math.max(10, fov - 5)}deg`; } catch {} }
  };

  const handleZoomOut = () => {
    const v = viewerRef.current;
    if (v) { try { const fov = v.getFieldOfView(); v.fieldOfView = `${Math.min(90, fov + 5)}deg`; } catch {} }
  };

  const handleResetCamera = () => {
    const v = viewerRef.current;
    if (v) { v.cameraOrbit = "auto auto auto"; v.cameraTarget = "auto auto auto"; v.fieldOfView = "auto"; }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const currentBg = isDarkBg ? "#0a1628" : backgroundColor;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden transition-all duration-500 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      style={{ backgroundColor: currentBg }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setShowControlBar(true)}
    >
      {/* Spotlight effect */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-500"
        style={{
          background: isDarkBg
            ? "radial-gradient(ellipse, rgba(212,196,176,0.15), transparent)"
            : "radial-gradient(ellipse, rgba(10,22,40,0.06), transparent)",
        }}
      />

      {/* Loading overlay */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 transition-opacity duration-700"
        style={{
          backgroundColor: currentBg,
          opacity: isLoaded ? 0 : 1,
          pointerEvents: isLoaded ? "none" : "auto",
        }}
      >
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-beige" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${loadProgress * 1.76} 176`} strokeLinecap="round" className="text-navy" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Box className="w-5 h-5 text-navy" />
          </div>
        </div>
        <p className="text-sm font-body text-navy/60">{loadProgress}%</p>
      </div>

      {/* model-viewer — NO src in JSX, set via useEffect instead */}
      <model-viewer
        ref={viewerRef}
        alt={alt}
        poster={poster}
        camera-controls
        touch-action="pan-y"
        {...(isRotating ? { "auto-rotate": "" } : {})}
        auto-rotate-delay="0"
        rotation-per-second="30deg"
        shadow-intensity={String(shadowIntensity)}
        shadow-softness="0.8"
        exposure={String(exposure)}
        interaction-prompt="auto"
        interaction-prompt-style="basic"
        camera-orbit="45deg 75deg auto"
        min-camera-orbit="auto auto auto"
        max-camera-orbit="auto auto auto"
        field-of-view="30deg"
        {...(showAR ? { ar: "", "ar-modes": "webxr scene-viewer quick-look", "ar-scale": "auto" } : {})}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* Floating control bar */}
      {showControls && (
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${showControlBar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
          <div
            className="flex items-center gap-1 px-3 py-2 rounded-full border shadow-lg"
            style={{
              backgroundColor: isDarkBg ? "rgba(10,22,40,0.9)" : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              borderColor: isDarkBg ? "rgba(212,196,176,0.15)" : "rgba(10,22,40,0.1)",
            }}
          >
            <ControlButton icon={isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} onClick={() => setIsRotating(!isRotating)} tooltip={isRotating ? "Pause" : "Play"} isDark={isDarkBg} />
            <ControlDivider isDark={isDarkBg} />
            <ControlButton icon={<ZoomIn className="w-4 h-4" />} onClick={handleZoomIn} tooltip="Zoom In" isDark={isDarkBg} />
            <ControlButton icon={<ZoomOut className="w-4 h-4" />} onClick={handleZoomOut} tooltip="Zoom Out" isDark={isDarkBg} />
            <ControlButton icon={<RotateCcw className="w-4 h-4" />} onClick={handleResetCamera} tooltip="Reset" isDark={isDarkBg} />
            <ControlDivider isDark={isDarkBg} />
            <ControlButton icon={isDarkBg ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} onClick={() => setIsDarkBg(!isDarkBg)} tooltip="Toggle BG" isDark={isDarkBg} />
            <ControlButton icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} onClick={toggleFullscreen} tooltip="Fullscreen" isDark={isDarkBg} />
            {showAR && (
              <>
                <ControlDivider isDark={isDarkBg} />
                <ControlButton
                  icon={<Smartphone className="w-4 h-4" />}
                  onClick={() => { const v = viewerRef.current; if (v?.activateAR) v.activateAR(); }}
                  tooltip="AR View"
                  isDark={isDarkBg}
                  accent
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Interaction hint */}
      {isLoaded && !embedded && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${showControlBar ? "opacity-0" : "opacity-60"}`}>
          <p className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: isDarkBg ? "rgba(212,196,176,0.1)" : "rgba(10,22,40,0.06)", color: isDarkBg ? "rgba(212,196,176,0.6)" : "rgba(10,22,40,0.5)" }}>
            Drag to rotate · Pinch to zoom
          </p>
        </div>
      )}

      {/* NQSH branding watermark for embedded mode */}
      {embedded && (
        <a
          href="https://nqsh-3d.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-100"
          style={{
            backgroundColor: isDarkBg ? "rgba(10,22,40,0.7)" : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            color: isDarkBg ? "rgba(212,196,176,0.7)" : "rgba(10,22,40,0.5)",
            opacity: 0.6,
          }}
        >
          <Box className="w-3 h-3" />
          نقش
        </a>
      )}
    </div>
  );
}

function ControlButton({ icon, onClick, tooltip, isDark, accent = false }: { icon: React.ReactNode; onClick: () => void; tooltip: string; isDark: boolean; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-full transition-all duration-200 ${accent ? "bg-beige/30 hover:bg-beige/50" : isDark ? "hover:bg-beige/10" : "hover:bg-navy/8"}`}
      style={{ color: accent ? "#d4c4b0" : isDark ? "rgba(212,196,176,0.7)" : "rgba(10,22,40,0.55)" }}
    >
      {icon}
    </button>
  );
}

function ControlDivider({ isDark }: { isDark: boolean }) {
  return <div className="w-px h-5 mx-1" style={{ backgroundColor: isDark ? "rgba(212,196,176,0.15)" : "rgba(10,22,40,0.1)" }} />;
}
