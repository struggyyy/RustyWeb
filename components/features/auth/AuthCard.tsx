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
// React-specific imports
import React from "react";

// Internal imports
import LanguageToggle from "@/components/common/LanguageToggle";

interface AuthCardProps {
  children: React.ReactNode;
  showLanguageToggle?: boolean;
}

export default function AuthCard({
  children,
  showLanguageToggle = true,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      {/* 
        Glassmorphism Card Container
        - bg-neutral-50/60 & dark:bg-neutral-900/60: Base semi-transparent background
        - backdrop-blur-2xl: Strong blur for the glass effect
        - shadow-2xl: Deep shadow for depth
        - border border-white/60: Subtle border to define edges
        - relative overflow-hidden: Contains the inner gradient overlay
      */}
      <div className="max-w-md w-full bg-neutral-50/60 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] p-4 min-[600px]:p-10 border border-white/60 dark:border-neutral-700/60 relative overflow-hidden">
        {/* Inner Gradient Overlay for shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

        {showLanguageToggle && (
          <div className="absolute top-4 right-4 z-10">
            <LanguageToggle variant="regular" className="w-24" />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
