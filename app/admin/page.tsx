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

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Filter, Search, MapPin, X, Menu, LogOut } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { Report, ReportStatus, reportStatuses } from "@/types/reports";
import ReportCard from "@/components/features/ReportCard";
import DashboardHeader from "@/components/layout/DashboardHeader";
import AdminReportModal from "@/components/features/AdminReportModal";

import GoogleMaps from "@/components/features/GoogleMaps";
import MapReportModal from "@/components/features/MapReportModal";
import { useRouter } from "next/navigation";
import { updateReportStatus } from "@/lib/firebase/admin";

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

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wait for authentication to load before checking user state
    if (authLoading) {
      return;
    }

    if (!user) {
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

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [inputValue, setInputValue] = useState(""); // Typed text (visual)
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>("");

  // Logic from ReportFilters: Geocoding
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=50&addressdetails=1&countrycodes=pl`,
        {
          headers: {
            "Accept-Language": "pl", // Force Polish results
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const uniqueData = data.filter(
          (value: any, index: number, self: any[]) =>
            index ===
            self.findIndex((t) => t.display_name === value.display_name)
        );

        // Sort: Tiered System + Importance
        uniqueData.sort((a: any, b: any) => {
          const getTier = (item: any) => {
            const type = item.type || "";
            const addrType = item.addresstype || "";
            const cls = item.class || "";

            // Top Tier: Major Cities
            if (
              ["city", "town", "state", "province"].includes(type) ||
              ["city", "town", "state", "province"].includes(addrType)
            )
              return 10;

            // Mid Tier: Municipalities, Villages, Districts
            if (
              [
                "village",
                "municipality",
                "administrative",
                "district",
                "borough",
                "suburb",
              ].includes(type) ||
              [
                "village",
                "municipality",
                "administrative",
                "district",
                "borough",
                "suburb",
              ].includes(addrType) ||
              (cls === "place" &&
                ![
                  "neighbourhood",
                  "quarter",
                  "isolated_dwelling",
                  "farm",
                  "allotments",
                ].includes(type))
            )
              return 5;

            // Negative Tier: Common Junk/POIs when searching for cities
            const demotedClasses = [
              "amenity",
              "shop",
              "tourism",
              "highway",
              "office",
              "leisure",
              "building",
              "landuse",
              "man_made",
              "natural",
            ];
            if (demotedClasses.includes(cls)) return -1;

            return 0;
          };

          const tierA = getTier(a);
          const tierB = getTier(b);

          if (tierA !== tierB) return tierB - tierA; // Higher tier first

          // Secondary: Importance
          return (b.importance || 0) - (a.importance || 0);
        });

        setSuggestions(uniqueData.slice(0, 5)); // Keep top 5 unique & prioritized
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Improved Filter Effect
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
      // Force local start of day
      const fromDate = new Date(dateFrom + "T00:00:00");
      filtered = filtered.filter((r) => r.createdAt.toDate() >= fromDate);
    }
    if (dateTo) {
      // Force local end of day
      const toDate = new Date(dateTo + "T23:59:59.999");
      filtered = filtered.filter((r) => r.createdAt.toDate() <= toDate);
    }

    // 3. Location/Radius Filter (Strict)
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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.id.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          (report.userEmail &&
            report.userEmail.toLowerCase().includes(query)) ||
          // Include location check in text search so typing "Krakow" still finds "Krakow" reports (redundant if geo-filtered but harmless)
          (report.location &&
            `${report.location.latitude} ${report.location.longitude}`.includes(
              query
            ))
        // We might need reverse geocoded address in report for full text search functionality, but we don't have it on report object yet.
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

  const handleSearchChange = (val: string) => {
    setInputValue(val); // Update input visually

    // If a location is already selected, we don't geocode
    if (selectedLocationName) {
      // If we want real-time TEXT filter inside a location, uncomment below:
      // setSearchQuery(val);
      // But user asked for NO real-time search. So we wait for Enter.
      return;
    }

    // Otherwise, we are searching for a location
    if (val !== lastSelectedRef.current) {
      setFilterLocation(null);
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      if (val.trim() && !selectedLocationName) searchLocations(val);
      else setShowSuggestions(false);
    }, 300);
    setDebounceTimer(timer);
  };

  const handleLocationSelect = (item: any) => {
    const name = item.display_name.split(",")[0]; // Simple name
    setSelectedLocationName(name);
    setSearchQuery(""); // Clear filter query
    setInputValue(""); // Clear input
    lastSelectedRef.current = name;
    setFilterLocation({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearLocation = () => {
    setSelectedLocationName("");
    setFilterLocation(null);
    setSearchQuery("");
    setInputValue("");
    lastSelectedRef.current = "";
    if (searchInputRef.current) searchInputRef.current.focus();
  };
  // ... UI to be replaced in next step ...

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
        newStatus
      );

      // Update local state to reflect change immediately
      setSelectedReport((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleMapMarkerClick = (report: Report) => {
    setSelectedMapReport(report);
    setShowMapModal(true);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-2xl border-r border-white/60 shadow-2xl z-50 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="text-white font-black text-xl">R</span>
            </div>
            <span className="text-xl font-black text-neutral-800 tracking-tight">
              Rusty Admin
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-brand-primary/10 text-brand-primary font-bold rounded-xl transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
            Reports
          </button>

          <a
            href="#"
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 font-medium rounded-xl transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-neutral-200 group-hover:bg-neutral-400 transition-colors" />
            Users
          </a>

          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 font-medium rounded-xl transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-neutral-200 group-hover:bg-neutral-400 transition-colors" />
            Settings
          </Link>

          <button
            onClick={() => logOut()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium rounded-xl transition-all mt-8"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </aside>

      <DashboardHeader />

      {/* Static Fixed Header Section */}
      <div className="absolute top-0 left-0 w-full pt-4 md:pt-8 px-4 sm:px-10 z-20 pb-4 pointer-events-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Title & Subtitle */}
          <div>
            <h1 className="text-lg min-[400px]:text-xl sm:text-4xl lg:text-5xl font-black text-neutral-800 tracking-tight">
              Report Management
            </h1>
            <p className="text-neutral-500 text-xs min-[400px]:text-sm sm:text-base lg:text-lg font-medium mt-1">
              Review and update reports.
            </p>
          </div>

          {/* Row 1: Search & Status Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search Group: Search Bar + Radius */}
            <div className="flex flex-1 w-full md:w-auto gap-2">
              {/* Combined Search & Location Bar */}
              <div
                className={`relative z-30 flex-1 flex items-center bg-white border border-neutral-200 rounded-lg shadow-sm focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all ${
                  selectedLocationName ? "pl-2" : ""
                }`}
              >
                {!selectedLocationName && (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                )}

                {/* Location Chip */}
                {selectedLocationName && (
                  <div className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap mr-2">
                    <MapPin className="w-3 h-3" />
                    {selectedLocationName}
                    <button
                      onClick={handleClearLocation}
                      className="hover:bg-brand-primary/20 rounded-full p-0.5 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    selectedLocationName
                      ? "Filter reports description..."
                      : "Search reports or enter city..."
                  }
                  value={inputValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSuggestions(false);
                    // Select first suggestion on Enter if filtering location
                    if (
                      e.key === "Enter" &&
                      !selectedLocationName &&
                      suggestions.length > 0 &&
                      showSuggestions
                    ) {
                      handleLocationSelect(suggestions[0]);
                      return;
                    }
                    // Or apply text filter on Enter
                    if (e.key === "Enter") {
                      setSearchQuery(inputValue);
                      setShowSuggestions(false);
                    }
                    if (
                      e.key === "Backspace" &&
                      inputValue === "" &&
                      selectedLocationName
                    ) {
                      handleClearLocation();
                    }
                  }}
                  className={`flex-1 w-full bg-transparent border-none focus:ring-0 text-sm text-neutral-600 py-2 ${
                    selectedLocationName ? "" : "pl-9"
                  } pr-3 placeholder-neutral-400 focus:outline-none min-w-[50px]`}
                />

                {/* Location Suggestions Dropdown */}
                {showSuggestions &&
                  suggestions.length > 0 &&
                  !selectedLocationName && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-40">
                      {suggestions.map((item: any) => (
                        <button
                          key={item.place_id}
                          onClick={() => handleLocationSelect(item)}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-50 last:border-0 flex flex-col gap-0.5"
                        >
                          <span className="text-sm font-medium text-neutral-800">
                            {item.display_name.split(",")[0]}
                          </span>
                          <span className="text-xs text-neutral-500 truncate">
                            {item.display_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Radius Input - Conditional */}
              {selectedLocationName && (
                <div className="w-20 sm:w-24 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="relative h-full">
                    <input
                      type="number"
                      value={filterRadius || ""}
                      onChange={(e) =>
                        setFilterRadius(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="50"
                      className="w-full h-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm text-neutral-600 shadow-sm text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none hidden sm:inline">
                      km
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DatePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />

            {/* Status Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedStatuses([])}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedStatuses.length === 0
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                All
              </button>
              {reportStatuses.map((status) => {
                const isSelected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => {
                      const exists = selectedStatuses.includes(status);
                      let next = exists
                        ? selectedStatuses.filter((s) => s !== status)
                        : [...selectedStatuses, status];
                      if (next.length === reportStatuses.length) next = [];
                      setSelectedStatuses(next);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? getStatusColor(status) +
                          " ring-1 ring-current shadow-sm"
                        : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Action Buttons & Date Filters */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-1 items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex-shrink-0 px-3 sm:px-4 py-2 border border-neutral-200 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors shadow-sm bg-white text-neutral-600 text-sm font-medium"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* Date Filters (Inline) */}

            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`flex-shrink-0 px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-colors shadow-sm text-sm font-medium ${
                showMapView
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
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
      </div>

      {/* Scrollable Content Area */}
      <main
        className={`absolute top-[310px] sm:top-[290px] md:top-[270px] bottom-0 left-0 right-0 overflow-y-auto px-4 sm:px-10 pb-6 pt-10 ${
          !showMapView
            ? "[mask-image:linear-gradient(to_bottom,transparent,black_40px)]"
            : ""
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {/* Controls Section REMOVED - moved to header */}

          {/* Reports View - Map or List */}
          {showMapView ? (
            <div className="w-full h-[calc(100vh-250px)] rounded-xl overflow-hidden relative z-10 border border-neutral-200 shadow-sm bg-neutral-100">
              <GoogleMaps
                reports={filteredReports}
                onMarkerClick={handleMapMarkerClick}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="flex-1 grid gap-4 sm:gap-6 max-w-4xl pb-8">
              {filteredReports.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-16 text-center border-2 border-dashed border-neutral-200 mt-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-neutral-700 mb-3">
                    {searchQuery ||
                    selectedStatuses.length > 0 ||
                    dateFrom ||
                    dateTo ||
                    filterLocation ||
                    (filterRadius && filterRadius > 0)
                      ? "No reports found"
                      : "No reports yet"}
                  </h3>
                  <p className="text-neutral-400 max-w-md mx-auto text-sm sm:text-lg font-medium">
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
                  <div
                    key={report.id}
                    className="transform transition-all duration-300 hover:scale-[1.01]"
                  >
                    <ReportCard
                      report={report}
                      isAdmin={true}
                      onDetailsPress={handleDetailsPress}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          <footer className="w-full py-6 text-center text-neutral-400 text-sm font-bold uppercase tracking-widest mt-8">
            © 2025 Created by struggyyy
          </footer>
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
