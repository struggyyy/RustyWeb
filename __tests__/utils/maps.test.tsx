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

// External imports
import { describe, it, expect } from "vitest";

// Internal imports
import {
  getPinColor,
  getReportCoordinates,
  calculateDistance,
} from "@/lib/utils/maps";
import { Report, ReportStatus } from "@/lib/types/reports";

describe("Maps Utils", () => {
  describe("getPinColor", () => {
    it("returns blue for Submitted", () => {
      expect(getPinColor("Submitted")).toBe("#1976D2");
    });

    it("returns teal for Accepted", () => {
      expect(getPinColor("Accepted")).toBe("#00796B");
    });

    it("returns green for Completed", () => {
      expect(getPinColor("Completed")).toBe("#2E7D32");
    });

    it("returns red for Canceled", () => {
      expect(getPinColor("Canceled")).toBe("#C62828");
    });

    it("returns default color for unknown status", () => {
      expect(getPinColor("Unknown")).toBe("#6366f1");
    });
  });

  describe("getReportCoordinates", () => {
    // Mock report object partial since we only strictly need location
    // Using simple casting for convenience in tests
    const baseReport = {
      id: "1",
      title: "Test",
      description: "Desc",
      status: "Submitted" as ReportStatus,
      // category removed as it's not in the interface
      userId: "u1",
      userName: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: [],
    } as unknown as Report;

    it("returns null if location is missing or invalid", () => {
      const report = { ...baseReport, location: null } as any;
      expect(getReportCoordinates(report)).toBeNull();

      const reportStr = { ...baseReport, location: "somestring" as any };
      expect(getReportCoordinates(reportStr)).toBeNull();
    });

    it("extracts coordinates from latitude/longitude properties", () => {
      const report = {
        ...baseReport,
        location: { latitude: 52.2297, longitude: 21.0122 } as any,
      };

      const coords = getReportCoordinates(report);
      expect(coords).toEqual({ lat: 52.2297, lng: 21.0122 });
    });

    it("extracts coordinates from lat/lng properties", () => {
      const report = {
        ...baseReport,
        location: { lat: 40.7128, lng: -74.006 } as any,
      };

      const coords = getReportCoordinates(report);
      expect(coords).toEqual({ lat: 40.7128, lng: -74.006 });
    });

    it("returns null if coordinates are missing in object", () => {
      const report = {
        ...baseReport,
        location: { foo: "bar" } as any,
      };
      expect(getReportCoordinates(report)).toBeNull();
    });
  });

  describe("calculateDistance", () => {
    it("calculates distance between two points correctly (Warsaw to Berlin ~517km)", () => {
      const warsaw = { lat: 52.2297, lng: 21.0122 };
      const berlin = { lat: 52.52, lng: 13.405 };

      const distance = calculateDistance(
        warsaw.lat,
        warsaw.lng,
        berlin.lat,
        berlin.lng
      );

      // Allow slight variance due to float math
      expect(distance).toBeGreaterThan(515);
      expect(distance).toBeLessThan(520);
    });

    it("returns 0 for same coordinates", () => {
      const point = { lat: 10, lng: 10 };
      const distance = calculateDistance(
        point.lat,
        point.lng,
        point.lat,
        point.lng
      );
      expect(distance).toBe(0);
    });
  });
});
