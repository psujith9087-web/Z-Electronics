"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AntigravityCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use motion values for raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for the outer ring (creates the smooth trailing effect)
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on mobile/touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setIsVisible(true);

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over a clickable element
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[role='button']") ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer smooth glowing aura that trails behind the default cursor */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full bg-cyan-500/20 blur-md mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          // Shift -50% -50% via margins
          marginLeft: isHovering ? -32 : -20,
          marginTop: isHovering ? -32 : -20,
          width: isHovering ? 64 : 40,
          height: isHovering ? 64 : 40,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* Crisp outer ring following the exact mouse position */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-cyan-400/50 mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          marginLeft: isHovering ? -16 : -8,
          marginTop: isHovering ? -16 : -8,
          width: isHovering ? 32 : 16,
          height: isHovering ? 32 : 16,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
