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

// External imports
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Key } from "lucide-react";

// Internal imports
import Header from "@/components/layout/Header";
import CustomCursor from "@/components/common/CustomCursor";

export default function RequestAccessPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden font-sans bg-neutral-50 selection:bg-brand-primary/20 transition-colors duration-300">
      <CustomCursor variant="precise" />
      <Header variant="protected" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Icon Badge */}
          <div className="mx-auto w-24 h-24 rounded-full bg-white dark:bg-neutral-800/50 flex items-center justify-center shadow-[0_20px_50px_rgba(189,81,81,0.25)] dark:shadow-[0_20px_50px_rgba(189,81,81,0.15)] ring-1 ring-black/5 dark:ring-neutral-700 backdrop-blur-3xl">
            <Key className="w-10 h-10 text-brand-primary animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <div
              suppressHydrationWarning
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider"
            >
              {t("requestAccess.comingSoon")}
            </div>

            <h1
              suppressHydrationWarning
              className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight"
            >
              {t("requestAccess.title")}
            </h1>

            <p
              suppressHydrationWarning
              className="text-neutral-500 dark:text-neutral-200 text-lg leading-relaxed"
            >
              {t("requestAccess.description")}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-brand-primary/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span suppressHydrationWarning>{t("requestAccess.back")}</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-primary/5 blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/5 blur-[100px]" />
        </div>
      </main>

      {/* Footer */}
      <footer
        suppressHydrationWarning
        className="w-full py-6 text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest z-10"
      >
        {t("common.footer")}
      </footer>
    </div>
  );
}
