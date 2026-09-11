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
      {/* Global style to hide default cursor when this component is active */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          cursor: none !important;
        }
      `}} />
      
      {/* Outer smooth trailing ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full border border-cyan-400 mix-blend-difference"
        style={{
          x: smoothX,
          y: smoothY,
          // Shift -50% -50% via margins so x/y represent the exact center
          marginLeft: isHovering ? -24 : -16,
          marginTop: isHovering ? -24 : -16,
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          backgroundColor: isHovering ? "rgba(34, 211, 238, 0.15)" : "transparent",
        }}
        animate={{
          scale: isHovering ? 1.1 : 1,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />

      {/* Tiny fast center dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-cyan-400 mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          marginLeft: -3,
          marginTop: -3,
        }}
      />
    </>
  );
}
