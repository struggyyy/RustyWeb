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
import React from "react";

// Internal imports
import { Report } from "@/lib/types/reports";
import ReportCard from "@/components/features/reports/ReportCard";
import ReportCardSkeleton from "@/components/features/reports/ReportCardSkeleton";

interface ReportsGridProps {
  reports: Report[];
  onDetailsPress: (report: Report) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
  emptyState: React.ReactNode;
}

export default function ReportsGrid({
  reports,
  onDetailsPress,
  isLoading = false,
  isAdmin = false,
  emptyState,
}: ReportsGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 max-w-4xl w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (reports.length === 0) {
    return <>{emptyState}</>;
  }

  // Reports list
  return (
    <div className="grid gap-4 sm:gap-6 max-w-4xl w-full">
      {reports.map((report) => (
        <div
          key={report.id}
          className="transform transition-all duration-300 hover:scale-[1.01]"
        >
          <ReportCard
            report={report}
            isAdmin={isAdmin}
            onDetailsPress={onDetailsPress}
          />
        </div>
      ))}
    </div>
  );
}
