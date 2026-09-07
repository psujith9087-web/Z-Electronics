"use client";

import React, { useEffect, useState } from "react";

export function FloatingPcbTraces() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMouseOffset({ x: x * 15, y: y * 12 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ perspective: 1200 }}
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes pcb-float-gentle {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) rotate(0deg);
          }
          50% {
            transform: translate3d(0px, -9px, 0px) rotate(0.12deg);
          }
        }

        @keyframes pcb-float-counter {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) rotate(0deg);
          }
          50% {
            transform: translate3d(0px, 7px, 0px) rotate(-0.12deg);
          }
        }

        @keyframes pulse-flow-fast {
          from {
            stroke-dashoffset: 800;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse-flow-medium {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse-flow-slow {
          from {
            stroke-dashoffset: 1200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes via-breathe {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.15);
          }
        }

        @keyframes via-spark {
          0%, 100% {
            opacity: 0.4;
            filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.6));
          }
        }

        .anim-pcb-float-1 {
          animation: pcb-float-gentle 14s ease-in-out infinite;
        }

        .anim-pcb-float-2 {
          animation: pcb-float-counter 18s ease-in-out infinite;
        }

        .anim-pulse-1 {
          stroke-dasharray: 40 400;
          animation: pulse-flow-fast 4.5s linear infinite;
        }

        .anim-pulse-2 {
          stroke-dasharray: 55 500;
          animation: pulse-flow-medium 6.5s linear infinite;
        }

        .anim-pulse-3 {
          stroke-dasharray: 70 600;
          animation: pulse-flow-slow 8.5s linear infinite;
        }

        .anim-pulse-cyan {
          stroke-dasharray: 45 450;
          animation: pulse-flow-fast 5.2s linear infinite;
        }

        .anim-via-spark-1 {
          animation: via-spark 3.2s ease-in-out infinite;
        }

        .anim-via-spark-2 {
          animation: via-spark 4.4s ease-in-out infinite 1.2s;
        }

        .anim-via-spark-3 {
          animation: via-spark 5.1s ease-in-out infinite 2.4s;
        }
      `}</style>

      {/* -- Soft Vignette Mask to keep Center Typography Crystal Clear --- */}
      <div
        className="absolute inset-0 w-full h-full opacity-80"
        style={{
          maskImage:
            "radial-gradient(ellipse 95% 85% at 50% 48%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.5) 70%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 85% at 50% 48%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.5) 70%, transparent 100%)",
        }}
      >
        {/* Parallax Container reacting subtly to mouse cursor */}
        <div
          className="w-full h-full will-change-transform transition-transform duration-300 ease-out"
          style={{
            transform: isClient
              ? `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`
              : "translate3d(0,0,0)",
          }}
        >
          {/* ============================================================ */}
          {/* LAYER 1: Deep Background Blurred Copper Bus (Depth Layer)      */}
          {/* ============================================================ */}
          <svg
            className="absolute inset-0 w-full h-full anim-pcb-float-2 opacity-30 blur-[1.2px]"
            viewBox="0 0 1600 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <g stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Deep Left Tracks */}
              <path d="M 40 180 L 220 180 L 320 280 L 520 280 L 580 220 L 740 220" />
              <path d="M 40 200 L 210 200 L 310 300 L 510 300 L 570 240 L 740 240" />
              <path d="M 100 480 L 240 480 L 320 560 L 540 560 L 600 620 L 760 620" />
              <path d="M 60 700 L 220 700 L 300 620 L 480 620 L 560 700 L 720 700" />

              {/* Deep Right Tracks */}
              <path d="M 1560 180 L 1380 180 L 1280 280 L 1080 280 L 1020 220 L 860 220" />
              <path d="M 1560 200 L 1390 200 L 1290 300 L 1090 300 L 1030 240 L 860 240" />
              <path d="M 1500 480 L 1360 480 L 1280 560 L 1060 560 L 1000 620 L 840 620" />
              <path d="M 1540 700 L 1380 700 L 1300 620 L 1120 620 L 1040 700 L 880 700" />

              {/* Bottom Interconnects */}
              <path d="M 380 780 L 460 780 L 520 840 L 700 840" />
              <path d="M 1220 780 L 1140 780 L 1080 840 L 900 840" />
            </g>
          </svg>

          {/* ============================================================ */}
          {/* LAYER 2: Crisp Golden PCB Traces & Motherboard Vias (Mid)     */}
          {/* ============================================================ */}
          <svg
            className="absolute inset-0 w-full h-full anim-pcb-float-1 opacity-70"
            viewBox="0 0 1600 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Golden Metallic Linear Gradient for Traces */}
              <linearGradient id="gold-trace-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.4" />
                <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
              </linearGradient>

              {/* Traveling Pulse Gradient - Warm Gold & Amber */}
              <linearGradient id="pulse-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#fef08a" />
                <stop offset="85%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Traveling Pulse Gradient - Electric Cyan Accent */}
              <linearGradient id="pulse-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor="#06b6d4" />
                <stop offset="75%" stopColor="#67e8f9" />
                <stop offset="90%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Radial Luminescence for Glowing Solder Vias */}
              <radialGradient id="via-amber-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#b45309" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="via-cyan-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a5f3fc" stopOpacity="1" />
                <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#0891b2" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>

              {/* Soft SVG Glow Filter */}
              <filter id="pcb-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ------------------------------------------------------------ */}
            {/* 1. Base Static Copper Traces (Classic 45° & 90° Routing)     */}
            {/* ------------------------------------------------------------ */}
            <g stroke="url(#gold-trace-gradient)" strokeLinecap="round" strokeLinejoin="round">
              {/* === LEFT BUS: Parallel 4-Lane Microcontroller Data Lines === */}
              <path d="M 0 310 L 260 310 L 340 390 L 510 390 L 570 330 L 710 330" strokeWidth="1.5" />
              <path d="M 0 326 L 250 326 L 330 406 L 500 406 L 560 346 L 710 346" strokeWidth="1.5" />
              <path d="M 0 342 L 240 342 L 320 422 L 490 422 L 550 362 L 710 362" strokeWidth="1.5" />
              <path d="M 0 358 L 230 358 L 310 438 L 480 438 L 540 378 L 710 378" strokeWidth="1.5" />

              {/* Left Secondary Diagnostic Lines */}
              <path d="M 40 140 L 160 140 L 220 200 L 410 200 L 460 150 L 660 150 L 710 200" strokeWidth="1.2" />
              <path d="M 90 520 L 240 520 L 310 450 L 420 450 L 470 500 L 620 500 L 680 560 L 760 560" strokeWidth="1.2" />
              <path d="M 30 640 L 180 640 L 260 560 L 400 560 L 460 620 L 580 620 L 640 680 L 740 680" strokeWidth="1.2" />
              <path d="M 120 760 L 300 760 L 380 680 L 520 680 L 580 740 L 720 740" strokeWidth="1.4" />

              {/* === RIGHT BUS: High-Speed PCIe & Sensor Bus Lines === */}
              <path d="M 1600 310 L 1340 310 L 1260 390 L 1090 390 L 1030 330 L 890 330" strokeWidth="1.5" />
              <path d="M 1600 326 L 1350 326 L 1270 406 L 1100 406 L 1040 346 L 890 346" strokeWidth="1.5" />
              <path d="M 1600 342 L 1360 342 L 1280 422 L 1110 422 L 1050 362 L 890 362" strokeWidth="1.5" />
              <path d="M 1600 358 L 1370 358 L 1290 438 L 1120 438 L 1060 378 L 890 378" strokeWidth="1.5" />

              {/* Right Secondary Circuit Lines */}
              <path d="M 1560 140 L 1440 140 L 1380 200 L 1190 200 L 1140 150 L 940 150 L 890 200" strokeWidth="1.2" />
              <path d="M 1510 520 L 1360 520 L 1290 450 L 1180 450 L 1130 500 L 980 500 L 920 560 L 840 560" strokeWidth="1.2" />
              <path d="M 1570 640 L 1420 640 L 1340 560 L 1200 560 L 1140 620 L 1020 620 L 960 680 L 860 680" strokeWidth="1.2" />
              <path d="M 1480 760 L 1300 760 L 1220 680 L 1080 680 L 1020 740 L 880 740" strokeWidth="1.4" />

              {/* === CENTRAL PROCESSOR SOCKET INTERCONNECTS (Flowing from Logo) === */}
              {/* Traces fanning out from center CPU emblem */}
              <path d="M 720 170 L 680 170 L 640 130 L 520 130 L 480 90 L 360 90" strokeWidth="1.4" />
              <path d="M 880 170 L 920 170 L 960 130 L 1080 130 L 1120 90 L 1240 90" strokeWidth="1.4" />
              <path d="M 740 110 L 700 70 L 560 70 L 520 30 L 400 30" strokeWidth="1.2" />
              <path d="M 860 110 L 900 70 L 1040 70 L 1080 30 L 1200 30" strokeWidth="1.2" />

              {/* Lower Central Downlinks towards Stats Bar */}
              <path d="M 720 230 L 670 280 L 600 280 L 560 320" strokeWidth="1.2" />
              <path d="M 880 230 L 930 280 L 1000 280 L 1040 320" strokeWidth="1.2" />
              <path d="M 760 250 L 720 290 L 650 290 L 610 330" strokeWidth="1" />
              <path d="M 840 250 L 880 290 L 950 290 L 990 330" strokeWidth="1" />

              {/* Bottom Power Interconnects */}
              <path d="M 440 820 L 560 820 L 620 880 L 780 880" strokeWidth="1.6" />
              <path d="M 1160 820 L 1040 820 L 980 880 L 820 880" strokeWidth="1.6" />
            </g>

            {/* ------------------------------------------------------------ */}
            {/* 2. SMT Footprints & Chip Component Arrays                     */}
            {/* ------------------------------------------------------------ */}
            <g fill="#b45309" opacity="0.6">
              {/* Left IC array */}
              <rect x="256" y="306" width="7" height="3" rx="0.5" />
              <rect x="246" y="322" width="7" height="3" rx="0.5" />
              <rect x="236" y="338" width="7" height="3" rx="0.5" />
              <rect x="226" y="354" width="7" height="3" rx="0.5" />

              {/* Right IC array */}
              <rect x="1336" y="306" width="7" height="3" rx="0.5" />
              <rect x="1346" y="322" width="7" height="3" rx="0.5" />
              <rect x="1356" y="338" width="7" height="3" rx="0.5" />
              <rect x="1366" y="354" width="7" height="3" rx="0.5" />
            </g>

            {/* ------------------------------------------------------------ */}
            {/* 3. Solder Vias & Pad Rings (Circular Golden Pads)            */}
            {/* ------------------------------------------------------------ */}
            <g stroke="#f59e0b" strokeWidth="1.2" fill="#09090e">
              {/* Left Bus Vias */}
              <circle cx="260" cy="310" r="3.5" />
              <circle cx="340" cy="390" r="3.5" />
              <circle cx="510" cy="390" r="3.5" />
              <circle cx="570" cy="330" r="3.5" />
              <circle cx="710" cy="330" r="4.2" />

              <circle cx="250" cy="326" r="3.5" />
              <circle cx="330" cy="406" r="3.5" />
              <circle cx="500" cy="406" r="3.5" />
              <circle cx="560" cy="346" r="3.5" />
              <circle cx="710" cy="346" r="4.2" />

              <circle cx="240" cy="342" r="3.5" />
              <circle cx="320" cy="422" r="3.5" />
              <circle cx="550" cy="362" r="3.5" />
              <circle cx="710" cy="362" r="4.2" />

              <circle cx="230" cy="358" r="3.5" />
              <circle cx="310" cy="438" r="3.5" />
              <circle cx="540" cy="378" r="3.5" />
              <circle cx="710" cy="378" r="4.2" />

              {/* Left Diagnostics Vias */}
              <circle cx="160" cy="140" r="3.2" />
              <circle cx="220" cy="200" r="3.2" />
              <circle cx="410" cy="200" r="3.5" />
              <circle cx="660" cy="150" r="3.5" />
              <circle cx="240" cy="520" r="3.2" />
              <circle cx="420" cy="450" r="3.5" />
              <circle cx="620" cy="500" r="3.5" />
              <circle cx="760" cy="560" r="4.2" />
              <circle cx="260" cy="560" r="3.2" />
              <circle cx="580" cy="620" r="3.5" />
              <circle cx="740" cy="680" r="4.2" />
              <circle cx="380" cy="680" r="3.5" />
              <circle cx="720" cy="740" r="4.2" />

              {/* Right Bus Vias */}
              <circle cx="1340" cy="310" r="3.5" />
              <circle cx="1260" cy="390" r="3.5" />
              <circle cx="1090" cy="390" r="3.5" />
              <circle cx="1030" cy="330" r="3.5" />
              <circle cx="890" cy="330" r="4.2" />

              <circle cx="1350" cy="326" r="3.5" />
              <circle cx="1270" cy="406" r="3.5" />
              <circle cx="1100" cy="406" r="3.5" />
              <circle cx="1040" cy="346" r="3.5" />
              <circle cx="890" cy="346" r="4.2" />

              <circle cx="1360" cy="342" r="3.5" />
              <circle cx="1280" cy="422" r="3.5" />
              <circle cx="1050" cy="362" r="3.5" />
              <circle cx="890" cy="362" r="4.2" />

              <circle cx="1370" cy="358" r="3.5" />
              <circle cx="1290" cy="438" r="3.5" />
              <circle cx="1060" cy="378" r="3.5" />
              <circle cx="890" cy="378" r="4.2" />

              {/* Right Diagnostics Vias */}
              <circle cx="1440" cy="140" r="3.2" />
              <circle cx="1380" cy="200" r="3.2" />
              <circle cx="1190" cy="200" r="3.5" />
              <circle cx="940" cy="150" r="3.5" />
              <circle cx="1360" cy="520" r="3.2" />
              <circle cx="1180" cy="450" r="3.5" />
              <circle cx="980" cy="500" r="3.5" />
              <circle cx="840" cy="560" r="4.2" />
              <circle cx="1340" cy="560" r="3.2" />
              <circle cx="1020" cy="620" r="3.5" />
              <circle cx="860" cy="680" r="4.2" />
              <circle cx="1220" cy="680" r="3.5" />
              <circle cx="880" cy="740" r="4.2" />

              {/* Center Vias */}
              <circle cx="640" cy="130" r="3.5" />
              <circle cx="520" cy="130" r="3.5" />
              <circle cx="360" cy="90" r="4" />
              <circle cx="960" cy="130" r="3.5" />
              <circle cx="1080" cy="130" r="3.5" />
              <circle cx="1240" cy="90" r="4" />
              <circle cx="400" cy="30" r="4" />
              <circle cx="1200" cy="30" r="4" />
            </g>

            {/* ------------------------------------------------------------ */}
            {/* 4. Active Illumination: Electrical Pulses Traveling in Traces */}
            {/* ------------------------------------------------------------ */}
            <g strokeLinecap="round" strokeLinejoin="round" filter="url(#pcb-glow)">
              {/* Gold Pulse 1 - Left Bus Lane */}
              <path
                d="M 0 310 L 260 310 L 340 390 L 510 390 L 570 330 L 710 330"
                stroke="url(#pulse-gold)"
                strokeWidth="2.5"
                className="anim-pulse-1"
              />

              {/* Gold Pulse 2 - Left Lower Diagnostic Line */}
              <path
                d="M 30 640 L 180 640 L 260 560 L 400 560 L 460 620 L 580 620 L 640 680 L 740 680"
                stroke="url(#pulse-gold)"
                strokeWidth="2.2"
                className="anim-pulse-2"
              />

              {/* Gold Pulse 3 - Right PCIe Bus Lane */}
              <path
                d="M 1600 326 L 1350 326 L 1270 406 L 1100 406 L 1040 346 L 890 346"
                stroke="url(#pulse-gold)"
                strokeWidth="2.5"
                className="anim-pulse-1"
              />

              {/* Gold Pulse 4 - Right Diagnostic Line */}
              <path
                d="M 1570 640 L 1420 640 L 1340 560 L 1200 560 L 1140 620 L 1020 620 L 960 680 L 860 680"
                stroke="url(#pulse-gold)"
                strokeWidth="2.2"
                className="anim-pulse-3"
              />

              {/* Cyan Pulse Accent 1 - Top Center Diagnostic Trace */}
              <path
                d="M 720 170 L 680 170 L 640 130 L 520 130 L 480 90 L 360 90"
                stroke="url(#pulse-cyan)"
                strokeWidth="2.2"
                className="anim-pulse-cyan"
              />

              {/* Cyan Pulse Accent 2 - Top Right Diagnostic Trace */}
              <path
                d="M 880 170 L 920 170 L 960 130 L 1080 130 L 1120 90 L 1240 90"
                stroke="url(#pulse-cyan)"
                strokeWidth="2.2"
                className="anim-pulse-cyan"
              />

              {/* Bottom Power Line Pulse */}
              <path
                d="M 440 820 L 560 820 L 620 880 L 780 880"
                stroke="url(#pulse-gold)"
                strokeWidth="2.8"
                className="anim-pulse-2"
              />
              <path
                d="M 1160 820 L 1040 820 L 980 880 L 820 880"
                stroke="url(#pulse-gold)"
                strokeWidth="2.8"
                className="anim-pulse-3"
              />
            </g>

            {/* ------------------------------------------------------------ */}
            {/* 5. Naturally Breathing Glowing Solder Nodes & Spark Vias    */}
            {/* ------------------------------------------------------------ */}
            <g>
              {/* Amber Glowing Vias (Warm golden lights like in reference) */}
              <circle cx="260" cy="310" r="9" fill="url(#via-amber-glow)" className="anim-via-spark-1" />
              <circle cx="510" cy="390" r="10" fill="url(#via-amber-glow)" className="anim-via-spark-2" />
              <circle cx="710" cy="330" r="12" fill="url(#via-amber-glow)" className="anim-via-spark-3" />
              <circle cx="220" cy="200" r="8" fill="url(#via-amber-glow)" className="anim-via-spark-2" />
              <circle cx="620" cy="500" r="9" fill="url(#via-amber-glow)" className="anim-via-spark-1" />
              <circle cx="740" cy="680" r="11" fill="url(#via-amber-glow)" className="anim-via-spark-3" />

              <circle cx="1340" cy="310" r="9" fill="url(#via-amber-glow)" className="anim-via-spark-2" />
              <circle cx="1100" cy="406" r="10" fill="url(#via-amber-glow)" className="anim-via-spark-1" />
              <circle cx="890" cy="346" r="12" fill="url(#via-amber-glow)" className="anim-via-spark-3" />
              <circle cx="1380" cy="200" r="8" fill="url(#via-amber-glow)" className="anim-via-spark-1" />
              <circle cx="980" cy="500" r="9" fill="url(#via-amber-glow)" className="anim-via-spark-2" />
              <circle cx="860" cy="680" r="11" fill="url(#via-amber-glow)" className="anim-via-spark-3" />

              {/* Cyan Glowing Micro-Vias (High-tech accent sparkles) */}
              <circle cx="360" cy="90" r="9" fill="url(#via-cyan-glow)" className="anim-via-spark-1" />
              <circle cx="1240" cy="90" r="9" fill="url(#via-cyan-glow)" className="anim-via-spark-2" />
              <circle cx="640" cy="680" r="8" fill="url(#via-cyan-glow)" className="anim-via-spark-3" />
              <circle cx="960" cy="680" r="8" fill="url(#via-cyan-glow)" className="anim-via-spark-1" />

              {/* Brilliant Center Sparkle Cores */}
              <circle cx="710" cy="330" r="2" fill="#fff" className="anim-via-spark-3" />
              <circle cx="890" cy="346" r="2" fill="#fff" className="anim-via-spark-3" />
              <circle cx="510" cy="390" r="1.8" fill="#fff" className="anim-via-spark-2" />
              <circle cx="1100" cy="406" r="1.8" fill="#fff" className="anim-via-spark-1" />
              <circle cx="360" cy="90" r="1.8" fill="#fff" className="anim-via-spark-1" />
              <circle cx="1240" cy="90" r="1.8" fill="#fff" className="anim-via-spark-2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
