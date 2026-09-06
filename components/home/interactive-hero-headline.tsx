"use client";

import React, { useEffect, useState, useRef } from "react";

export function InteractiveHeroHeadline() {
  const line1Full = "Engineered for Makers.";
  const line2Full = "Supplied with Precision.";

  const [displayedLine1, setDisplayedLine1] = useState("");
  const [displayedLine2, setDisplayedLine2] = useState("");
  const [isDoneTyping, setIsDoneTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mouse interaction state
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Typewriter effect
  useEffect(() => {
    setIsClient(true);
    let index1 = 0;
    let index2 = 0;
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    // Type line 1
    const typeLine1 = () => {
      if (index1 <= line1Full.length) {
        setDisplayedLine1(line1Full.slice(0, index1));
        index1++;
        timer1 = setTimeout(typeLine1, 38);
      } else {
        // Pause briefly before typing line 2
        timer2 = setTimeout(typeLine2, 220);
      }
    };

    // Type line 2
    const typeLine2 = () => {
      if (index2 <= line2Full.length) {
        setDisplayedLine2(line2Full.slice(0, index2));
        index2++;
        timer2 = setTimeout(typeLine2, 38);
      } else {
        setIsDoneTyping(true);
      }
    };

    // Initial slight delay before typing begins
    const startTimeout = setTimeout(typeLine1, 150);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Cursor tracking & 3D reaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Relative coordinates inside the element for the spotlight
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      // Calculate tilt based on distance from element center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamped smooth rotation (max 7 degrees)
      const maxTilt = 7;
      const rotateX = Math.max(-maxTilt, Math.min(maxTilt, -deltaY * maxTilt));
      const rotateY = Math.max(-maxTilt, Math.min(maxTilt, deltaX * maxTilt));

      setTilt({
        rotateX,
        rotateY,
        translateZ: 14,
      });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateX: 0, rotateY: 0, translateZ: 0 });
      setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl py-2 [perspective:1200px]">
      <style jsx>{`
        @keyframes gentle-float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(0.2deg);
          }
        }

        @keyframes cursor-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes shimmer-sweep {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-float-headline {
          animation: gentle-float 6.5s ease-in-out infinite;
        }

        .animate-cursor {
          animation: cursor-blink 0.75s ease-in-out infinite;
        }

        .shimmer-text {
          background-size: 200% auto;
          animation: shimmer-sweep 8s linear infinite;
        }
      `}</style>

      {/* Interactive 3D Reactive Heading */}
      <h1
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="animate-float-headline text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-7xl leading-[1.08] text-center select-none cursor-default will-change-transform transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.translateZ}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dynamic Cursor Spotlight Reflection */}
        <div
          className="pointer-events-none absolute -inset-8 opacity-40 blur-2xl transition-opacity duration-300 -z-10"
          style={{
            background: `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.22), rgba(245, 158, 11, 0.12), transparent 70%)`,
          }}
        />

        {/* Hidden Accessible Anchor Text for Zero Cumulative Layout Shift (CLS) */}
        <span className="invisible block h-0 overflow-hidden select-none" aria-hidden="true">
          {line1Full} <br className="hidden sm:inline" />
          {line2Full}
        </span>

        {/* Live Typed Gradient Text */}
        <span
          className="shimmer-text relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 via-sky-200 to-zinc-400 drop-shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
          style={{
            textShadow: isHovered
              ? "0 0 35px rgba(56, 189, 248, 0.35), 0 0 15px rgba(255, 255, 255, 0.4)"
              : "0 0 25px rgba(255, 255, 255, 0.12)",
            transition: "text-shadow 0.3s ease",
          }}
        >
          {/* Line 1 */}
          <span className="inline">
            {isClient ? displayedLine1 : line1Full}
          </span>

          {/* Typing cursor for line 1 (if line 2 hasn't started yet) */}
          {isClient && !displayedLine2 && !isDoneTyping && (
            <span className="animate-cursor inline-block ml-1 w-[3px] h-[0.9em] align-middle rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          )}

          <br className="hidden sm:inline" />

          {/* Line 2 */}
          <span className="inline">
            {isClient ? displayedLine2 : line2Full}
          </span>

          {/* Typing cursor for line 2 / persistent subtle breathing dot when done */}
          {isClient && (
            <span
              className={`inline-block ml-1.5 w-[3.5px] h-[0.88em] align-middle rounded-full transition-all duration-300 ${
                isDoneTyping
                  ? "bg-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.8)] animate-pulse scale-90"
                  : "bg-cyan-400 shadow-[0_0_14px_#22d3ee] animate-cursor"
              }`}
            />
          )}
        </span>
      </h1>
    </div>
  );
}
