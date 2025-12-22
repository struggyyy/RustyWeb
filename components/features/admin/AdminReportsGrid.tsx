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

// Internal imports
import { Report } from "@/lib/types/reports";
import ReportsGrid from "@/components/features/reports/ReportsGrid";
import AdminEmptyState from "./AdminEmptyState";

interface AdminReportsGridProps {
  filteredReports: Report[];
  onDetailsPress: (report: Report) => void;
  hasFilters: boolean;
}

export default function AdminReportsGrid({
  filteredReports,
  onDetailsPress,
  hasFilters,
}: AdminReportsGridProps) {
  // Wrapper for shared grid
  return (
    <div className="flex-1 pb-8 w-full max-w-4xl">
      <ReportsGrid
        reports={filteredReports}
        onDetailsPress={onDetailsPress}
        isAdmin={true}
        emptyState={<AdminEmptyState hasFilters={hasFilters} />}
      />
    </div>
  );
}
