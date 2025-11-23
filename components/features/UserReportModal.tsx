"use client";

import { Report } from "@/types/reports";
import { X, Trash2 } from "lucide-react";

interface UserReportModalProps {
  report: Report;
  onClose: () => void;
  onDelete: () => void;
}

export default function UserReportModal({
  report,
  onClose,
  onDelete,
}: UserReportModalProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "bg-status-Submitted/10 text-status-Submitted";
      case "Accepted": return "bg-status-Accepted/10 text-status-Accepted";
      case "Completed": return "bg-status-Completed/10 text-status-Completed";
      case "Canceled": return "bg-status-Canceled/10 text-status-Canceled";
      default: return "bg-neutral-100 text-neutral-500";
    }
  };

  const getStatusNote = (status: string) => {
    switch (status) {
      case "Submitted":
        return "Your report has been submitted and is awaiting review by our team.";
      case "Accepted":
        return "Your report has been accepted and is being processed.";
      case "Completed":
        return "Your report has been completed successfully. Thank you for helping improve your community!";
      case "Canceled":
        return "This report has been canceled.";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-700">Report Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete report"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto">
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
                Status
              </label>
              <div className={`inline-flex items-center px-3 py-2 rounded-lg font-semibold ${getStatusColor(report.status)}`}>
                {report.status}
              </div>
              <p className="text-sm text-neutral-500 mt-2 italic">
                {getStatusNote(report.status)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Points Earned
              </label>
              <p className="text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                {report.points} points
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
