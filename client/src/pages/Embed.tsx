/**
 * Embed Page — Standalone embeddable 3D viewer
 * Theme: Navy (#0a1628) + Beige (#d4c4b0)
 * Supports both GLB/GLTF (model-viewer) and STL (Three.js)
 */

import { useEffect, useState, lazy, Suspense } from "react";
import ModelViewer from "@/components/ModelViewer";

const STLViewer = lazy(() => import("@/components/STLViewer"));

export default function Embed() {
  const [config, setConfig] = useState({
    model: "",
    autoRotate: true,
    ar: true,
    bg: "#f5f0eb",
    type: "glb" as "glb" | "gltf" | "stl",
    color: "#0a1628",
    wireframe: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelUrl = params.get("model") || "";
    const type = params.get("type") || (modelUrl.toLowerCase().includes(".stl") ? "stl" : "glb");
    
    setConfig({
      model: modelUrl,
      autoRotate: params.get("autoRotate") !== "false",
      ar: params.get("ar") !== "false",
      bg: params.get("bg") || "#f5f0eb",
      type: type as "glb" | "gltf" | "stl",
      color: params.get("color") || "#0a1628",
      wireframe: params.get("wireframe") === "true",
    });
  }, []);

  if (!config.model) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0eb" }}>
        <div className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-navy/8 flex items-center justify-center">
            <svg className="w-6 h-6 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="font-arabic text-sm text-navy/50">
            لم يتم تحديد نموذج ثلاثي الأبعاد
          </p>
          <p className="font-body text-xs text-navy/30 mt-2" dir="ltr">
            Add ?model=URL_TO_MODEL to the URL
          </p>
        </div>
      </div>
    );
  }

  const isSTL = config.type === "stl";

  return (
    <div className="w-full h-screen overflow-hidden">
      {isSTL ? (
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: config.bg }}>
            <div className="w-10 h-10 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          </div>
        }>
          <STLViewer
            src={config.model}
            alt="3D STL Model"
            autoRotate={config.autoRotate}
            showControls={true}
            backgroundColor={config.bg}
            modelColor={config.color}
            wireframe={config.wireframe}
            embedded={true}
          />
        </Suspense>
      ) : (
        <ModelViewer
          src={config.model}
          alt="3D Model"
          autoRotate={config.autoRotate}
          showControls={true}
          showAR={config.ar}
          backgroundColor={config.bg}
          embedded={true}
        />
      )}
    </div>
  );
}
