"use client";

import { Report } from "@/types/reports";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

interface ReportCardProps {
  report: Report;
  isAdmin: boolean;
  onDetailsPress: (report: Report) => void;
}

export default function ReportCard({ report, isAdmin, onDetailsPress }: ReportCardProps) {
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
      case "Submitted": return "text-status-Submitted";
      case "Accepted": return "text-status-Accepted";
      case "Completed": return "text-status-Completed";
      case "Canceled": return "text-status-Canceled";
      default: return "text-neutral-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Canceled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-all hover:bg-white/95">
      <div className="flex items-center gap-4">
        {/* Image Section */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt="Report"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Date */}
              <div className="text-lg sm:text-xl font-bold text-neutral-700 mb-1">
                {formatDate(report.createdAt)}
              </div>

              {/* Location */}
              <div className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {report.location ? `${report.location.latitude.toFixed(2)}, ${report.location.longitude.toFixed(2)}` : 'No location'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0 self-start sm:self-center mt-1 sm:mt-0">
              <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(report.status)} bg-current/10`}>
                {report.status}
              </span>
            </div>
          </div>

          {/* Points or Status Indicator for non-admin users */}
          {!isAdmin && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                {report.status === "Submitted" && (
                  <span className="text-sm text-neutral-400 italic">Awaiting review...</span>
                )}
                {report.status !== "Submitted" && report.status !== "Canceled" && (
                  <span className="text-sm font-bold text-neutral-600">
                    {report.points} points earned
                  </span>
                )}
              </div>

              {/* Details Button */}
              <button
                onClick={() => onDetailsPress(report)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                See Details
              </button>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={() => onDetailsPress(report)}
              className="px-3 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              View
            </button>
          </div>
        )}

        {/* ID - Hidden on very small screens */}
        <div className="hidden md:block text-xs font-medium text-neutral-300 flex-shrink-0 ml-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {report.id.slice(0, 6)}...
          </span>
        </div>
      </div>
    </div>
  );
}
