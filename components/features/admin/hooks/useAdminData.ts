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

// External libraries
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";

// Internal imports
import { db } from "@/lib/firebase/firebase";
import { Report, ReportStatus } from "@/lib/types/reports";
import { calculateDistance } from "@/lib/utils/maps";

interface UseAdminDataProps {
  user: any;
  isAdmin: boolean;
  authLoading: boolean;
}

export function useAdminData({
  user,
  isAdmin,
  authLoading,
}: UseAdminDataProps) {
  const { t, i18n } = useTranslation();

  // Data State
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filterRadius, setFilterRadius] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Real-time Reports Fetching
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) return;

    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(fetchedReports);
      setFilteredReports(fetchedReports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin, authLoading]);

  // Apply Filters (Status, Date, Radius, Search)
  useEffect(() => {
    let filtered = [...reports];

    // 1. Status Filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((report) =>
        selectedStatuses.includes(report.status)
      );
    }

    // 2. Date Filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom + "T00:00:00");
      filtered = filtered.filter((r) => r.createdAt.toDate() >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo + "T23:59:59.999");
      filtered = filtered.filter((r) => r.createdAt.toDate() <= toDate);
    }

    // 3. Location/Radius Filter
    if (filterLocation) {
      const radius = filterRadius && filterRadius > 0 ? filterRadius : 50;
      filtered = filtered.filter((report) => {
        if (!report.location) return false;
        const dist = calculateDistance(
          filterLocation.latitude,
          filterLocation.longitude,
          report.location.latitude,
          report.location.longitude
        );
        return dist <= radius;
      });
    }

    // 4. Text Search
    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase();
      filtered = filtered.filter((report) => {
        const matchesText =
          report.id.toLowerCase().includes(queryStr) ||
          report.description.toLowerCase().includes(queryStr) ||
          (report.userEmail &&
            report.userEmail.toLowerCase().includes(queryStr));

        const matchesLocation =
          report.location &&
          `${report.location.latitude} ${report.location.longitude}`.includes(
            queryStr
          );

        const statusTranslation = t(
          `reports.status${report.status}`
        ).toLowerCase();
        const matchesStatus = statusTranslation.includes(queryStr);

        const dateString = report.createdAt
          .toDate()
          .toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase();
        const matchesDate = dateString.includes(queryStr);

        return matchesText || matchesLocation || matchesStatus || matchesDate;
      });
    }

    setFilteredReports(filtered);
  }, [
    reports,
    searchQuery,
    selectedStatuses,
    dateFrom,
    dateTo,
    filterLocation,
    filterRadius,
    t,
    i18n.language,
  ]);

  return {
    reports,
    filteredReports,
    loading,
    setFilteredReports,
    // Filter State & Setters
    searchQuery,
    setSearchQuery,
    selectedStatuses,
    setSelectedStatuses,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filterRadius,
    setFilterRadius,
    filterLocation,
    setFilterLocation,
  };
}
