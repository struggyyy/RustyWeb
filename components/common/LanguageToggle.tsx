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
import { useTranslation } from "react-i18next";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";

interface LanguageToggleProps {
  variant?: "regular" | "long";
  className?: string;
  onLanguageChange?: (lang: string) => void;
}

export default function LanguageToggle({
  variant = "regular",
  className,
  onLanguageChange,
}: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const { user, updateUserProfile } = useAuth();

  const handleLanguageChange = (lang: string) => {
    if (onLanguageChange) {
      onLanguageChange(lang);
    }

    i18n.changeLanguage(lang);
    if (user) {
      updateUserProfile({ language: lang }).catch(console.error);
    }
  };

  const isPolish = i18n.language === "pl";

  // Long variant
  if (variant === "long") {
    return (
      <div
        className={`w-full h-12 p-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-xl flex relative border border-white/40 dark:border-neutral-700/40 ${
          className || ""
        }`}
      >
        {/* Animated Sliding Background */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-700 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            isPolish ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
          } left-1`}
        />

        <button
          onClick={() => handleLanguageChange("en")}
          className={`flex-1 relative z-10 flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-200 ${
            !isPolish
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
          }`}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageChange("pl")}
          className={`flex-1 relative z-10 flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-200 ${
            isPolish
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
          }`}
        >
          Polski
        </button>
      </div>
    );
  }

  // Regular variant
  return (
    <div
      className={`flex bg-neutral-100/50 dark:bg-neutral-900/50 rounded-lg p-0.5 border border-white/40 dark:border-neutral-700/40 relative ${
        className || ""
      }`}
    >
      {/* Animated Sliding Background */}
      <div
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white dark:bg-neutral-800 rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isPolish ? "translate-x-full" : "translate-x-0"
        } left-0.5`}
      />

      <button
        onClick={() => handleLanguageChange("en")}
        className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
          !isPolish
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange("pl")}
        className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
          isPolish
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
        }`}
      >
        PL
      </button>
    </div>
  );
}
