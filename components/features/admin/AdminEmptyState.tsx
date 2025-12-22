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
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

interface AdminEmptyStateProps {
  hasFilters: boolean;
}

export default function AdminEmptyState({ hasFilters }: AdminEmptyStateProps) {
  const { t } = useTranslation();

  // Empty State Container with Dashed Border
  return (
    <div className="bg-white/80 dark:bg-neutral-900/40 backdrop-blur-md rounded-3xl p-8 sm:p-16 text-center border-2 border-dashed border-neutral-200 dark:border-white/30 mt-4 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.2)]">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-black/5 dark:ring-white/10">
        <Search className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300 dark:text-white/80" />
      </div>
      <h3 className="text-lg sm:text-2xl font-bold text-neutral-700 dark:text-white mb-3">
        {hasFilters ? t("reports.noReportsFound") : t("reports.noReportsYet")}
      </h3>
      <p className="text-neutral-400 dark:text-neutral-200 max-w-md mx-auto text-sm sm:text-lg font-medium">
        {hasFilters
          ? t("reports.noReportsFoundDesc")
          : t("reports.noReportsDesc")}
      </p>
    </div>
  );
}
