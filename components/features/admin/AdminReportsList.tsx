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
import ReportCard from "@/components/features/reports/ReportCard";
import AdminEmptyState from "./AdminEmptyState";

interface AdminReportsListProps {
  filteredReports: Report[];
  onDetailsPress: (report: Report) => void;
  hasFilters: boolean;
}

export default function AdminReportsList({
  filteredReports,
  onDetailsPress,
  hasFilters,
}: AdminReportsListProps) {
  // Reports grid
  return (
    <div className="flex-1 grid gap-4 sm:gap-6 max-w-4xl pb-8">
      {filteredReports.length === 0 ? (
        <AdminEmptyState hasFilters={hasFilters} />
      ) : (
        filteredReports.map((report) => (
          <div
            key={report.id}
            className="transform transition-all duration-300 hover:scale-[1.01]"
          >
            <ReportCard
              report={report}
              isAdmin={true}
              onDetailsPress={onDetailsPress}
            />
          </div>
        ))
      )}
    </div>
  );
}
