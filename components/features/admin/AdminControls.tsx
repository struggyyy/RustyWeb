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

// React-specific imports
import { useState, useRef, useEffect } from "react";

// External libraries
import { Search, MapPin, X, List } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal imports
import { ReportStatus, reportStatuses } from "@/lib/types/reports";
import { DatePicker } from "@/components/ui/DatePicker";
import { RadiusPicker } from "@/components/ui/RadiusPicker";

interface AdminControlsProps {
  // Search & Location
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocationName: string;
  setSelectedLocationName: (name: string) => void;
  setFilterLocation: (
    loc: { latitude: number; longitude: number } | null
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

  // Search state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!searchQuery && !selectedLocationName) {
      setInputValue("");
    }
  }, [searchQuery, selectedLocationName]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchPlaceholder = isMobile
    ? t("common.searchPlaceholderMobile")
    : t("common.searchPlaceholder");

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=50&addressdetails=1&countrycodes=pl`,
        {
          headers: {
            "Accept-Language": "pl",
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

        // Sort by relevance
        uniqueData.sort((a: any, b: any) => {
          const getTier = (item: any) => {
            const type = item.type || "";
            const addrType = item.addresstype || "";
            const cls = item.class || "";

            if (
              ["city", "town", "state", "province"].includes(type) ||
              ["city", "town", "state", "province"].includes(addrType)
            )
              return 10;

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
                  "amenity",
                ].includes(type))
            )
              return 5;

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

          if (tierA !== tierB) return tierB - tierA;
          return (b.importance || 0) - (a.importance || 0);
        });

        setSuggestions(uniqueData.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleSearchChange = (val: string) => {
    setInputValue(val);

    if (val.trim() === "") {
      setSearchQuery("");
    }

    if (selectedLocationName) {
      return;
    }

    // Reset location filter on input change
    if (val !== lastSelectedRef.current) {
      if (val !== lastSelectedRef.current) {
        setFilterLocation(null);
      }
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      if (val.trim() && !selectedLocationName) searchLocations(val);
      else setShowSuggestions(false);
    }, 300);
    setDebounceTimer(timer);
  };

  const handleLocationSelect = (item: any) => {
    const name = item.display_name.split(",")[0];
    setSelectedLocationName(name);
    setSearchQuery("");
    setInputValue("");
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full gap-2">
        {/* Search bar */}
        <div
          className={`relative z-30 flex-1 flex items-center bg-white dark:bg-neutral-200 border border-neutral-200 dark:border-neutral-200 rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all h-10 ${
            selectedLocationName ? "pl-2" : ""
          }`}
        >
          {!selectedLocationName && (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          )}

          {/* Location Chip */}
          {selectedLocationName && (
            <div className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap mr-1 sm:mr-2 flex-shrink min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[45px] min-[380px]:max-w-[100px] sm:max-w-none">
                {selectedLocationName}
              </span>
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
            placeholder={selectedLocationName ? "" : searchPlaceholder}
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSuggestions(false);

              if (
                e.key === "Enter" &&
                !selectedLocationName &&
                suggestions.length > 0 &&
                showSuggestions
              ) {
                handleLocationSelect(suggestions[0]);
                return;
              }

              if (e.key === "Enter") {
                const lowerVal = inputValue.trim().toLowerCase();

                // Check for status match
                const matchedStatus = reportStatuses.find(
                  (s) =>
                    t(`reports.status${s}`).toLowerCase() === lowerVal ||
                    s.toLowerCase() === lowerVal
                );

                if (matchedStatus) {
                  if (!selectedStatuses.includes(matchedStatus)) {
                    setSelectedStatuses([...selectedStatuses, matchedStatus]);
                  }
                  setInputValue("");
                  setSearchQuery("");
                  setShowSuggestions(false);
                  return;
                }

                // Check for date match
                let dateParsed: Date | null = null;
                if (/^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/.test(inputValue.trim())) {
                  const parts = inputValue.trim().split(/[./-]/);
                  // Construct using local time (Year, MonthIndex, Day)
                  dateParsed = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[0])
                  );
                } else {
                  const trimmed = inputValue.trim();
                  let potentialDate = new Date(trimmed);

                  // If invalid or year missing, try heuristic
                  const hasYear = /\d{4}/.test(trimmed);

                  if (!isNaN(potentialDate.getTime())) {
                    // If user didn't type a year, force current year
                    if (!hasYear) {
                      potentialDate.setFullYear(new Date().getFullYear());
                    }
                    dateParsed = potentialDate;
                  } else if (!hasYear) {
                    // Try appending current year if initial parse failed
                    const withYear = `${trimmed} ${new Date().getFullYear()}`;
                    const retryDate = new Date(withYear);
                    if (!isNaN(retryDate.getTime())) {
                      dateParsed = retryDate;
                    }
                  }
                }

                if (dateParsed && !isNaN(dateParsed.getTime())) {
                  // Manually construct local YYYY-MM-DD string to avoid UTC shifts
                  const year = dateParsed.getFullYear();
                  const month = String(dateParsed.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(dateParsed.getDate()).padStart(2, "0");
                  const localDateString = `${year}-${month}-${day}`;

                  setDateFrom(localDateString);
                  setDateTo(localDateString);
                  setInputValue("");
                  setSearchQuery("");
                  setShowSuggestions(false);
                  return;
                }

                // Default to text search
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
            className={`flex-1 w-full bg-transparent border-none focus:ring-0 text-sm text-neutral-600 dark:text-neutral-900 py-2 ${
              selectedLocationName ? "" : "pl-9"
            } pr-3 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none min-w-[20px]`}
          />

          {/* Suggestions list */}
          {showSuggestions &&
            suggestions.length > 0 &&
            !selectedLocationName && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-neutral-200 border border-neutral-200 dark:border-neutral-200 rounded-lg shadow-xl dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] max-h-60 overflow-y-auto z-40">
                {suggestions.map((item: any) => (
                  <button
                    key={item.place_id}
                    onClick={() => handleLocationSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-50 dark:border-neutral-300 last:border-0 flex flex-col gap-0.5 transition-colors group"
                  >
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-900 dark:group-hover:text-white">
                      {item.display_name.split(",")[0]}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-200 truncate">
                      {item.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Radius filter */}
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

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setSelectedStatuses([])}
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            selectedStatuses.length === 0
              ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
              : "bg-white dark:bg-neutral-300 border border-neutral-200 dark:border-neutral-300 text-neutral-600 dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-200"
          }`}
        >
          {t("common.all")}
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
                  ? getStatusColor(status) + " ring-1 ring-current shadow-sm"
                  : "bg-white dark:bg-neutral-300 border border-neutral-200 dark:border-neutral-300 text-neutral-600 dark:text-black hover:bg-neutral-50 dark:hover:bg-neutral-200"
              }`}
            >
              {t(`reports.status${status}`)}
            </button>
          );
        })}
        {/* Count badge */}
        <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-200 rounded-full border border-neutral-200 dark:border-neutral-200 shadow-sm animate-in fade-in zoom-in duration-300 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-black">
            {filteredCount}
          </span>
        </div>
      </div>
    </div>
  );
}
