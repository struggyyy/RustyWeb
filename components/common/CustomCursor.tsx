/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
"use client";

// React specific imports
import { useEffect, useRef, useState } from "react";

interface CustomCursorProps {
  variant?: "default" | "precise";
}

export default function CustomCursor({
  variant = "default",
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Dynamic cursor sizing
  const getCursorSize = () => {
    if (variant === "default") return "w-8 h-8";
    // Precise variant shrinks on hover
    return isHovering ? "w-4 h-4" : "w-5 h-5";
  };

  const sizeClass = getCursorSize();
  const dotSizeClass = "w-1.5 h-1.5";

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for interactive elements
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.closest(".cursor-pointer") !== null ||
        // Keep the computed check for cases where we might miss the class
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", checkHover);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", checkHover);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 ${sizeClass} border-[2.5px] border-white rounded-full pointer-events-none z-[2147483647] mix-blend-difference transition-[width,height,opacity] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center will-change-transform`}
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <div
          className={`bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isHovering ? "w-full h-full" : dotSizeClass
          }`}
        />
      </div>
    </>
  );
}
