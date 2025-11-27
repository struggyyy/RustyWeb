"use client";

import { Report } from "@/types/reports";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

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
    <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-all hover:bg-white/95">
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        {/* Image Section */}
        <div className="w-32 h-32 sm:w-48 sm:h-36 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100 relative">
          <div className="absolute inset-0">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt="Report"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col items-end sm:flex-row sm:items-center sm:justify-between py-1 gap-2">
          
          {/* Left Info Group (Date & Location) */}
          <div className="flex flex-col gap-1 items-end sm:items-start">
            {/* Date */}
            <div className="text-base sm:text-xl font-bold text-neutral-700 leading-tight text-right sm:text-left">
              {formatDate(report.createdAt)}
            </div>

            {/* Location - Hidden on Mobile */}
            <div className="hidden sm:flex text-xs sm:text-base text-neutral-400 items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {report.location ? `${report.location.latitude.toFixed(2)}, ${report.location.longitude.toFixed(2)}` : 'No location'}
              </span>
            </div>

            {/* Points (Desktop) */}
            {!isAdmin && (
              <div className="hidden sm:flex items-center gap-2 mt-1">
                {getStatusIcon(report.status)}
                {report.status === "Submitted" && (
                  <span className="text-sm text-neutral-400 italic">Awaiting review...</span>
                )}
                {report.status !== "Submitted" && report.status !== "Canceled" && (
                  <span className="text-sm font-bold text-neutral-600">
                    {report.points} pts
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Actions Group (Status & Button) */}
          <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* Status Badge */}
            <div className="self-end sm:self-auto">
              <span className={`px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(report.status)} bg-current/10`}>
                {report.status}
              </span>
            </div>

            {/* Points (Mobile) */}
            {!isAdmin && (
              <div className="sm:hidden flex items-center gap-2">
                {getStatusIcon(report.status)}
                {report.status === "Submitted" && (
                  <span className="text-xs text-neutral-400 italic">Awaiting review...</span>
                )}
                {report.status !== "Submitted" && report.status !== "Canceled" && (
                  <span className="text-xs font-bold text-neutral-600">
                    {report.points} pts
                  </span>
                )}
              </div>
            )}

            {/* Button */}
            <div className="w-auto">
              {!isAdmin ? (
                <button
                  onClick={() => onDetailsPress(report)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-xs sm:text-base"
                >
                  Details
                </button>
              ) : (
                <button
                  onClick={() => onDetailsPress(report)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
                >
                  View
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
