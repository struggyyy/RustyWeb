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

// External libraries
import { Check, Clock, FileCheck, X } from "lucide-react";

// Internal imports
import { ReportStatus } from "@/lib/types/reports";

// Format date timestamp to locale string
export const formatDate = (
  timestamp: any,
  language: string = "en-US",
): string => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get background and border colors for status badges
export const getStatusColor = (status: ReportStatus | string): string => {
  switch (status) {
    case "Submitted":
      return "bg-status-Submitted text-white border-status-Submitted";
    case "Accepted":
      return "bg-status-Accepted text-white border-status-Accepted";
    case "Completed":
      return "bg-status-Completed text-white border-status-Completed";
    case "Canceled":
      return "bg-status-Canceled text-white border-status-Canceled";
    default:
      return "bg-neutral-100 text-neutral-500 border-neutral-200"; // Fallback
  }
};

// Get text color for status text
export const getStatusTextColor = (status: string): string => {
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

// Get icon component for status
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Submitted":
      return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />;
    case "Accepted":
      return (
        <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-status-Accepted" />
      );
    case "Completed":
      return <Check className="w-4 h-4 sm:w-5 sm:h-5 text-status-Completed" />;
    case "Canceled":
      return <X className="w-4 h-4 sm:w-5 sm:h-5 text-status-Canceled" />;
    default:
      return null;
  }
};
