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
  report: Report,
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

// Calculate distance between two coordinates in km (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
