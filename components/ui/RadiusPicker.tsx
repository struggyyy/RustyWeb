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
import { useState, useRef, useEffect } from "react";

// External libraries
import { CircleDot } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RadiusPickerProps {
  radius: number | null;
  onChange: (radius: number | null) => void;
}

export const RadiusPicker = ({ radius, onChange }: RadiusPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onChange(val > 0 ? val : null);
  };

  const displayValue = radius || 50; // Default visualization if null

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border rounded-lg transition-all shadow-sm ${
          radius
            ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
            : "border-neutral-200 dark:border-neutral-300 bg-white dark:bg-neutral-300 text-neutral-600 dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-200"
        }`}
      >
        <CircleDot className="w-4 h-4" />
        <span className="text-xs font-medium whitespace-nowrap">
          <span className="sm:hidden">{displayValue}</span>
          <span className="hidden sm:inline">{displayValue} km</span>
        </span>
      </button>

      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown / Modal Card */}
          {/* Note: Modified widht from min-w-[600px] to w-[320px] for radius picker as it doesn't need to be huge */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90vw] max-w-[340px] sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:mt-2 sm:z-50 sm:w-[320px] p-6 bg-white dark:bg-neutral-200 border border-neutral-100 dark:border-neutral-200 rounded-2xl shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-900">
                  {t("common.radius")}
                </label>
                <span className="text-sm font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
                  {displayValue} km
                </span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={displayValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-neutral-100 dark:bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-brand-primary hover:accent-brand-primary/90 transition-all"
              />

              <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium px-1">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-50 dark:border-neutral-300 flex justify-end gap-2">
              <button
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-700 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-transparent rounded-lg transition-colors"
              >
                {t("common.clear")}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-brand-primary rounded-lg shadow-sm shadow-brand-primary/20 hover:opacity-90 transition-opacity"
              >
                {t("common.done")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
