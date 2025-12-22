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
import { X, Trash2, MapPin } from "lucide-react";

// Internal imports
import { Report } from "@/lib/types/reports";
import { getCityFromCoordinates } from "@/lib/services/geocoding";
import {
  formatDate,
  getStatusColor,
  getStatusTextColor,
} from "@/lib/utils/reports";
import CustomAlert from "@/components/common/CustomAlert";

interface UserReportModalProps {
  report: Report;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function UserReportModal({
  report,
  onClose,
  onDelete,
}: UserReportModalProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cityName, setCityName] = useState<string>("reports.loading");

  useEffect(() => {
    async function fetchCity() {
      if (report.location) {
        const city = await getCityFromCoordinates(
          report.location.latitude,
          report.location.longitude
        );
        setCityName(city);
      } else {
        setCityName("reports.unknownLocation");
      }
    }
    fetchCity();
  }, [report.location, t]);

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
            {t("reports.reportDetails")}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowAlert(true)}
              className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
              title={t("admin.deleteReport")}
            >
              <Trash2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
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
          {/* Left Column (Date & Image) */}
          <div className="w-full sm:w-1/2 px-4 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-4 sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-neutral-100 dark:border-neutral-300 flex-shrink-0">
            <div className="flex flex-col gap-4">
              {/* Date */}
              <div
                className={`text-lg font-bold text-left pl-1 ${getStatusTextColor(
                  report.status
                )}`}
              >
                {formatDate(report.createdAt)}
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
                    {t("reports.noImageAvailable")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Details) */}
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

              {/* Location Details */}
              <div className="space-y-0.5">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1 mb-1">
                  {t("reports.location")}
                </label>
                <div className="w-full bg-white dark:bg-transparent border border-neutral-100 dark:border-neutral-300 rounded-xl p-3 flex items-center gap-3 shadow-sm dark:shadow-none">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-300 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-900 truncate">
                      {t(cityName)}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 truncate font-mono">
                      {report.location
                        ? `${report.location.latitude.toFixed(
                            6
                          )}, ${report.location.longitude.toFixed(6)}`
                        : "No location data"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                {/* Status Pill */}
                <div className="flex justify-start">
                  <span
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {t(`reports.status${report.status}`)}
                  </span>
                </div>

                {/* Status Note */}
                {report.status !== "Submitted" && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed italic border-l-2 border-neutral-200 dark:border-neutral-700 pl-3 py-1">
                    {t(`reports.note${report.status}`)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomAlert
        visible={showAlert}
        title={t("reports.deleteConfirmTitle")}
        message={t("reports.deleteConfirmDesc")}
        onRequestClose={() => !isDeleting && setShowAlert(false)}
        buttons={[
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => setShowAlert(false),
          },
          {
            text: t("common.delete"),
            style: "destructive",
            loading: isDeleting,
            onPress: handleDelete,
          },
        ]}
      />
    </div>
  );
}
