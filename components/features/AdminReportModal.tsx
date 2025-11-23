"use client";

import { useState } from "react";
import { Report, ReportStatus, reportStatuses } from "@/types/reports";
import { X, Trash2 } from "lucide-react";

interface AdminReportModalProps {
  report: Report;
  onClose: () => void;
  onStatusUpdate: (newStatus: ReportStatus) => void;
  onDelete: () => void;
}

export default function AdminReportModal({
  report,
  onClose,
  onStatusUpdate,
  onDelete,
}: AdminReportModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report.status);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Submitted": return "bg-status-Submitted/10 text-status-Submitted border-status-Submitted/20";
      case "Accepted": return "bg-status-Accepted/10 text-status-Accepted border-status-Accepted/20";
      case "Completed": return "bg-status-Completed/10 text-status-Completed border-status-Completed/20";
      case "Canceled": return "bg-status-Canceled/10 text-status-Canceled border-status-Canceled/20";
      default: return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  };

  const handleStatusClick = (status: ReportStatus) => {
    setSelectedStatus(status);
    onStatusUpdate(status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-700">Report Details</h2>
          <div className="flex items-center gap-2">
            {report.status === "Canceled" && (
              <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete report"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Date */}
          <div className="px-6 py-4">
            <div className={`text-xl font-bold px-3 py-2 rounded-lg inline-block ${getStatusColor(report.status)}`}>
              {formatDate(report.createdAt)}
            </div>
          </div>

          {/* Image */}
          <div className="px-6">
            <div className="w-full h-48 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt="Report"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-neutral-400">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Description
              </label>
              <p className="text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                {report.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                User
              </label>
              <p className="text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                {report.userEmail || report.userId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Location
              </label>
              <p className="text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                {report.location
                  ? `${report.location.latitude.toFixed(6)}, ${report.location.longitude.toFixed(6)}`
                  : 'No location'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="border-t border-neutral-100 p-6">
          <label className="block text-sm font-semibold text-neutral-600 mb-3">
            Update Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {reportStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                disabled={status === report.status}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  status === report.status
                    ? `${getStatusColor(status)} cursor-not-allowed opacity-75`
                    : `bg-neutral-100 text-neutral-600 hover:bg-neutral-200`
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
