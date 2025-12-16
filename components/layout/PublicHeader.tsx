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
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  User,
  MoreHorizontal,
  X,
  Shield,
  Key,
  Trash2,
  Moon,
  Globe,
  ArrowLeft,
} from "lucide-react";

import { useTheme } from "@/components/context/ThemeProvider";

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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

  // Reset navigation states when pathname changes (navigation completes)
  useEffect(() => {
    setIsNavigating(false);
    setIsGoingBack(false);
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 px-4 pt-4 pb-2 md:px-10 md:pt-8 md:pb-10 z-50 flex justify-between items-start pointer-events-none">
      {/* Left Side - Back Button */}
      <div className="pointer-events-auto">
        {(pathname === "/download" || pathname === "/privacy") && (
          <button
            onClick={() => {
              setIsGoingBack(true);
              setTimeout(() => {
                router.push("/");
              }, 600);
            }}
            className={`relative overflow-hidden w-10 h-10 md:w-12 md:h-12 bg-neutral-50/60 backdrop-blur-2xl border border-white/60 dark:border-neutral-700/60 rounded-full flex items-center justify-center hover:bg-neutral-50/80 hover:scale-105 transition-all duration-500 ease-in-out shadow-xl ${
              isGoingBack
                ? "scale-110 shadow-brand-primary/20 dark:shadow-brand-primary/20"
                : "scale-100 dark:shadow-white/10"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <ArrowLeft
              className={`relative z-10 w-5 h-5 md:w-6 md:h-6 text-neutral-500 dark:text-white transition-all duration-500 ease-in-out ${
                isGoingBack
                  ? "animate-shake-left"
                  : "translate-x-0 opacity-100 scale-100"
              }`}
            />
          </button>
        )}
      </div>

      {/* Right Side - Actions */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative overflow-hidden z-50 w-10 h-10 md:w-12 md:h-12 backdrop-blur-2xl border rounded-full flex items-center justify-center transition-all shadow-xl
            ${
              isOpen
                ? "bg-neutral-50/80 border-white dark:border-neutral-700 shadow-brand-primary/20 dark:shadow-brand-primary/20"
                : "bg-neutral-50/60 border-white/60 dark:border-neutral-700/60 hover:bg-neutral-50/80 hover:scale-105 dark:shadow-white/10"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <div className="relative z-10 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <MoreHorizontal
                className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100 text-neutral-500 dark:text-white"
                }`}
              />
              <X
                className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "opacity-100 rotate-0 scale-100 text-neutral-900 dark:text-white"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="fixed top-16 left-0 right-0 mx-auto w-72 min-[550px]:absolute min-[550px]:top-12 min-[550px]:right-0 min-[550px]:left-auto min-[550px]:mx-0 md:top-14 bg-neutral-50/60 backdrop-blur-2xl border border-white/60 dark:border-neutral-700/60 shadow-2xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top min-[550px]:origin-top-right z-40">
              {/* Liquid Glass Shine Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1">
                {/* Privacy Policy */}
                <Link
                  href="/privacy"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-700/50 rounded-xl transition-colors group"
                >
                  <Shield className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                  {t("nav.privacyPolicy")}
                </Link>

                {/* Request Admin Access */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-700/50 rounded-xl transition-colors group">
                  <Key className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                  {t("nav.requestAdmin")}
                </button>

                {/* Request Account Deletion */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-colors group">
                  <Trash2 className="w-4 h-4 text-red-400 dark:text-red-500 group-hover:text-red-500 transition-colors" />
                  {t("nav.requestAccountDeletion")}
                </button>

                <div className="h-px bg-neutral-200/50 dark:bg-neutral-700/50 my-1 mx-2" />

                {/* Language Toggle */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    <Globe className="w-4 h-4 text-neutral-400" />
                    {t("nav.language")}
                  </div>
                  <div className="flex bg-neutral-100/50 dark:bg-neutral-900/50 rounded-lg p-0.5 border border-white/40 dark:border-neutral-700/40 relative">
                    {/* Animated Sliding Background */}
                    <div
                      className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white dark:bg-neutral-800 rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        i18n.language === "pl"
                          ? "translate-x-full"
                          : "translate-x-0"
                      } left-0.5`}
                    />

                    <button
                      onClick={() => i18n.changeLanguage("en")}
                      className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
                        i18n.language === "en"
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => i18n.changeLanguage("pl")}
                      className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
                        i18n.language === "pl"
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                    >
                      PL
                    </button>
                  </div>
                </div>

                {/* Dark Theme Toggle */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    <Moon className="w-4 h-4 text-neutral-400" />
                    {t("nav.darkTheme")}
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border border-transparent ${
                      isDark
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-neutral-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDark ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setIsNavigating(true);
            setTimeout(() => {
              router.push("/login");
            }, 600);
          }}
          className={`relative overflow-hidden z-10 w-10 h-10 md:w-12 md:h-12 bg-neutral-50/60 backdrop-blur-2xl border border-white/60 dark:border-neutral-700/60 rounded-full flex items-center justify-center hover:bg-neutral-50/80 hover:scale-105 transition-all duration-500 ease-in-out shadow-xl ${
            isNavigating
              ? "scale-110 shadow-brand-primary/20 dark:shadow-brand-primary/20"
              : "scale-100 dark:shadow-white/10"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          <User
            className={`relative z-10 w-5 h-5 md:w-6 md:h-6 text-neutral-500 dark:text-white transition-transform duration-500 ease-in-out ${
              isNavigating ? "rotate-[360deg]" : "rotate-0"
            }`}
          />
        </button>
      </div>
    </nav>
  );
}
