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

// Internal imports
import { Report } from "@/lib/types/reports";

// Get pin color based on report status
export const getPinColor = (status: string): string => {
  switch (status) {
    case "Submitted":
      return "#1976D2"; // Blue
    case "Accepted":
      return "#00796B"; // Teal
    case "Completed":
      return "#2E7D32"; // Green
    case "Canceled":
      return "#C62828"; // Red
    default:
      return "#6366f1"; // Default indigo
  }
};

// safely extract latitude and longitude from a report
export const getReportCoordinates = (
  report: Report
): { lat: number; lng: number } | null => {
  if (!report.location || typeof report.location !== "object") {
    return null;
  }

  const location = report.location as any;

  if (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  ) {
    return { lat: location.latitude, lng: location.longitude };
  } else if (
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  ) {
    return { lat: location.lat, lng: location.lng };
  }

  return null;
};
