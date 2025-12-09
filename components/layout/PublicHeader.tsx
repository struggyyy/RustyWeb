"use client";

import Link from "next/link";
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
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<"en" | "pl">("en");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
    <nav className="fixed top-0 left-0 right-0 px-4 pt-4 pb-2 md:px-10 md:pt-8 md:pb-10 z-50 flex justify-between items-start pointer-events-none">
      {/* Left Side - Back Button */}
      <div className="pointer-events-auto">
        {(pathname === "/download" || pathname === "/privacy") && (
          <Link
            href="/"
            className="w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
          </Link>
        )}
      </div>

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
                {/* Privacy Policy */}
                <Link
                  href="/privacy"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-white/50 rounded-xl transition-colors group"
                >
                  <Shield className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                  Privacy Policy
                </Link>

                {/* Request Admin Access */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-white/50 rounded-xl transition-colors group">
                  <Key className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                  Request Admin Access
                </button>

                {/* Request Account Deletion */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50 rounded-xl transition-colors group">
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                  Request Account Deletion
                </button>

                <div className="h-px bg-neutral-200/50 my-1 mx-2" />

                {/* Language Toggle */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                    <Globe className="w-4 h-4 text-neutral-400" />
                    Language
                  </div>
                  <div className="flex bg-neutral-100/50 rounded-lg p-0.5 border border-white/40">
                    <button
                      onClick={() => setLanguage("en")}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                        language === "en"
                          ? "bg-white shadow-sm text-neutral-900"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage("pl")}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                        language === "pl"
                          ? "bg-white shadow-sm text-neutral-900"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      PL
                    </button>
                  </div>
                </div>

                {/* Dark Theme Toggle */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                    <Moon className="w-4 h-4 text-neutral-400" />
                    Dark Theme
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border border-transparent ${
                      isDark ? "bg-neutral-800" : "bg-neutral-200"
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

        <Link
          href="/login"
          className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all shadow-xl"
        >
          <User className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
        </Link>
      </div>
    </nav>
  );
}
