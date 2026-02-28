/**
 * Embed Page — Standalone embeddable 3D viewer
 * Design: "Floating Gallery" — Minimalist Exhibition Space
 * This page is designed to be loaded inside an iframe.
 * It reads configuration from URL query parameters.
 */

import { useEffect, useState } from "react";
import ModelViewer from "@/components/ModelViewer";

export default function Embed() {
  const [config, setConfig] = useState({
    model: "",
    autoRotate: true,
    ar: true,
    bg: "#fafaf9",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setConfig({
      model: params.get("model") || "",
      autoRotate: params.get("autoRotate") !== "false",
      ar: params.get("ar") !== "false",
      bg: params.get("bg") || "#fafaf9",
    });
  }, []);

  if (!config.model) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <p className="font-arabic text-sm text-muted-foreground">
            لم يتم تحديد نموذج ثلاثي الأبعاد
          </p>
          <p className="font-body text-xs text-muted-foreground/60 mt-2" dir="ltr">
            Add ?model=URL_TO_GLB to the URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <ModelViewer
        src={config.model}
        alt="3D Model"
        autoRotate={config.autoRotate}
        showControls={true}
        showAR={config.ar}
        backgroundColor={config.bg}
        embedded={true}
      />
    </div>
  );
}
