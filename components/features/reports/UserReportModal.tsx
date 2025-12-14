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
// React specific imports
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Internal imports
import { Report } from "@/lib/types/reports";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t, i18n } = useTranslation();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(i18n.language, {
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

  const getStatusNote = (status: string) => {
    switch (status) {
      case "Submitted":
        return t("reports.noteSubmitted");
      case "Accepted":
        return t("reports.noteAccepted");
      case "Completed":
        return t("reports.noteCompleted");
      case "Canceled":
        return t("reports.noteCanceled");
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] max-w-2xl sm:max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-xl sm:text-3xl font-black text-neutral-800 tracking-tight">
            {t("reports.reportDetails")}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onDelete}
              className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
              title={t("admin.deleteReport")}
            >
              <Trash2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content - Split View with Independent Scrolling on Desktop, Single Scroll on Mobile */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden">
          {/* Left Column (Image & Date) - Scrollable on Desktop */}
          <div className="w-full sm:w-1/2 px-4 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-4 sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-neutral-100 flex-shrink-0">
            <div className="flex flex-col gap-4">
              {/* Date (Top) */}
              <div
                className={`text-lg font-bold text-left pl-1 ${getStatusTextColor(
                  report.status
                )}`}
              >
                {formatDate(report.createdAt)}
              </div>

              {/* Image */}
              {/* Image */}
              <div
                className={`w-full rounded-2xl overflow-hidden shadow-sm relative ${
                  !imageLoaded && report.imageUrl
                    ? "min-h-[300px] bg-neutral-100"
                    : ""
                }`}
              >
                {report.imageUrl && !imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full animate-pulse bg-neutral-200" />
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
                  <div className="w-full aspect-video flex items-center justify-center bg-neutral-100 text-neutral-400 font-medium">
                    {t("reports.noImageAvailable")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Details) - Scrollable on Desktop */}
          <div className="w-full sm:w-1/2 p-4 sm:p-8 sm:overflow-y-auto bg-neutral-50/30 flex-shrink-0">
            <div className="space-y-6">
              <div className="space-y-0.5">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">
                  {t("reports.description")}
                </label>
                <p className="text-neutral-700 text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed px-1">
                  {report.description}
                </p>
              </div>

              <div className="space-y-1">
                <div
                  className={`inline-flex items-center px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider ${getStatusColor(
                    report.status
                  )} bg-current/10`}
                >
                  {t(`reports.status${report.status}`)}
                </div>
                {getStatusNote(report.status) && (
                  <p className="text-sm text-neutral-500 italic mt-1 ml-1">
                    "{getStatusNote(report.status)}"
                  </p>
                )}
              </div>

              <div className="px-1">
                <span className="font-bold text-neutral-500 uppercase tracking-wider text-xs">
                  {t("reports.points")}:{" "}
                </span>
                <span className="text-neutral-700 font-medium text-sm sm:text-base ml-2">
                  {report.points}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
