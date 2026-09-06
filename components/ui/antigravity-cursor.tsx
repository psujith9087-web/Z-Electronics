"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export function AntigravityCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on desktop/pointer devices to preserve battery on mobile
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const colors = [
      "rgba(37, 99, 235, ",   // Electric Blue
      "rgba(59, 130, 246, ",  // Tech Blue
      "rgba(147, 197, 253, ", // Soft Cyan
      "rgba(16, 185, 129, ",  // Emerald accent
      "rgba(168, 85, 247, ",  // Violet
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let mouseX = -100;
    let mouseY = -100;
    let lastX = -100;
    let lastY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dist = Math.hypot(mouseX - lastX, mouseY - lastY);

      // Spawn micro-particles along movement vector
      if (dist > 6) {
        const count = Math.min(Math.floor(dist / 8), 4);
        for (let i = 0; i < count; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            // Anti-gravity float: negative vy (upward)
            vx: (Math.random() - 0.5) * 1.2,
            vy: -0.6 - Math.random() * 1.4,
            size: 1.5 + Math.random() * 2.2,
            alpha: 0.65 + Math.random() * 0.35,
            decay: 0.015 + Math.random() * 0.02,
            color,
          });
        }
        lastX = mouseX;
        lastY = mouseY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Anti-gravity motion
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // Continual upward gentle buoyancy
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.4)`;
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full select-none"
      aria-hidden="true"
    />
  );
}
