"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";

interface TutorialCarouselProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onImageLoad: (index: number) => void;
}

export default function TutorialCarousel({
  images,
  currentIndex,
  onIndexChange,
  onImageLoad,
}: TutorialCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);

  // --- Navigation Logic ---

  const nextSlide = useCallback(() => {
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, onIndexChange, images.length]);

  const prevSlide = useCallback(() => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, onIndexChange, images.length]);
  // ... (skip unchanged handlers) ...
  // ... (Render Block)
  {
    images.map((src, index) => (
      <div key={index} className="w-full h-full flex-shrink-0 relative">
        <Image
          src={src}
          alt={`Tutorial step ${index + 1}`}
          fill
          className="object-cover"
          priority={index === 0}
          loading="eager" // Load off-screen images immediately
          onLoadingComplete={() => onImageLoad(index)}
          draggable={false}
        />
      </div>
    ));
  }

  // --- Interaction Handlers ---

  // 1. Click Zones (Left 30% / Right 70%)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  // 2. Mouse Scroll (Debounced)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 500) return; // 500ms debounce

      if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        lastScrollTime.current = now;
      }
    },
    [nextSlide, prevSlide]
  );

  // 3. Swipe Support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // --- Preloading ---
  useEffect(() => {
    if (images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;

    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };

    preloadImage(images[nextIndex]);
    preloadImage(images[prevIndex]);
  }, [currentIndex, images]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black select-none cursor-pointer group"
      onClick={handleContainerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={(e) => {
        const now = Date.now();
        if (now - lastScrollTime.current > 500 && Math.abs(e.deltaY) > 20) {
          if (e.deltaY > 0) nextSlide();
          else prevSlide();
          lastScrollTime.current = now;
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={src}
              alt={`Tutorial step ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              loading="eager"
              onLoadingComplete={() => onImageLoad(index)}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
