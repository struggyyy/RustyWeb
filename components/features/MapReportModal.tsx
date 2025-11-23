"use client";

import { Report } from "@/types/reports";
import { X, Navigation, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface MapReportModalProps {
  report: Report | null;
  onClose: () => void;
  onViewReport: () => void;
  onNavigate?: () => void;
  hasMultiple?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function MapReportModal({
  report,
  onClose,
  onViewReport,
  onNavigate,
  hasMultiple,
  onPrev,
  onNext,
}: MapReportModalProps) {
  if (!report) return null;

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

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // Fallback to Google Maps navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${report.location.latitude},${report.location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-700">Report Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date */}
          <div className={`text-lg font-bold px-3 py-2 rounded-lg inline-block mb-4 ${getStatusColor(report.status)}`}>
            {formatDate(report.createdAt)}
          </div>

          {/* Image */}
          <div className="w-full h-32 bg-neutral-100 rounded-lg overflow-hidden mb-4 border border-neutral-200">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt="Report"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-neutral-400 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Navigation controls for multiple reports */}
          {hasMultiple && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onPrev}
                className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
                disabled={!onPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-neutral-500">Multiple reports</span>
              <button
                onClick={onNext}
                className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
                disabled={!onNext}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onViewReport}
              className="flex-1 bg-brand-primary text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Report
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-3 rounded-lg font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
