/**
 * InteractiveBackground — Floating geometric shapes that follow the mouse cursor
 * Inspired by labak-sy.com's floating emoji elements
 * Uses navy/beige brand colors
 */

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "diamond" | "circle" | "square" | "triangle";
  color: string;
  opacity: number;
  parallaxFactor: number;
}

const COLORS = [
  "rgba(10, 22, 40, 0.08)",   // navy very light
  "rgba(10, 22, 40, 0.05)",   // navy ultra light
  "rgba(212, 196, 176, 0.2)", // beige
  "rgba(212, 196, 176, 0.15)", // beige lighter
  "rgba(200, 184, 164, 0.12)", // sand
  "rgba(10, 22, 40, 0.06)",   // navy hint
];

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const shapes: Particle["shape"][] = ["diamond", "circle", "square", "triangle"];
    const particles: Particle[] = [];
    const count = Math.min(18, Math.floor(window.innerWidth / 80));

    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: 8 + Math.random() * 24,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.3 + Math.random() * 0.5,
        parallaxFactor: 0.02 + Math.random() * 0.06,
      });
    }
    particlesRef.current = particles;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const drawShape = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;

      switch (p.shape) {
        case "diamond":
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.stroke();
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "square":
          ctx.strokeRect(-p.size * 0.4, -p.size * 0.4, p.size * 0.8, p.size * 0.8);
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.6);
          ctx.lineTo(p.size * 0.5, p.size * 0.4);
          ctx.lineTo(-p.size * 0.5, p.size * 0.4);
          ctx.closePath();
          ctx.stroke();
          break;
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Move towards mouse with parallax
        const dx = mx - p.baseX;
        const dy = my - p.baseY;
        const targetX = p.baseX + dx * p.parallaxFactor;
        const targetY = p.baseY + dy * p.parallaxFactor;

        p.x += (targetX - p.x) * 0.04;
        p.y += (targetY - p.y) * 0.04;
        p.rotation += p.rotationSpeed;

        drawShape(p);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}
