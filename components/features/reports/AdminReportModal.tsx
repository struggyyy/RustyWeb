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
import { X, Trash2, Loader2, MapPin, User } from "lucide-react";

// Internal imports
import { Report, ReportStatus, reportStatuses } from "@/lib/types/reports";
import { getCityFromCoordinates } from "@/lib/services/geocoding";
import {
  formatDate,
  getStatusColor,
  getStatusTextColor,
} from "@/lib/utils/reports";

interface AdminReportModalProps {
  report: Report;
  onClose: () => void;
  onStatusUpdate: (newStatus: ReportStatus) => Promise<void>;
  onDelete: () => Promise<void>;
  onShowOnMap: (report: Report) => void;
}

export default function AdminReportModal({
  report,
  onClose,
  onStatusUpdate,
  onDelete,
  onShowOnMap,
}: AdminReportModalProps) {
  const { t, i18n } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cityName, setCityName] = useState<string>("Loading...");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch city name from coordinates
  useEffect(() => {
    async function fetchCity() {
      if (report.location) {
        const city = await getCityFromCoordinates(
          report.location.latitude,
          report.location.longitude,
        );
        setCityName(city);
      } else {
        setCityName("Unknown Location");
      }
    }
    fetchCity();
  }, [report.location]);

  const handleStatusClick = async (status: ReportStatus) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(status);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reusable Status Controls Component
  const StatusControls = () => (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
          {t("admin.updateStatus")}
        </label>
        {isUpdating && (
          <Loader2 className="w-3 h-3 animate-spin text-brand-primary" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {reportStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            disabled={status === report.status || isUpdating}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              status === report.status
                ? `${getStatusColor(status)} shadow-md`
                : "bg-white dark:bg-transparent border-neutral-200 dark:border-neutral-400 text-neutral-600 dark:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white shadow-sm"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {t(`reports.status${status}`)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-200 rounded-[32px] max-w-2xl sm:max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-neutral-100 dark:border-neutral-300 flex-shrink-0">
          <h2 className="text-xl sm:text-3xl font-black text-neutral-800 dark:text-black tracking-tight">
            {t("admin.manage")}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            {report.status === "Canceled" && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                title={t("admin.deleteReport")}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 sm:w-6 sm:h-6" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 text-neutral-400 dark:text-black hover:text-neutral-600 dark:hover:text-black/70 hover:bg-neutral-100 dark:hover:bg-neutral-300 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content - Split View */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden">
          {/* Left Column (Image & Date) */}
          <div className="w-full sm:w-1/2 px-4 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-4 sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-neutral-100 dark:border-neutral-300 flex-shrink-0">
            <div className="flex flex-col gap-4">
              {/* Date */}
              <div
                className={`text-lg font-bold text-left pl-1 ${getStatusTextColor(
                  report.status,
                )}`}
              >
                {formatDate(report.createdAt, i18n.language)}
              </div>

              {/* Image */}
              <div
                className={`w-full rounded-2xl overflow-hidden shadow-sm relative ${
                  !imageLoaded && report.imageUrl
                    ? "min-h-[300px] bg-neutral-100 dark:bg-neutral-300"
                    : ""
                }`}
              >
                {report.imageUrl && !imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full animate-pulse bg-neutral-200 dark:bg-neutral-400" />
                  </div>
                )}
                {report.imageUrl ? (
                  <img
                    src={report.imageUrl}
                    alt="Report"
                    className={`w-full h-auto block transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-neutral-100 dark:bg-neutral-300 text-neutral-400 dark:text-neutral-500 font-medium">
                    No image available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Details + Controls) */}
          <div className="w-full sm:w-1/2 p-4 sm:p-8 sm:overflow-y-auto bg-neutral-50/30 dark:bg-transparent flex-shrink-0">
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-0.5">
                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-600 uppercase tracking-wider ml-1">
                  {t("reports.description")}
                </label>
                <p className="text-neutral-700 dark:text-neutral-900 text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed px-1">
                  {report.description}
                </p>
              </div>

              {/* User Details */}
              <div className="space-y-0.5">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1">
                  {t("admin.submittedBy")}
                </label>
                <div className="bg-white dark:bg-transparent border border-neutral-100 dark:border-neutral-300 rounded-xl p-3 flex items-center gap-3 shadow-sm dark:shadow-none">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-300 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-900 truncate">
                      {report.userEmail || "Unknown User"}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 truncate font-mono">
                      ID: {report.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-0.5">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1">
                  {t("reports.location")}
                </label>
                <button
                  onClick={() => onShowOnMap(report)}
                  className="w-full bg-white dark:bg-transparent border border-neutral-100 dark:border-neutral-300 rounded-xl p-3 flex items-center gap-3 shadow-sm dark:shadow-none transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-300 group-hover:bg-brand-primary/10 dark:group-hover:bg-neutral-300 flex items-center justify-center text-neutral-400 dark:text-neutral-600 group-hover:text-brand-primary transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-900 truncate group-hover:text-brand-primary transition-colors">
                      {cityName}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 truncate font-mono">
                      {report.location
                        ? `${report.location.latitude.toFixed(
                            6,
                          )}, ${report.location.longitude.toFixed(6)}`
                        : "No location data"}
                    </p>
                  </div>
                </button>
              </div>

              {/* Desktop Status Control (Hidden on Mobile) */}
              <div className="hidden sm:block">
                <StatusControls />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Status Control Footer (Visible only on Mobile) */}
        <div className="block sm:hidden p-4 border-t border-neutral-100 dark:border-neutral-300 bg-white dark:bg-neutral-200 z-10 w-full">
          <StatusControls />
        </div>
      </div>
    </div>
  );
}
