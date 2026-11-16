"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Sparkles,
  Layers,
  Cpu,
  RotateCcw,
} from "lucide-react";

export function Hero3dVideoStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false); // 3D deep focus mode on click
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [electricRipples, setElectricRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  // Physics & Lerp values for 60/120fps buttery smoothness
  const targetTilt = useRef({ x: 0, y: 0, z: 0, scale: 1 });
  const currentTilt = useRef({ x: 0, y: 0, z: 0, scale: 1 });
  const [displayTilt, setDisplayTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    scale: 1,
    lightX: 50,
    lightY: 50,
  });

  // Smooth lerp loop with natural spring damping
  const updatePhysics = useCallback(() => {
    const lerpFactor = 0.085; // Silky smooth damping factor
    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * lerpFactor;
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * lerpFactor;
    currentTilt.current.z += (targetTilt.current.z - currentTilt.current.z) * lerpFactor;
    currentTilt.current.scale += (targetTilt.current.scale - currentTilt.current.scale) * lerpFactor;

    setDisplayTilt({
      rotateX: currentTilt.current.x,
      rotateY: currentTilt.current.y,
      translateZ: currentTilt.current.z,
      scale: currentTilt.current.scale,
      lightX: 50 + currentTilt.current.y * 3.5,
      lightY: 50 - currentTilt.current.x * 3.5,
    });

    rafRef.current = requestAnimationFrame(updatePhysics);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updatePhysics]);

  // Window cursor tracking for desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center normalized (-1 to 1)
      const normX = (e.clientX - centerX) / (window.innerWidth / 1.6);
      const normY = (e.clientY - centerY) / (window.innerHeight / 1.6);

      const maxTiltDeg = isEngaged ? 14 : 9;
      const rotX = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, -normY * maxTiltDeg));
      const rotY = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, normX * maxTiltDeg));

      targetTilt.current.x = rotX;
      targetTilt.current.y = rotY;
      targetTilt.current.z = isEngaged ? 38 : isHovered ? 20 : 6;
      targetTilt.current.scale = isEngaged ? 1.035 : isHovered ? 1.02 : 1;
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (!isEngaged) {
        targetTilt.current.x = 0;
        targetTilt.current.y = 0;
        targetTilt.current.z = 0;
        targetTilt.current.scale = 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isEngaged, isHovered]);

  // Touch gesture tracking for mobile / tablet devices
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && containerRef.current) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (touch.clientX - centerX) / (window.innerWidth / 1.5);
      const normY = (touch.clientY - centerY) / (window.innerHeight / 1.5);

      const maxTiltDeg = isEngaged ? 15 : 10;
      targetTilt.current.x = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, -normY * maxTiltDeg));
      targetTilt.current.y = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, normX * maxTiltDeg));
      targetTilt.current.scale = 1.025;
    }
  };

  const handleTouchEnd = () => {
    if (!isEngaged) {
      targetTilt.current.x = 0;
      targetTilt.current.y = 0;
      targetTilt.current.scale = 1;
    }
  };

  // Handle click on the 3D stage
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setHasInteracted(true);

    // Calculate ripple origin
    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const rippleX = ((e.clientX - rect.left) / rect.width) * 100;
      const rippleY = ((e.clientY - rect.top) / rect.height) * 100;

      const newRipple = { id: Date.now(), x: rippleX, y: rippleY };
      setElectricRipples((prev) => [...prev.slice(-3), newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setElectricRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1000);
    }

    // Toggle 3D deep focus mode
    setIsEngaged((prev) => !prev);

    // Give an instant spring rebound
    targetTilt.current.scale = 0.985;
    setTimeout(() => {
      targetTilt.current.scale = isEngaged ? 1 : 1.035;
    }, 120);
  };

  // Video playback toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Audio toggle
  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Reset 3D view
  const handleResetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEngaged(false);
    targetTilt.current.x = 0;
    targetTilt.current.y = 0;
    targetTilt.current.z = 0;
    targetTilt.current.scale = 1;
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mt-12 sm:mt-16 w-full max-w-5xl px-2 sm:px-4 z-20"
      style={{ perspective: "1400px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Ambient Electric Backlight (Bleeds cyan & warm gold into the background) */}
      <div
        className="pointer-events-none absolute -inset-6 sm:-inset-10 rounded-3xl opacity-60 sm:opacity-75 blur-3xl transition-opacity duration-700 -z-10"
        style={{
          background: isEngaged
            ? "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.35) 0%, rgba(245,158,11,0.25) 45%, rgba(168,85,247,0.15) 75%, transparent 100%)"
            : "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.2) 0%, rgba(245,158,11,0.15) 50%, transparent 80%)",
          transform: `translate3d(${displayTilt.rotateY * 2.5}px, ${-displayTilt.rotateX * 2.5}px, 0)`,
        }}
      />

      {/* Main 3D Floating Stage Chassis */}
      <div
        ref={stageRef}
        onClick={handleStageClick}
        className="group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-700/60 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black p-1 sm:p-2 shadow-[0_20px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/10 transition-shadow duration-500 hover:border-cyan-500/50 hover:shadow-[0_25px_90px_rgba(34,211,238,0.25)] select-none"
        style={{
          transform: `rotateX(${displayTilt.rotateX}deg) rotateY(${displayTilt.rotateY}deg) translateZ(${displayTilt.translateZ}px) scale3d(${displayTilt.scale}, ${displayTilt.scale}, 1)`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Aerospace Corner Precision Brackets */}
        <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-cyan-400/80 z-30" />
        <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-cyan-400/80 z-30" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-amber-400/80 z-30" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-amber-400/80 z-30" />

        {/* Dynamic Specular Glass Sheen Overlay (moves with cursor) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl opacity-40 mix-blend-overlay transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle 500px at ${displayTilt.lightX}% ${displayTilt.lightY}%, rgba(255,255,255,0.45), transparent 70%)`,
          }}
        />

        {/* Electric Click Shockwave Ripples */}
        {electricRipples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full border border-cyan-300 bg-cyan-400/20 -translate-x-1/2 -translate-y-1/2 animate-ping z-30"
            style={{
              top: `${ripple.y}%`,
              left: `${ripple.x}%`,
              width: "280px",
              height: "280px",
              boxShadow: "0 0 50px rgba(34, 211, 238, 0.8)",
            }}
          />
        ))}

        {/* Holographic Top HUD Telemetry Bar */}
        <div className="relative z-30 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md text-[11px] font-mono tracking-wider text-zinc-400 rounded-t-xl">
          {/* Left: Active 3D Engine Radar */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_#22d3ee]" />
            </span>
            <span className="font-semibold text-zinc-200 uppercase flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-cyan-400" />
              <span>Z-3D Silicon Core</span>
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline text-amber-400/90 font-medium">4K Cinematic</span>
          </div>

          {/* Center: Mode Indicator & Click Prompt */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-zinc-300">
            <Sparkles className="h-2.5 w-2.5 text-amber-400 animate-pulse" />
            <span className="text-[10px]">
              {isEngaged ? "3D Deep Focus Engaged" : "Click anywhere to tilt & engage 3D"}
            </span>
          </div>

          {/* Right: Interactive HUD Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Reset Button (if engaged) */}
            {isEngaged && (
              <button
                type="button"
                onClick={handleResetView}
                title="Reset 3D perspective"
                className="p-1 sm:p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? "Pause Video" : "Play Video"}
              className="p-1 sm:p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>

            {/* Audio Toggle Button with Animated Wave Visualizer */}
            <button
              type="button"
              onClick={toggleAudio}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3 w-3 text-zinc-400" />
                  <span className="hidden sm:inline text-[10px]">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <span className="hidden sm:inline text-[10px] text-cyan-300 font-semibold">Audio On</span>
                  {/* Subtle 3-bar equalizer */}
                  <span className="hidden sm:flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" />
                    <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-1 bg-cyan-400 animate-pulse delay-150" />
                  </span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-1 sm:p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Video Canvas Container (16:9 Aspect Ratio with Cinematic Vignette) */}
        <div className="relative aspect-video w-full overflow-hidden rounded-b-xl bg-black">
          <video
            ref={videoRef}
            src="/videos/hero-cinematic.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="h-full w-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />

          {/* Cinematic Radial Vignette Edge Blend (smoothly integrates with the black theme) */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(7,7,9,0.5) 85%, rgba(7,7,9,0.95) 100%)",
            }}
          />

          {/* Bottom Holographic Watermark Pill */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span className="font-semibold text-white">Z-Electronics</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Microcontroller & PCB Hardware Suite</span>
          </div>

          {/* Center "Engage 3D" Floating Prompt (fades out on interaction) */}
          {!hasInteracted && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-zinc-950/80 px-4 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-md animate-bounce">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Interactive 3D Stage • Click to engage</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Under-Stage Ambient Hardware Reflection / Cybernetic Shadow */}
      <div
        className="mx-auto -mt-2 h-4 w-4/5 rounded-full bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent blur-md -z-10 transition-all duration-300"
        style={{
          opacity: isEngaged ? 0.9 : 0.5,
          transform: `scaleX(${isEngaged ? 1.08 : 1})`,
        }}
      />
    </div>
  );
}
