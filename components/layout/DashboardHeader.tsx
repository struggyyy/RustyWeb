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
import Link from "next/link";
import { User, MoreHorizontal, X, LogOut } from "lucide-react";

// Internal imports
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logOut, user, updateUserProfile } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    updateUserProfile({ language: lang }).catch(console.error);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 px-4 pt-4 pb-2 md:px-10 md:pt-8 md:pb-10 z-50 flex justify-end items-start pointer-events-none">
      {/* Right Side - Actions */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative z-50 w-10 h-10 md:w-12 md:h-12 backdrop-blur-2xl border rounded-full flex items-center justify-center transition-all shadow-xl
            ${
              isOpen
                ? "bg-white/80 border-white shadow-brand-primary/20"
                : "bg-white/60 border-white/60 hover:bg-white/80 hover:scale-105"
            }`}
          >
            <div className="relative w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <MoreHorizontal
                className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100 text-neutral-500"
                }`}
              />
              <X
                className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "opacity-100 rotate-0 scale-100 text-neutral-900"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="fixed top-16 left-0 right-0 mx-auto w-72 min-[550px]:absolute min-[550px]:top-12 min-[550px]:right-0 min-[550px]:left-auto min-[550px]:mx-0 md:top-14 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top min-[550px]:origin-top-right z-40">
              {/* Liquid Glass Shine Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1">
                {/* Language Toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-100/50 mb-1">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                    <Globe className="w-4 h-4 text-neutral-400" />
                    {t("settings.language")}
                  </div>
                  <div className="flex bg-neutral-100/50 rounded-lg p-0.5 border border-white/40">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                        i18n.language === "en"
                          ? "bg-white shadow-sm text-neutral-900"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange("pl")}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                        i18n.language === "pl"
                          ? "bg-white shadow-sm text-neutral-900"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      PL
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={() => logOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50 rounded-xl transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                  {t("auth.logout")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Picture / User Icon */}
        <Link
          href="/settings"
          className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all shadow-xl"
        >
          <User className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
        </Link>
      </div>
    </header>
  );
}
