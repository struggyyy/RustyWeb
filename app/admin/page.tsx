"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, MoreVertical, Search, LogOut, MapPin } from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { Report, ReportStatus } from "@/types/reports";
import ReportCard from "@/components/features/ReportCard";
import AdminReportModal from "@/components/features/AdminReportModal";
import ReportFilters from "@/components/features/ReportFilters";
import GoogleMaps from "@/components/features/GoogleMaps";
import MapReportModal from "@/components/features/MapReportModal";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user, isAdmin, logOut, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [filterRadius, setFilterRadius] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMapReport, setSelectedMapReport] = useState<Report | null>(
    null
  );
  const [showMapModal, setShowMapModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait for authentication to load before checking user state
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

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
  }, [user, isAdmin, authLoading, router]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
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

  // Filter reports based on search query, status, date range, and location + radius
  useEffect(() => {
    let filtered = [...reports];

    // Filter by selected statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((report) =>
        selectedStatuses.includes(report.status)
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((report) => {
        const reportDate = report.createdAt.toDate();
        return reportDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((report) => {
        const reportDate = report.createdAt.toDate();
        return reportDate <= toDate;
      });
    }

    // Filter by location and radius
    if (filterLocation) {
      // Use explicit radius if set, otherwise use default 50km for city + nearby areas
      const effectiveRadius = filterRadius !== null && filterRadius > 0 ? filterRadius : 50;
      filtered = filtered.filter((report) => {
        if (!report.location) return false;
        const distance = calculateDistance(
          filterLocation.latitude,
          filterLocation.longitude,
          report.location.latitude,
          report.location.longitude
        );
        return distance <= effectiveRadius;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.id.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          (report.userEmail &&
            report.userEmail.toLowerCase().includes(query)) ||
          (report.location &&
            `${report.location.latitude.toFixed(
              4
            )}, ${report.location.longitude.toFixed(4)}`.includes(query))
      );
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
  ]);

  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    // TODO: Implement status update functionality
    console.log("Update status to:", newStatus);
  };

  const handleMapMarkerClick = (report: Report) => {
    setSelectedMapReport(report);
    setShowMapModal(true);
  };

  const handleViewReportFromMap = () => {
    if (selectedMapReport) {
      setSelectedReport(selectedMapReport);
      setShowReportModal(true);
      setShowMapModal(false);
    }
  };

  const handleMapModalClose = () => {
    setShowMapModal(false);
    setSelectedMapReport(null);
  };

  const handleDeleteReport = async () => {
    // TODO: Implement delete functionality
    console.log("Delete report");
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-status-Submitted/10 text-status-Submitted";
      case "Accepted":
        return "bg-status-Accepted/10 text-status-Accepted";
      case "Completed":
        return "bg-status-Completed/10 text-status-Completed";
      case "Canceled":
        return "bg-status-Canceled/10 text-status-Canceled";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <aside className="hidden xl:block w-64 bg-white/80 backdrop-blur-md border-r border-neutral-100 fixed h-full z-20">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-neutral-600">
              Rusty Admin
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <a
            href="#"
            className="block px-4 py-2 bg-neutral-50 text-brand-primary font-medium rounded-lg"
          >
            Reports
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-400 rounded-lg transition-colors"
          >
            Users
          </a>
          <Link
            href="/settings"
            className="block px-4 py-2 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-400 rounded-lg transition-colors"
          >
            Settings
          </Link>
          <button
            onClick={() => logOut()}
            className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors mt-8 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="xl:ml-64 flex-1 p-4 xl:p-8 overflow-x-hidden">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-700 mb-2">
              Report Management
            </h1>
            <p className="text-neutral-400">
              Review and update citizen reports.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 backdrop-blur-sm border border-neutral-100 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-sm whitespace-nowrap ${
                showFilters ||
                selectedStatuses.length > 0 ||
                dateFrom ||
                dateTo ||
                locationQuery ||
                (filterRadius && filterRadius > 0)
                  ? "bg-brand-primary text-white"
                  : "bg-white/80 text-neutral-400"
              }`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`px-4 py-2 backdrop-blur-sm border border-neutral-100 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-sm whitespace-nowrap ${
                showMapView
                  ? "bg-brand-primary text-white"
                  : "bg-white/80 text-neutral-400"
              }`}
            >
              {showMapView ? (
                <>
                  <Filter className="w-4 h-4" /> List View
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" /> Map View
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
          <input
            type="text"
            placeholder="Search reports by ID, location, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-300 text-neutral-600 shadow-sm"
          />
        </div>

        {/* Status and Location Filters */}
        {showFilters && (
          <>
            <ReportFilters
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
              locationQuery={locationQuery}
              onLocationChange={(location, coords) => {
                setLocationQuery(location);
                if (coords) {
                  setFilterLocation(coords);
                } else if (!location.trim()) {
                  setFilterLocation(null);
                }
              }}
              filterRadius={filterRadius}
              onRadiusChange={setFilterRadius}
            />

            {/* Date Range Filters */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600"
                />
              </div>
            </div>
          </>
        )}

        {/* Reports View - Map or List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {showMapView ? (
            <div className="h-[600px] relative">
              <GoogleMaps
                reports={filteredReports}
                onMarkerClick={handleMapMarkerClick}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="max-h-[600px] overflow-y-auto">
                <div className="grid gap-4">
                  {filteredReports.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-neutral-100 shadow-sm">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-neutral-300" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-600 mb-2">
                        {searchQuery ||
                        selectedStatuses.length > 0 ||
                        dateFrom ||
                        dateTo ||
                        filterLocation ||
                        (filterRadius && filterRadius > 0)
                          ? "No reports found"
                          : "No reports yet"}
                      </h3>
                      <p className="text-neutral-400">
                        {searchQuery ||
                        selectedStatuses.length > 0 ||
                        dateFrom ||
                        dateTo ||
                        filterLocation ||
                        (filterRadius && filterRadius > 0)
                          ? "Try adjusting your search or filter criteria."
                          : "Reports will appear here when submitted."}
                      </p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        isAdmin={true}
                        onDetailsPress={handleDetailsPress}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
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
        />
      )}

      {/* Map Report Modal */}
      {showMapModal && selectedMapReport && (
        <MapReportModal
          report={selectedMapReport}
          onClose={handleMapModalClose}
          onViewReport={handleViewReportFromMap}
          hasMultiple={filteredReports.length > 1}
        />
      )}
    </div>
  );
}
