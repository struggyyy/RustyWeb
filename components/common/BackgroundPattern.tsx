"use client";

import React from "react";
import { useTheme } from "@/components/context/ThemeProvider";

// Available background patterns
const PATTERNS = {
  dots: {
    backgroundImage:
      "radial-gradient(#BD5151 2.5px, transparent 2.5px), radial-gradient(#BD5151 2.5px, transparent 2.5px)",
    backgroundSize: "35px 35px",
    backgroundPosition: "0 0, 17.5px 17.5px",
    opacity: 0.15,
  },
  checker: {
    backgroundImage: "url('/grid.svg')",
    opacity: 0.03,
  },
  largeDots: {
    backgroundImage:
      "radial-gradient(#BD5151 4px, transparent 4px), radial-gradient(#BD5151 4px, transparent 4px)",
    backgroundSize: "50px 50px",
    backgroundPosition: "0 0, 25px 25px",
    opacity: 0.12,
  },
  subtleDots: {
    backgroundImage:
      "radial-gradient(#BD5151 1.5px, transparent 1.5px), radial-gradient(#BD5151 1.5px, transparent 1.5px)",
    backgroundSize: "25px 25px",
    backgroundPosition: "0 0, 12.5px 12.5px",
    opacity: 0.08,
  },
} as const;

type PatternType = keyof typeof PATTERNS;

interface BackgroundPatternProps {
  pattern?: PatternType;
}

export default function BackgroundPattern({
  pattern = "dots",
}: BackgroundPatternProps) {
  const { theme } = useTheme();
  const currentPattern = PATTERNS[pattern];

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-neutral-50 transition-colors duration-300">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              theme === "dark"
                ? "repeating-linear-gradient(45deg, #808080 0, #808080 1px, transparent 0, transparent 50%)"
                : currentPattern.backgroundImage,
            backgroundSize:
              theme === "dark"
                ? "10px 10px"
                : "backgroundSize" in currentPattern
                ? currentPattern.backgroundSize
                : undefined,
            backgroundPosition:
              "backgroundPosition" in currentPattern
                ? currentPattern.backgroundPosition
                : undefined,
          }}
        />
      </div>
    </>
  );
}

// Export pattern types for easy switching
export { PATTERNS };
export type { PatternType };
