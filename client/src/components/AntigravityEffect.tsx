/**
 * AntigravityEffect — Google Antigravity-style floating elements
 * Scattered 3D-printing related icons/shapes that drift with parallax based on cursor position
 * Uses navy/beige brand colors
 * Only renders within its parent container (hero or How It Works)
 */

import { useEffect, useRef, useCallback } from "react";

interface FloatingElement {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  drift: { x: number; y: number };
  driftSpeed: { x: number; y: number };
  shape: "diamond" | "hexagon" | "cube" | "layers" | "dot" | "ring" | "cross" | "triangle";
  color: string;
  opacity: number;
  parallaxDepth: number; // 0.01 = far away, 0.08 = close
  scale: number;
  pulsePhase: number;
}

const PALETTE = [
  "rgba(10, 22, 40, 0.12)",
  "rgba(10, 22, 40, 0.08)",
  "rgba(10, 22, 40, 0.06)",
  "rgba(212, 196, 176, 0.25)",
  "rgba(212, 196, 176, 0.18)",
  "rgba(200, 184, 164, 0.15)",
  "rgba(10, 22, 40, 0.10)",
  "rgba(180, 165, 145, 0.12)",
];

export default function AntigravityEffect({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const elementsRef = useRef<FloatingElement[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initElements = useCallback((width: number, height: number) => {
    const shapes: FloatingElement["shape"][] = ["diamond", "hexagon", "cube", "layers", "dot", "ring", "cross", "triangle"];
    const count = Math.min(Math.floor(25 * density), Math.floor((width * height) / 25000));
    const elements: FloatingElement[] = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      elements.push({
        x, y,
        baseX: x,
        baseY: y,
        size: 6 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.003,
        drift: { x: 0, y: 0 },
        driftSpeed: { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.1 },
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        opacity: 0.3 + Math.random() * 0.6,
        parallaxDepth: 0.01 + Math.random() * 0.07,
        scale: 0.6 + Math.random() * 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return elements;
  }, [density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      elementsRef.current = initElements(rect.width, rect.height);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      // Check if mouse is within this section
      if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right) {
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
          active: true,
        };
      } else {
        mouseRef.current.active = false;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const drawShape = (el: FloatingElement) => {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.scale(el.scale, el.scale);
      ctx.globalAlpha = el.opacity;
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = 1.2;

      const s = el.size;

      switch (el.shape) {
        case "diamond":
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.6, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.6, 0);
          ctx.closePath();
          ctx.stroke();
          break;

        case "hexagon":
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = Math.cos(angle) * s * 0.5;
            const py = Math.sin(angle) * s * 0.5;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          break;

        case "cube":
          // Isometric cube outline
          const h = s * 0.35;
          ctx.beginPath();
          ctx.moveTo(0, -h * 2);
          ctx.lineTo(h * 1.5, -h);
          ctx.lineTo(h * 1.5, h);
          ctx.lineTo(0, h * 2);
          ctx.lineTo(-h * 1.5, h);
          ctx.lineTo(-h * 1.5, -h);
          ctx.closePath();
          ctx.stroke();
          // Inner lines
          ctx.moveTo(0, -h * 2);
          ctx.lineTo(0, 0);
          ctx.lineTo(h * 1.5, -h);
          ctx.moveTo(0, 0);
          ctx.lineTo(-h * 1.5, -h);
          ctx.stroke();
          break;

        case "layers":
          for (let i = 0; i < 3; i++) {
            const yOff = (i - 1) * s * 0.25;
            const w = s * 0.5 * (1 - i * 0.15);
            ctx.strokeRect(-w, yOff - s * 0.06, w * 2, s * 0.12);
          }
          break;

        case "dot":
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "ring":
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case "cross":
          ctx.beginPath();
          ctx.moveTo(-s * 0.3, 0);
          ctx.lineTo(s * 0.3, 0);
          ctx.moveTo(0, -s * 0.3);
          ctx.lineTo(0, s * 0.3);
          ctx.stroke();
          break;

        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.lineTo(s * 0.45, s * 0.35);
          ctx.lineTo(-s * 0.45, s * 0.35);
          ctx.closePath();
          ctx.stroke();
          break;
      }

      ctx.restore();
    };

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isActive = mouseRef.current.active;

      for (const el of elementsRef.current) {
        // Gentle autonomous drift
        el.drift.x += el.driftSpeed.x * 0.016;
        el.drift.y += el.driftSpeed.y * 0.016;

        // Bounce drift within bounds
        if (Math.abs(el.drift.x) > 30) el.driftSpeed.x *= -1;
        if (Math.abs(el.drift.y) > 20) el.driftSpeed.y *= -1;

        // Mouse parallax — elements shift based on cursor position relative to center
        let parallaxX = 0;
        let parallaxY = 0;
        if (isActive) {
          parallaxX = (mx - 0.5) * canvas.width * el.parallaxDepth;
          parallaxY = (my - 0.5) * canvas.height * el.parallaxDepth;
        }

        // Smooth interpolation
        const targetX = el.baseX + el.drift.x + parallaxX;
        const targetY = el.baseY + el.drift.y + parallaxY;
        el.x += (targetX - el.x) * 0.03;
        el.y += (targetY - el.y) * 0.03;

        // Subtle rotation
        el.rotation += el.rotationSpeed;

        // Subtle pulse
        const pulse = Math.sin(timeRef.current * 0.5 + el.pulsePhase) * 0.08;
        const savedScale = el.scale;
        el.scale = savedScale + pulse;

        drawShape(el);

        el.scale = savedScale;
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [initElements]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
