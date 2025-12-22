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

// Internal imports
import { ReportStatus, reportStatuses } from "@/lib/types/reports";

interface AdminStatusFilterProps {
  selectedStatuses: ReportStatus[];
  setSelectedStatuses: (statuses: ReportStatus[]) => void;
  filteredCount: number;
}

export function AdminStatusFilter({
  selectedStatuses,
  setSelectedStatuses,
  filteredCount,
}: AdminStatusFilterProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-status-Submitted/10 text-status-Submitted";
      case "Accepted":
        return "bg-status-Accepted/10 text-status-Accepted";
      case "Completed":
        return "bg-status-Completed/10 text-status-Completed";
      case "Canceled":
        return "bg-status-Canceled/10 text-status-Canceled";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* 'All' Button */}
      <button
        onClick={() => setSelectedStatuses([])}
        className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
          selectedStatuses.length === 0
            ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
            : "bg-white dark:bg-neutral-300 border border-neutral-200 dark:border-neutral-300 text-neutral-600 dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-200"
        }`}
      >
        {t("common.all")}
      </button>

      {/* Status Buttons */}
      {reportStatuses.map((status) => {
        const isSelected = selectedStatuses.includes(status);
        return (
          <button
            key={status}
            onClick={() => {
              const exists = selectedStatuses.includes(status);
              let next = exists
                ? selectedStatuses.filter((s) => s !== status)
                : [...selectedStatuses, status];
              if (next.length === reportStatuses.length) next = [];
              setSelectedStatuses(next);
            }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              isSelected
                ? getStatusColor(status) + " ring-1 ring-current shadow-sm"
                : "bg-white dark:bg-neutral-300 border border-neutral-200 dark:border-neutral-300 text-neutral-600 dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-200"
            }`}
          >
            {t(`reports.status${status}`)}
          </button>
        );
      })}

      {/* Count Badge */}
      <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-200 rounded-full border border-neutral-200 dark:border-neutral-200 shadow-sm animate-in fade-in zoom-in duration-300 flex items-center justify-center">
        <span className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-black">
          {filteredCount}
        </span>
      </div>
    </div>
  );
}
