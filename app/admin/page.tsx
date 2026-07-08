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
import { useEffect, useState, useRef, useCallback } from "react";

// External libraries
import { useTheme } from "@/components/context/ThemeProvider";
import { useTranslation } from "react-i18next";

// Internal imports
import { updateReportStatus } from "@/lib/firebase/admin";
import { deleteReport } from "@/lib/firebase/reports";
import { useAuth } from "@/components/context/AuthContext";
import { Report, ReportStatus } from "@/lib/types/reports";
import Header from "@/components/layout/Header";
import AdminReportModal from "@/components/features/reports/AdminReportModal";
import GoogleMaps from "@/components/features/maps/GoogleMaps";
import MapReportModal from "@/components/features/reports/MapReportModal";
import AdminControls from "@/components/features/admin/AdminControls";
import AdminReportsGrid from "@/components/features/admin/AdminReportsGrid";
import { useAdminData } from "@/components/features/admin/hooks/useAdminData";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Custom Hook for Data & Filters
  const {
    filteredReports,
    loading,
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
  } = useAdminData({ user, isAdmin, authLoading });

  // UI State
  const [showMapView, setShowMapView] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMapReport, setSelectedMapReport] = useState<Report | null>(
    null,
  );
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const isProgrammaticFocusRef = useRef(false);

  // Map Focus State
  const [focusedMapLocation, setFocusedMapLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Map Clustering Logic (Local)
  const [mapReportsAtLocation, setMapReportsAtLocation] = useState<Report[]>(
    [],
  );
  const [currentMapReportIndex, setCurrentMapReportIndex] = useState(0);

  // Reset map focus when filters change
  useEffect(() => {
    if (isProgrammaticFocusRef.current) {
      isProgrammaticFocusRef.current = false;
      return;
    }
    setFocusedMapLocation(null);
  }, [
    searchQuery,
    selectedStatuses,
    dateFrom,
    dateTo,
    filterLocation,
    filterRadius,
  ]);

  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    try {
      await updateReportStatus(
        selectedReport.id,
        selectedReport.userId,
        selectedReport.status,
        newStatus,
      );
      // Update local state to reflect change immediately for best UX
      setSelectedReport((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    try {
      await deleteReport(selectedReport.id, selectedReport.imageUrl);
      setShowReportModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(t("profile.deleteError"));
    }
  };

  const handleShowReportOnMap = (report: Report) => {
    isProgrammaticFocusRef.current = true;
    setSearchQuery("");
    setSelectedLocationName("");
    setFilterLocation(null);
    setSelectedStatuses([]);
    setDateFrom("");
    setDateTo("");

    if (report.location) {
      setFocusedMapLocation({
        latitude: report.location.latitude,
        longitude: report.location.longitude,
      });
      setShowReportModal(false);
      setShowMapView(true);
    }
  };

  const handleMapMarkerClick = useCallback(
    (report: Report) => {
      const matches = filteredReports.filter(
        (r) =>
          r.location &&
          Math.abs(r.location.latitude - report.location.latitude) < 0.0001 &&
          Math.abs(r.location.longitude - report.location.longitude) < 0.0001,
      );

      setMapReportsAtLocation(matches);
      setCurrentMapReportIndex(0);
      setSelectedMapReport(matches[0]);
      setShowMapModal(true);
    },
    [filteredReports],
  );

  const handleNextMapReport = () => {
    if (currentMapReportIndex < mapReportsAtLocation.length - 1) {
      const nextIndex = currentMapReportIndex + 1;
      setCurrentMapReportIndex(nextIndex);
      setSelectedMapReport(mapReportsAtLocation[nextIndex]);
    }
  };

  const handlePrevMapReport = () => {
    if (currentMapReportIndex > 0) {
      const prevIndex = currentMapReportIndex - 1;
      setCurrentMapReportIndex(prevIndex);
      setSelectedMapReport(mapReportsAtLocation[prevIndex]);
    }
  };

  const handleViewReportFromMap = () => {
    if (selectedMapReport) {
      setShowMapModal(false);
      setSelectedReport(selectedMapReport);
      setShowReportModal(true);
      setSelectedMapReport(null);
    }
  };

  const handleMapModalClose = () => {
    setShowMapModal(false);
    setSelectedMapReport(null);
    setMapReportsAtLocation([]);
    setCurrentMapReportIndex(0);
    setFocusedMapLocation(null);
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary" />
      </div>
    );
  }

  const hasFilters =
    !!searchQuery ||
    selectedStatuses.length > 0 ||
    !!dateFrom ||
    !!dateTo ||
    !!filterLocation ||
    (!!filterRadius && filterRadius > 0);

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans">
      <Header variant="protected" />

      {/* Static Fixed Header Section */}
      <div className="flex-shrink-0 w-full pt-4 md:pt-8 px-4 sm:px-10 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Title & Subtitle */}
          <div>
            <h1 className="text-lg min-[400px]:text-xl sm:text-4xl lg:text-5xl font-black text-neutral-800 dark:text-white tracking-tight">
              {t("admin.managementTitle")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-200 text-xs min-[400px]:text-sm sm:text-base lg:text-lg font-medium mt-1">
              {t("admin.managementSubtitle")}
            </p>
          </div>

          <AdminControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLocationName={selectedLocationName}
            setSelectedLocationName={setSelectedLocationName}
            setFilterLocation={setFilterLocation}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            filterRadius={filterRadius}
            setFilterRadius={setFilterRadius}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            showMapView={showMapView}
            setShowMapView={setShowMapView}
            filteredCount={filteredReports.length}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main
        className={`flex-1 w-full px-4 sm:px-10 pb-6 pt-4 sm:pt-6 ${
          showMapView ? "overflow-hidden" : "overflow-y-auto"
        } [mask-image:linear-gradient(to_bottom,transparent,black_20px)]`}
      >
        <div
          className={`max-w-4xl mx-auto flex flex-col ${
            showMapView ? "h-full" : "min-h-full"
          }`}
        >
          {/* Reports View - Map or List */}
          {showMapView ? (
            <div className="w-full flex-1 min-h-0 rounded-xl overflow-hidden relative z-10 border border-neutral-200 dark:border-none shadow-sm dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] bg-neutral-100">
              <GoogleMaps
                key={theme}
                reports={filteredReports}
                onMarkerClick={handleMapMarkerClick}
                className="w-full h-full"
                focusedLocation={focusedMapLocation}
              />
            </div>
          ) : (
            <AdminReportsGrid
              filteredReports={filteredReports}
              onDetailsPress={handleDetailsPress}
              hasFilters={hasFilters}
            />
          )}

          {!showMapView && (
            <footer className="w-full py-6 text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest mt-8">
              {t("common.footer")}
            </footer>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <AdminReportModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteReport}
          onShowOnMap={handleShowReportOnMap}
        />
      )}

      {/* Map Report Modal */}
      {showMapModal && selectedMapReport && (
        <MapReportModal
          report={selectedMapReport}
          onClose={handleMapModalClose}
          onViewReport={handleViewReportFromMap}
          hasMultiple={mapReportsAtLocation.length > 1}
          onNext={
            currentMapReportIndex < mapReportsAtLocation.length - 1
              ? handleNextMapReport
              : undefined
          }
          onPrev={currentMapReportIndex > 0 ? handlePrevMapReport : undefined}
        />
      )}
    </div>
  );
}
