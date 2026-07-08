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

// External libraries
import { MapPin, List } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal imports
import { ReportStatus } from "@/lib/types/reports";
import { DatePicker } from "@/components/ui/DatePicker";
import { RadiusPicker } from "@/components/ui/RadiusPicker";
import { AdminSearch } from "@/components/features/admin/controls/AdminSearch";
import { AdminStatusFilter } from "@/components/features/admin/controls/AdminStatusFilter";

interface AdminControlsProps {
  // Search & Location
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocationName: string;
  setSelectedLocationName: (name: string) => void;
  setFilterLocation: (
    loc: { latitude: number; longitude: number } | null,
  ) => void;

  // Date
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;

  // Radius
  filterRadius: number | null;
  setFilterRadius: (radius: number | null) => void;

  // Status
  selectedStatuses: ReportStatus[];
  setSelectedStatuses: (statuses: ReportStatus[]) => void;

  // View
  showMapView: boolean;
  setShowMapView: (show: boolean) => void;

  // Data
  filteredCount: number;
}

export default function AdminControls({
  searchQuery,
  setSearchQuery,
  selectedLocationName,
  setSelectedLocationName,
  setFilterLocation,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  filterRadius,
  setFilterRadius,
  selectedStatuses,
  setSelectedStatuses,
  showMapView,
  setShowMapView,
  filteredCount,
}: AdminControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      {/* Top Row: Search, Radius, Date, View Toggle */}
      <div className="flex w-full gap-2">
        <AdminSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocationName={selectedLocationName}
          setSelectedLocationName={setSelectedLocationName}
          setFilterLocation={setFilterLocation}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        />

        {selectedLocationName && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <RadiusPicker
              radius={filterRadius}
              onChange={(val) => setFilterRadius(val)}
            />
          </div>
        )}

        <DatePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />

        <button
          onClick={() => setShowMapView(!showMapView)}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-brand-primary bg-brand-primary text-white rounded-lg transition-all shadow-md shadow-brand-primary/20 hover:opacity-90"
          title={showMapView ? t("common.listView") : t("common.mapView")}
        >
          {showMapView ? (
            <List className="w-5 h-5" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Bottom Row: Status Filters */}
      <AdminStatusFilter
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        filteredCount={filteredCount}
      />
    </div>
  );
}
