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

// external imports
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

// internal imports
// internal imports
import CustomCursor from "@/components/common/CustomCursor";
import TutorialCarousel from "@/components/home/TutorialCarousel";
import { useState, useEffect, useRef } from "react";
import i18n from "@/lib/i18n/i18n";

// Generate 19 tutorial steps for each language
const ALL_TUTORIAL_STEPS_EN = Array.from(
  { length: 19 },
  (_, i) => `/images/en/en${i + 1}.png`
);

const ALL_TUTORIAL_STEPS_PL = Array.from(
  { length: 19 },
  (_, i) => `/images/pl/pl${i + 1}.png`
);

export default function Page() {
  const { t } = useTranslation();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Determine current images based on language
  const currentLanguage = i18n.language || "en";
  const allImages =
    currentLanguage === "pl" ? ALL_TUTORIAL_STEPS_PL : ALL_TUTORIAL_STEPS_EN;

  // LOGIC CHANGE:
  // 1. The Carousel's first slide (Index 0) is "en2" (allImages[1]).
  //    This ensures that when we scroll, "en2" slides out cleanly to "en3".
  // 2. We use "en1" (coverImage) as a static Overlay on top.
  //    - Idle: Overlay is Opacity 100 (Hides en2).
  //    - Hover: Overlay fades to Opacity 0 (Reveals en2).
  const coverImage = allImages[0];
  const carouselImages = [allImages[1], ...allImages.slice(2)];

  // Reset loaded images when language changes, ensuring we re-verify loading for new srcs
  useEffect(() => {
    setLoadedImages(new Set());
    // We do NOT reset carouselIndex here, to preserve the user's progress across languages
  }, [currentLanguage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* One-time auto-reveal state (7s delay) */
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false);
  const hasInteracted = useRef(false);

  /* Image Loading State to prevent black screens */
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  useEffect(() => {
    // 7 second timer to reveal the preview (en2) once
    const timer = setTimeout(() => {
      // Only reveal if user hasn't interacted yet and we are on the first slide
      if (!hasInteracted.current && carouselIndex === 0) {
        setHasAutoRevealed(true);
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  // Prevent hydration mismatch for language dependent content if needed,
  // but simpler to just render.
  // Note: accessing i18n.language directly in render might cause hydration mismatch
  // if server sees 'en' and client sees 'pl'.
  // Ideally we use a hook or suppress warning if it flips.
  // For now let's use the hook value but ensure it matches.

  // Clock logic
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Battery logic
  const [batteryLevel, setBatteryLevel] = useState(1);

  useEffect(() => {
    // Cast navigator to any because getBattery is not standard in all TS definitions
    const nav: any = navigator;
    if (nav.getBattery) {
      nav.getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(battery.level);
        };
        // Initial set
        updateBattery();
        // Listeners
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
      });
    }
  }, []);

  /* Scroll interception logic */
  const isHoveringPhone = useRef(false);
  const isScrollLocked = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isHoveringPhone.current) {
        e.preventDefault();

        // 1. Trigger immediately on the first event if not locked.
        if (!isScrollLocked.current) {
          let nextIndex = carouselIndex;
          if (e.deltaY > 0) {
            nextIndex = (carouselIndex + 1) % carouselImages.length;
          } else {
            nextIndex =
              carouselIndex === 0
                ? carouselImages.length - 1
                : carouselIndex - 1;
          }

          // Check if target image is loaded
          if (loadedImages.has(nextIndex)) {
            setCarouselIndex(nextIndex);
            isScrollLocked.current = true;
          }
          // If not loaded, we purposefully do nothing (block scroll)
        }

        // 2. Clear any pending unlock timer.
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        // 3. Set a new timer to unlock only after scrolling STOPS (150ms silence).
        // This ensures the entire inertial tail of a smooth scroll counts as one gesture.
        scrollTimeout.current = setTimeout(() => {
          isScrollLocked.current = false;
        }, 150);
      }
    };

    // Attach to window to ensure we capture the event regardless of bubbling/z-index
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [carouselImages.length]);

  if (!mounted) {
    return null; // or a loading skeleton to be safe against hydration mismatch
  }

  return (
    <div className="min-h-screen min-[960px]:h-screen flex flex-col relative overflow-x-hidden min-[960px]:overflow-hidden font-sans cursor-none">
      <CustomCursor />

      {/* Global Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 z-50 bg-transparent">
        <div
          className="h-full bg-brand-primary transition-all duration-500 ease-out shadow-[0_0_10px_var(--brand-primary)]"
          style={{
            width: `${((carouselIndex + 1) / carouselImages.length) * 100}%`,
          }}
        />
      </div>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-8 pt-8 pb-2 min-[960px]:pb-0 flex justify-center pt-16 min-[960px]:pt-24 overflow-x-hidden overflow-y-auto min-h-[calc(100vh-2rem)] md:min-h-0">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-[var(--gap-fluid)] w-full max-w-5xl lg:max-w-[1600px] min-[960px]:h-full">
          {/* Left Side - CTA */}
          <div className="w-auto flex flex-col items-start space-y-4 z-10 md:pb-48">
            {/* Slogan and Buttons Container */}
            <div className="flex flex-col items-start">
              <h1
                suppressHydrationWarning
                className="text-fluid-title font-black text-neutral-900 dark:text-white leading-[0.9] tracking-tighter whitespace-nowrap"
              >
                {t("home.title")}{" "}
                <span
                  suppressHydrationWarning
                  className="block text-fluid-subtitle text-neutral-400 dark:text-neutral-200 mt-2"
                >
                  {t("home.subtitle")}
                </span>
              </h1>

              <div className="flex gap-3 md:gap-4 items-center mt-2 md:mt-3">
                <Link
                  href="/signup"
                  className="px-[var(--padding-button-horizontal)] py-[var(--padding-button-vertical)] bg-brand-primary text-white dark:text-black text-fluid-button font-black uppercase tracking-wider rounded-2xl shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:opacity-90 hover:scale-105 transition-all transform flex items-center justify-center whitespace-nowrap"
                >
                  <span suppressHydrationWarning>{t("home.joinUs")}</span>
                </Link>
                <Link
                  href="/download"
                  className="px-[var(--padding-button-horizontal)] py-[var(--padding-button-vertical)] bg-[#CECECE] dark:bg-neutral-300 text-white dark:text-black text-fluid-button font-black uppercase tracking-wider rounded-2xl shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-neutral-300 dark:hover:bg-neutral-200 hover:scale-105 transition-all transform flex items-center justify-center whitespace-nowrap"
                >
                  <span suppressHydrationWarning>{t("home.downloadApp")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="w-full md:w-[320px] flex justify-center relative md:mt-0 flex-shrink-0 min-[960px]:h-full items-center">
            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neutral-50 rounded-full blur-3xl -z-10" />

            {/* Phone Bezel - Responsive with maintained aspect ratio */}
            <div
              onMouseEnter={() => {
                isHoveringPhone.current = true;
                hasInteracted.current = true;
                setHasAutoRevealed(false); // Revert to standard behavior immediately
              }}
              onMouseLeave={() => {
                isHoveringPhone.current = false;
              }}
              className="group relative w-[320px] h-[700px] min-[960px]:w-auto min-[960px]:h-full min-[960px]:max-h-full min-[960px]:aspect-[320/700] bg-neutral-900 rounded-[2.5rem] border-[8px] border-neutral-900 shadow-2xl overflow-hidden ring-4 ring-neutral-100/50 flex-shrink-0 flex flex-col"
            >
              {/* Status Bar Area - Separate from content */}
              <div className="w-full h-5 bg-[#666666] flex justify-between items-center px-4 relative shrink-0 z-40">
                <span className="text-white text-[11px] font-bold tracking-wide w-10 text-center">
                  {currentTime}
                </span>

                {/* Punch Hole Camera - Centered in status bar */}
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black rounded-full shadow-sm flex items-center justify-center ring-1 ring-white/10">
                  <div className="w-2 h-2 rounded-full bg-[#0a0a0a] ring-1 ring-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-1 bg-gradient-to-tr from-transparent via-blue-400/20 to-transparent rounded-full" />
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-90">
                  {/* Battery Only - Rounded Style */}
                  <div className="w-5 h-2.5 border-[1.5px] border-white/80 rounded-full flex items-center p-[1.5px] relative overflow-hidden">
                    <div
                      className="h-full bg-white rounded-l-full transition-all duration-500"
                      style={{ width: `${batteryLevel * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* COVER OVERLAY (en1) */}
              {/* Visible ONLY at Index 0. Fades OUT on Hover OR Loop to reveal Carousel (en2). */}
              {carouselIndex === 0 && (
                <div
                  className={`absolute inset-x-0 bottom-0 top-5 z-30 pointer-events-none transition-opacity duration-500 ease-in-out ${
                    hasAutoRevealed
                      ? "opacity-0"
                      : "opacity-100 group-hover:opacity-0"
                  }`}
                >
                  <Image
                    src={coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Carousel Container - Fills remaining space */}
              <div className="flex-1 w-full relative bg-black overflow-hidden">
                <TutorialCarousel
                  images={carouselImages}
                  currentIndex={carouselIndex}
                  onIndexChange={setCarouselIndex}
                  onImageLoad={handleImageLoad}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 min-[960px]:py-6 text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest">
        <span suppressHydrationWarning>{t("common.footer")}</span>
      </footer>
    </div>
  );
}
