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
  formatDate,
  getStatusColor,
  getStatusTextColor,
} from "@/lib/utils/reports";

describe("Reports Utils", () => {
  describe("formatDate", () => {
    it("returns empty string for null/undefined timestamp", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });

    it("formats Date object correctly in English", () => {
      const date = new Date("2023-01-15T12:00:00Z");
      // Adjusting expectation based on potential timezone differences or mocking if needed.
      // Ideally, we should pass a specific locale to ensure consistency.
      // The utility defaults to 'en-US'.
      // Note: toLocaleDateString might vary by Node/Browser environment so strict equality might be flaky without timezone mocks.
      // However, for purposes of unit testing logic we assume standard env.
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2023/);
    });

    it("formats Firestore-like timestamp correctly", () => {
      const mockTimestamp = {
        toDate: () => new Date("2023-05-20T10:00:00Z"),
      };
      expect(formatDate(mockTimestamp)).toMatch(/May 20, 2023/);
    });
  });

  describe("getStatusColor", () => {
    it("returns correct classes for Submitted", () => {
      expect(getStatusColor("Submitted")).toContain("bg-status-Submitted");
      expect(getStatusColor("Submitted")).toContain("text-white");
    });

    it("returns correct classes for Accepted", () => {
      expect(getStatusColor("Accepted")).toContain("bg-status-Accepted");
    });

    it("returns correct classes for Completed", () => {
      expect(getStatusColor("Completed")).toContain("bg-status-Completed");
    });

    it("returns correct classes for Canceled", () => {
      expect(getStatusColor("Canceled")).toContain("bg-status-Canceled");
    });

    it("returns fallback for unknown status", () => {
      expect(getStatusColor("Unknown")).toContain("bg-neutral-100");
      expect(getStatusColor("Unknown")).toContain("text-neutral-500");
    });
  });

  describe("getStatusTextColor", () => {
    it("returns correct text color for Submitted", () => {
      expect(getStatusTextColor("Submitted")).toBe("text-status-Submitted");
    });

    it("returns correct text color for Accepted", () => {
      expect(getStatusTextColor("Accepted")).toBe("text-status-Accepted");
    });

    it("returns fallback for unknown status", () => {
      expect(getStatusTextColor("Unknown")).toBe("text-neutral-500");
    });
  });
});
