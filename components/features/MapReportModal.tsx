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
import { useState } from "react";

// External libraries
import { X, Navigation, Eye, ChevronLeft, ChevronRight } from "lucide-react";

// Internal imports
import { Report } from "@/types/reports";

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
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "text-status-Submitted";
      case "Accepted":
        return "text-status-Accepted";
      case "Completed":
        return "text-status-Completed";
      case "Canceled":
        return "text-status-Canceled";
      default:
        return "text-neutral-500";
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // Fallback to Google Maps navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${report.location.latitude},${report.location.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-xl font-black text-neutral-800 tracking-tight">
            Map Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Date */}
          <div
            className={`text-lg font-bold text-left mb-4 pl-1 ${getStatusTextColor(
              report.status
            )}`}
          >
            {formatDate(report.createdAt)}
          </div>

          {/* Image */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm relative mb-4 bg-neutral-100 border border-neutral-100">
            {report.imageUrl && !imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full animate-pulse bg-neutral-200" />
              </div>
            )}
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt="Report"
                className={`w-full h-full object-cover block transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium">
                No image
              </div>
            )}
          </div>

          {/* Navigation controls for multiple reports */}
          {hasMultiple && (
            <div className="flex items-center justify-between mb-4 bg-neutral-50 p-2 rounded-xl">
              <button
                onClick={onPrev}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                disabled={!onPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                Multiple Here
              </span>
              <button
                onClick={onNext}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-50"
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
              className="flex-1 bg-brand-primary text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 bg-white border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl font-bold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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
