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

// External libraries
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal imports
import LanguageToggle from "@/components/common/LanguageToggle";

interface ProfileFormProps {
  isEditing: boolean;
  nickname: string;
  email?: string;
  language: string;
  error?: string;
  onNicknameChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
}

export default function ProfileForm({
  isEditing,
  nickname,
  email,
  language,
  error,
  onNicknameChange,
  onLanguageChange,
}: ProfileFormProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full space-y-6 text-center">
      {/* Display mode */}
      {!isEditing ? (
        <div className="space-y-1 animate-in fade-in duration-300">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-800 dark:text-white tracking-tight">
            {nickname || t("profile.anonymousUser")}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-300 font-medium">
            {email}
          </p>

          <div className="pt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-full border border-neutral-200/50 dark:border-neutral-700/50 dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Globe className="w-4 h-4 text-neutral-400 dark:text-neutral-300" />
              <span className="text-sm font-bold text-neutral-600 dark:text-white">
                {language === "en" ? "English" : "Polski"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Edit mode
        <div className="space-y-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-neutral-400 dark:text-white uppercase tracking-wider ml-1">
              {t("profile.nickname")}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-200 border border-neutral-200 dark:border-neutral-200 rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary font-bold text-neutral-800 dark:text-neutral-900 placeholder:text-neutral-400 transition-all h-12"
              placeholder={t("profile.nicknamePlaceholder")}
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-neutral-400 dark:text-white uppercase tracking-wider ml-1">
              {t("nav.language")}
            </label>
            <LanguageToggle
              variant="long"
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
          {t(error)}
        </div>
      )}
    </div>
  );
}
