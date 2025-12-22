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

// Background pattern definitions
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
    opacity: 0.05,
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
  const currentPattern = PATTERNS[pattern];

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-neutral-50 transition-colors duration-300">
        {/* Light Mode Pattern */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            opacity: currentPattern.opacity,
            backgroundImage: currentPattern.backgroundImage,
            backgroundSize:
              "backgroundSize" in currentPattern
                ? currentPattern.backgroundSize
                : undefined,
            backgroundPosition:
              "backgroundPosition" in currentPattern
                ? currentPattern.backgroundPosition
                : undefined,
          }}
        />

        {/* Dark Mode Pattern */}
        <div
          className="absolute inset-0 hidden dark:block opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #808080 0, #808080 1px, transparent 0, transparent 50%)",
            backgroundSize: "10px 10px",
          }}
        />
      </div>
    </>
  );
}

// Pattern types export
export { PATTERNS };
export type { PatternType };
