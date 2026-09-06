"use client";

import React, { useEffect, useState } from "react";

interface ButterflyConfig {
  id: number;
  size: number; // width in px
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  flapSpeed: number; // seconds per flap
  flightDuration: number; // seconds for full path loop
  flightDelay: number;
  flightPathClass: string;
  opacity: number;
  blur?: number;
}

const BUTTERFLIES: ButterflyConfig[] = [
  {
    id: 1,
    size: 42,
    primaryColor: "#38bdf8", // Cyan
    secondaryColor: "#818cf8", // Indigo
    glowColor: "rgba(56, 189, 248, 0.65)",
    flapSpeed: 0.34,
    flightDuration: 22,
    flightDelay: 0,
    flightPathClass: "animate-butterfly-flight-1",
    opacity: 0.9,
  },
  {
    id: 2,
    size: 46,
    primaryColor: "#f59e0b", // Amber
    secondaryColor: "#fb7185", // Rose
    glowColor: "rgba(245, 158, 11, 0.6)",
    flapSpeed: 0.42,
    flightDuration: 28,
    flightDelay: 3.5,
    flightPathClass: "animate-butterfly-flight-2",
    opacity: 0.85,
  },
  {
    id: 3,
    size: 36,
    primaryColor: "#34d399", // Emerald
    secondaryColor: "#22d3ee", // Sky
    glowColor: "rgba(52, 211, 153, 0.65)",
    flapSpeed: 0.3,
    flightDuration: 19,
    flightDelay: 7,
    flightPathClass: "animate-butterfly-flight-3",
    opacity: 0.88,
  },
  {
    id: 4,
    size: 32,
    primaryColor: "#c084fc", // Violet
    secondaryColor: "#e879f9", // Fuchsia
    glowColor: "rgba(192, 132, 252, 0.55)",
    flapSpeed: 0.38,
    flightDuration: 32,
    flightDelay: 11,
    flightPathClass: "animate-butterfly-flight-4",
    opacity: 0.78,
    blur: 0.5,
  },
  {
    id: 5,
    size: 44,
    primaryColor: "#fbbf24", // Golden Amber
    secondaryColor: "#f43f5e", // Coral
    glowColor: "rgba(251, 191, 36, 0.7)",
    flapSpeed: 0.36,
    flightDuration: 25,
    flightDelay: 5.2,
    flightPathClass: "animate-butterfly-flight-5",
    opacity: 0.92,
  },
];

