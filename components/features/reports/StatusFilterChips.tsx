"use client";

import { ReportStatus, reportStatuses } from "@/lib/types/reports";

interface StatusFilterChipsProps {
  selectedStatuses: ReportStatus[];
  onStatusesChange: (statuses: ReportStatus[]) => void;
}

export default function StatusFilterChips({
  selectedStatuses,
  onStatusesChange,
}: StatusFilterChipsProps) {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Submitted":
        return "bg-status-Submitted/10 text-status-Submitted border-status-Submitted/20";
      case "Accepted":
        return "bg-status-Accepted/10 text-status-Accepted border-status-Accepted/20";
      case "Completed":
        return "bg-status-Completed/10 text-status-Completed border-status-Completed/20";
      case "Canceled":
        return "bg-status-Canceled/10 text-status-Canceled border-status-Canceled/20";
      default:
        return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  };

  const handleShowAllPress = () => {
    onStatusesChange([]);
  };

  const handleStatusToggle = (status: ReportStatus) => {
    if (!selectedStatuses || selectedStatuses.length === 0) {
      onStatusesChange([status]);
      return;
    }
    const exists = selectedStatuses.includes(status);
    let next = exists
      ? selectedStatuses.filter((s: ReportStatus) => s !== status)
      : [...selectedStatuses, status];
    // If all statuses are selected, collapse to Show All (empty selection)
    if (next.length === reportStatuses.length) {
      next = [];
    }
    onStatusesChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={handleShowAllPress}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedStatuses.length === 0
            ? "bg-brand-primary text-white"
            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        }`}
      >
        Show All
      </button>
      {reportStatuses.map((status) => {
        const isSelected = selectedStatuses?.includes(status) ?? false;
        return (
          <button
            key={status}
            onClick={() => handleStatusToggle(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? `${getStatusColor(status)} border-2`
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
