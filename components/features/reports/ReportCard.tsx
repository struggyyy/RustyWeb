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
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// External libraries
import { MapPin, Check, X, Clock, FileCheck } from "lucide-react";

// Internal imports
import { Report } from "@/lib/types/reports";
import { getCityFromCoordinates } from "@/lib/services/geocoding";

interface ReportCardProps {
  report: Report;
  isAdmin: boolean;
  onDetailsPress: (report: Report) => void;
}

export default function ReportCard({
  report,
  isAdmin,
  onDetailsPress,
}: ReportCardProps) {
  const { t, i18n } = useTranslation();
  const [cityName, setCityName] = useState<string>(t("reports.loading"));
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function fetchCity() {
      if (report.location) {
        const city = await getCityFromCoordinates(
          report.location.latitude,
          report.location.longitude
        );
        setCityName(city);
      } else {
        setCityName(t("reports.unknownLocation"));
      }
    }
    fetchCity();
  }, [report.location]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />;
      case "Accepted":
        return (
          <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-status-Accepted" />
        );
      case "Completed":
        return (
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-status-Completed" />
        );
      case "Canceled":
        return <X className="w-4 h-4 sm:w-5 sm:h-5 text-status-Canceled" />;
      default:
        return null; // For Accepted or others without specific icon
    }
  };

  return (
    <div
      onClick={() => onDetailsPress(report)}
      className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-700/60 shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] p-3 sm:p-5 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="flex flex-row items-center gap-3 md:gap-4 relative z-10">
        {/* Image Section - Fluid Size */}
        <div
          className={`w-24 h-24 min-[450px]:w-32 min-[450px]:h-28 sm:w-40 sm:h-32 bg-white/50 dark:bg-neutral-800/50 rounded-xl overflow-hidden flex-shrink-0 border border-white/50 dark:border-white/10 relative shadow-inner ${
            !imageLoaded && report.imageUrl ? "animate-pulse" : ""
          }`}
        >
          <div className="absolute inset-0">
            {report.imageUrl && !imageLoaded && (
              <div className="absolute inset-0 bg-neutral-200" />
            )}
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt="Report"
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-in-out ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-neutral-300" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-row items-center justify-between py-1 gap-2">
          {/* Left Info Group (Date & Location) */}
          <div className="flex flex-col gap-1 items-start w-full">
            {/* Date */}
            <div className="text-sm min-[450px]:text-base sm:text-lg md:text-xl font-bold text-neutral-800 dark:text-white leading-tight mb-0.5">
              {formatDate(report.createdAt)}
            </div>

            {/* City Name (Geocoded) */}
            <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-200 font-semibold text-xs min-[450px]:text-sm sm:text-base">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary" />
              <span className="truncate max-w-[120px] min-[450px]:max-w-[180px] sm:max-w-none">
                {cityName}
              </span>
            </div>

            {/* Coordinates */}
            <div className="text-[10px] min-[450px]:text-xs text-neutral-400 dark:text-neutral-200 font-mono pl-0.5">
              {report.location
                ? `${report.location.latitude.toFixed(
                    2
                  )}, ${report.location.longitude.toFixed(2)}`
                : t("reports.noLocation")}
            </div>
          </div>

          {/* Right Actions Group (Status & Points) */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-3 h-full justify-center pl-2">
            {/* Status Badge */}
            <div className="self-center">
              <span
                className={`px-2 py-0.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs min-[800px]:text-sm font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(
                  report.status
                )} bg-current/10`}
              >
                {t(`reports.status${report.status}`)}
              </span>
            </div>

            {/* Points (Always visible under status) */}
            {!isAdmin && (
              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-600 dark:text-white mt-1">
                {report.status === "Submitted" ? (
                  getStatusIcon("Submitted")
                ) : report.status === "Canceled" ? (
                  getStatusIcon("Canceled")
                ) : (
                  <>
                    {getStatusIcon(report.status)}
                    <span>
                      {report.points} {t("reports.pts")}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