export function DreamyButterflies() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-[4]"
      aria-hidden="true"
    >
      <style jsx global>{`
        /* 3D Wing Flapping Animation */
        @keyframes butterfly-left-wing {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateY(74deg) rotateZ(-12deg);
          }
          100% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
        }

        @keyframes butterfly-right-wing {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateY(-74deg) rotateZ(12deg);
          }
          100% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
        }

        /* Dreamy Flight Path 1: Graceful sweep from left to center-right */
        @keyframes butterfly-path-1 {
          0% {
            transform: translate3d(-6vw, 65vh, 0) rotate(15deg) scale(0.85);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          25% {
            transform: translate3d(20vw, 42vh, 0) rotate(5deg) scale(1);
          }
          45% {
            transform: translate3d(45vw, 55vh, 0) rotate(22deg) scale(1.05);
          }
          70% {
            transform: translate3d(75vw, 25vh, 0) rotate(-10deg) scale(0.95);
            opacity: 0.9;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(105vw, 15vh, 0) rotate(10deg) scale(0.8);
            opacity: 0;
          }
        }

        /* Dreamy Flight Path 2: Descending floating sweep from top-right to bottom-left */
        @keyframes butterfly-path-2 {
          0% {
            transform: translate3d(104vw, 12vh, 0) rotate(-25deg) scale(0.8);
            opacity: 0;
          }
          8% {
            opacity: 0.88;
          }
          30% {
            transform: translate3d(70vw, 32vh, 0) rotate(-15deg) scale(1);
          }
          55% {
            transform: translate3d(48vw, 22vh, 0) rotate(8deg) scale(1.08);
          }
          75% {
            transform: translate3d(22vw, 50vh, 0) rotate(-12deg) scale(0.95);
            opacity: 0.85;
          }
          92% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(-8vw, 70vh, 0) rotate(-20deg) scale(0.75);
            opacity: 0;
          }
        }

        /* Dreamy Flight Path 3: Gentle arc soaring near central hero headline */
        @keyframes butterfly-path-3 {
          0% {
            transform: translate3d(8vw, 85vh, 0) rotate(28deg) scale(0.75);
            opacity: 0;
          }
          12% {
            opacity: 0.9;
          }
          35% {
            transform: translate3d(32vw, 48vh, 0) rotate(-5deg) scale(1);
          }
          60% {
            transform: translate3d(58vw, 38vh, 0) rotate(18deg) scale(0.95);
          }
          80% {
            transform: translate3d(82vw, 52vh, 0) rotate(32deg) scale(0.9);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(106vw, 68vh, 0) rotate(15deg) scale(0.7);
            opacity: 0;
          }
        }

        /* Dreamy Flight Path 4: Deep background celestial glide across the top */
        @keyframes butterfly-path-4 {
          0% {
            transform: translate3d(95vw, 4vh, 0) rotate(-18deg) scale(0.65);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          40% {
            transform: translate3d(60vw, 16vh, 0) rotate(-8deg) scale(0.75);
          }
          65% {
            transform: translate3d(35vw, 8vh, 0) rotate(-24deg) scale(0.7);
          }
          85% {
            opacity: 0.65;
          }
          100% {
            transform: translate3d(-6vw, 18vh, 0) rotate(-10deg) scale(0.6);
            opacity: 0;
          }
        }

        /* Dreamy Flight Path 5: Spiral flutter from bottom-center ascending gracefully */
        @keyframes butterfly-path-5 {
          0% {
            transform: translate3d(40vw, 92vh, 0) rotate(10deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          30% {
            transform: translate3d(24vw, 62vh, 0) rotate(-18deg) scale(1.02);
          }
          55% {
            transform: translate3d(42vw, 35vh, 0) rotate(25deg) scale(1.06);
          }
          75% {
            transform: translate3d(65vw, 18vh, 0) rotate(-8deg) scale(0.92);
            opacity: 0.88;
          }
          95% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(92vw, -5vh, 0) rotate(15deg) scale(0.75);
            opacity: 0;
          }
        }

        .animate-butterfly-flight-1 {
          animation: butterfly-path-1 22s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .animate-butterfly-flight-2 {
          animation: butterfly-path-2 28s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .animate-butterfly-flight-3 {
          animation: butterfly-path-3 19s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .animate-butterfly-flight-4 {
          animation: butterfly-path-4 32s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .animate-butterfly-flight-5 {
          animation: butterfly-path-5 25s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }

        /* Fairy Dust Sparkle Drift */
        @keyframes fairy-sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) translateY(0);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.3) translateY(-4px);
          }
        }

        .animate-fairy-sparkle {
          animation: fairy-sparkle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Butterflies */}
      {BUTTERFLIES.map((b) => (
        <div
          key={b.id}
          className={`absolute will-change-transform ${b.flightPathClass}`}
          style={{
            animationDelay: `${b.flightDelay}s`,
            opacity: b.opacity,
            filter: b.blur ? `blur(${b.blur}px)` : undefined,
          }}
        >
          {/* Butterfly 3D Rig */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: `${b.size}px`,
              height: `${b.size * 0.82}px`,
              perspective: "500px",
              filter: `drop-shadow(0 0 12px ${b.glowColor})`,
            }}
          >
            {/* Ambient Bioluminescent Halo */}
            <div
              className="absolute -inset-2 rounded-full opacity-45 blur-md pointer-events-none"
              style={{ backgroundColor: b.primaryColor }}
            />

            {/* Left Wing */}
            <div
              className="w-1/2 h-full overflow-visible origin-right"
              style={{
                animation: `butterfly-left-wing ${b.flapSpeed}s ease-in-out infinite alternate`,
                transformStyle: "preserve-3d",
              }}
            >
              <svg
                viewBox="0 0 60 70"
                className="w-full h-full overflow-visible"
                style={{ transformOrigin: "right center" }}
              >
                <defs>
                  <linearGradient id={`grad-left-${b.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={b.primaryColor} stopOpacity="0.95" />
                    <stop offset="60%" stopColor={b.secondaryColor} stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Upper Wing */}
                <path
                  d="M60,35 C45,15 15,0 5,10 C-5,20 8,45 35,42 C50,40 58,37 60,35 Z"
                  fill={`url(#grad-left-${b.id})`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="0.8"
                />
                {/* Lower Wing */}
                <path
                  d="M60,35 C52,48 25,68 15,62 C5,56 12,42 38,40 C52,38 58,36 60,35 Z"
                  fill={`url(#grad-left-${b.id})`}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.7"
                  opacity="0.9"
                />
                {/* Filigree Vein Patterns */}
                <path
                  d="M60,35 C38,20 18,18 10,14 M60,35 C40,28 22,32 18,36 M60,35 C42,46 28,52 20,54"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                />
                {/* Wing Edge Sparkles */}
                <circle cx="12" cy="14" r="1.2" fill="#ffffff" opacity="0.9" />
                <circle cx="20" cy="54" r="1" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>

            {/* Central Body & Antennae */}
            <div className="relative z-10 w-[4px] h-[70%] flex flex-col items-center justify-center shrink-0">
              {/* Antennae */}
              <div className="absolute -top-3 flex justify-center gap-1.5 w-4 pointer-events-none">
                <span className="w-1.5 h-3 border-l border-t border-white/80 rounded-tl-full rotate-[-18deg]" />
                <span className="w-1.5 h-3 border-r border-t border-white/80 rounded-tr-full rotate-[18deg]" />
              </div>
              {/* Body */}
              <div
                className="w-1.5 h-full rounded-full shadow-[0_0_6px_#fff]"
                style={{
                  background: "linear-gradient(to bottom, #ffffff, #94a3b8)",
                }}
              />
            </div>

            {/* Right Wing */}
            <div
              className="w-1/2 h-full overflow-visible origin-left"
              style={{
                animation: `butterfly-right-wing ${b.flapSpeed}s ease-in-out infinite alternate`,
                transformStyle: "preserve-3d",
              }}
            >
              <svg
                viewBox="0 0 60 70"
                className="w-full h-full overflow-visible"
                style={{ transformOrigin: "left center" }}
              >
                <defs>
                  <linearGradient id={`grad-right-${b.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={b.primaryColor} stopOpacity="0.95" />
                    <stop offset="60%" stopColor={b.secondaryColor} stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Upper Wing */}
                <path
                  d="M0,35 C15,15 45,0 55,10 C65,20 52,45 25,42 C10,40 2,37 0,35 Z"
                  fill={`url(#grad-right-${b.id})`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="0.8"
                />
                {/* Lower Wing */}
                <path
                  d="M0,35 C8,48 35,68 45,62 C55,56 48,42 22,40 C8,38 2,36 0,35 Z"
                  fill={`url(#grad-right-${b.id})`}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.7"
                  opacity="0.9"
                />
                {/* Filigree Vein Patterns */}
                <path
                  d="M0,35 C22,20 42,18 50,14 M0,35 C20,28 38,32 42,36 M0,35 C18,46 32,52 40,54"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                />
                {/* Wing Edge Sparkles */}
                <circle cx="48" cy="14" r="1.2" fill="#ffffff" opacity="0.9" />
                <circle cx="40" cy="54" r="1" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>

            {/* Trailing Sparkle Dust Behind Butterfly */}
            <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
            <div
              className="absolute -bottom-4 right-1 w-1 h-1 rounded-full animate-fairy-sparkle"
              style={{ backgroundColor: b.primaryColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
