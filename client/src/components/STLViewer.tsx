/**
 * STLViewer — Three.js-based viewer for .stl files
 * Since model-viewer doesn't support STL natively, we use Three.js
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Sun,
  Moon,
  Grid3x3,
  Palette,
} from "lucide-react";

interface STLViewerProps {
  src: string;
  alt?: string;
  backgroundColor?: string;
  modelColor?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
  showControls?: boolean;
  embedded?: boolean;
}

export default function STLViewer({
  src,
  alt = "3D STL Model",
  backgroundColor = "#f5f0eb",
  modelColor = "#0a1628",
  wireframe = false,
  autoRotate = true,
  showControls = true,
  embedded = false,
}: STLViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [isWireframe, setIsWireframe] = useState(wireframe);
  const [currentColor, setCurrentColor] = useState(modelColor);
  const [showControlBar, setShowControlBar] = useState(false);
  const controlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;
    controls.enablePan = true;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xd4c4b0, 0.4);
    dirLight2.position.set(-3, 4, -3);
    scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    // Ground plane shadow
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load STL
    const loader = new STLLoader();
    loader.load(
      src,
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.center();

        // Scale to fit
        const bbox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position as THREE.BufferAttribute);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;

        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(modelColor),
          metalness: 0.1,
          roughness: 0.5,
          clearcoat: 0.3,
          clearcoatRoughness: 0.4,
          wireframe: wireframe,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshRef.current = mesh;
        scene.add(mesh);

        setIsLoaded(true);
        setLoadProgress(100);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error("Error loading STL:", error);
      }
    );

    // Animation loop
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  // Update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Update wireframe
  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshPhysicalMaterial).wireframe = isWireframe;
    }
  }, [isWireframe]);

  // Update model color
  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshPhysicalMaterial).color.set(currentColor);
    }
  }, [currentColor]);

  // Update background
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isDarkBg ? "#1a1a2e" : backgroundColor);
    }
  }, [isDarkBg, backgroundColor]);

  const handleMouseMove = () => {
    setShowControlBar(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => setShowControlBar(false), 3000);
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.85);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.15);
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      controlsRef.current.reset();
    }
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

  const colorPresets = ["#0a1628", "#d4c4b0", "#c8b8a4", "#4a90d9", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        controlTimeoutRef.current = setTimeout(() => setShowControlBar(false), 1000);
      }}
      onTouchStart={() => setShowControlBar(true)}
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4" style={{ backgroundColor }}>
          <div className="w-12 h-12 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          <p className="text-sm font-body text-navy/60">{loadProgress}%</p>
        </div>
      )}

      {/* Three.js mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating control bar */}
      {showControls && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
            showControlBar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <div
            className="flex items-center gap-1 px-3 py-2 rounded-full border shadow-lg"
            style={{
              backgroundColor: isDarkBg ? "rgba(30,30,50,0.85)" : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              borderColor: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(10,22,40,0.1)",
            }}
          >
            <STLControlButton icon={isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} onClick={() => setIsRotating(!isRotating)} tooltip={isRotating ? "إيقاف" : "تشغيل"} isDark={isDarkBg} />
            <Divider isDark={isDarkBg} />
            <STLControlButton icon={<ZoomIn className="w-4 h-4" />} onClick={handleZoomIn} tooltip="تكبير" isDark={isDarkBg} />
            <STLControlButton icon={<ZoomOut className="w-4 h-4" />} onClick={handleZoomOut} tooltip="تصغير" isDark={isDarkBg} />
            <STLControlButton icon={<RotateCcw className="w-4 h-4" />} onClick={handleResetCamera} tooltip="إعادة ضبط" isDark={isDarkBg} />
            <Divider isDark={isDarkBg} />
            <STLControlButton icon={<Grid3x3 className="w-4 h-4" />} onClick={() => setIsWireframe(!isWireframe)} tooltip="إطار سلكي" isDark={isDarkBg} active={isWireframe} />
            <STLControlButton icon={isDarkBg ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} onClick={() => setIsDarkBg(!isDarkBg)} tooltip="تبديل الخلفية" isDark={isDarkBg} />
            <STLControlButton icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} onClick={toggleFullscreen} tooltip="ملء الشاشة" isDark={isDarkBg} />
            <Divider isDark={isDarkBg} />
            {/* Color picker */}
            <div className="relative group">
              <STLControlButton icon={<Palette className="w-4 h-4" />} onClick={() => {}} tooltip="لون النموذج" isDark={isDarkBg} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-wrap gap-1 p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-border/50 w-[140px]">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${currentColor === c ? "border-navy ring-2 ring-navy/30" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer border-0"
                  title="لون مخصص"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interaction hint */}
      {isLoaded && !embedded && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${showControlBar ? "opacity-0" : "opacity-60"}`}>
          <p className="text-xs font-arabic px-3 py-1.5 rounded-full" style={{ backgroundColor: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(10,22,40,0.06)", color: isDarkBg ? "rgba(255,255,255,0.6)" : "rgba(10,22,40,0.5)" }}>
            اسحب للتدوير • اضغط للتكبير
          </p>
        </div>
      )}
    </div>
  );
}

function STLControlButton({ icon, onClick, tooltip, isDark, active = false }: { icon: React.ReactNode; onClick: () => void; tooltip: string; isDark: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-full transition-all duration-200 ${active ? "bg-navy/15" : isDark ? "hover:bg-white/10" : "hover:bg-navy/8"}`}
      style={{ color: active ? "#0a1628" : isDark ? "rgba(255,255,255,0.7)" : "rgba(10,22,40,0.55)" }}
    >
      {icon}
    </button>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className="w-px h-5 mx-1" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(10,22,40,0.1)" }} />;
}
