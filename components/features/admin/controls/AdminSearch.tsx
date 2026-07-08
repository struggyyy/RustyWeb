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
import { Search, MapPin, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal imports
import { ReportStatus, reportStatuses } from "@/lib/types/reports";

interface AdminSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocationName: string;
  setSelectedLocationName: (name: string) => void;
  setFilterLocation: (
    loc: { latitude: number; longitude: number } | null,
  ) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  selectedStatuses: ReportStatus[];
  setSelectedStatuses: (statuses: ReportStatus[]) => void;
}

export function AdminSearch({
  searchQuery,
  setSearchQuery,
  selectedLocationName,
  setSelectedLocationName,
  setFilterLocation,
  setDateFrom,
  setDateTo,
  selectedStatuses,
  setSelectedStatuses,
}: AdminSearchProps) {
  const { t } = useTranslation();

  // Search state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>("");
  const [isMobile, setIsMobile] = useState(false);

  // Sync input with external state
  useEffect(() => {
    if (!searchQuery && !selectedLocationName) {
      setInputValue("");
    }
  }, [searchQuery, selectedLocationName]);

  // Handle responsiveness
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

  // Fetch locations from OpenStreetMap
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=50&addressdetails=1&countrycodes=pl`,
        {
          headers: {
            "Accept-Language": "pl",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const uniqueData = data.filter(
          (value: any, index: number, self: any[]) =>
            index ===
            self.findIndex((t) => t.display_name === value.display_name),
        );

        // Sort results by type relevance (cities first)
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

  // Handle input changes with debouncing
  const handleSearchChange = (val: string) => {
    setInputValue(val);

    if (val.trim() === "") {
      setSearchQuery("");
    }

    if (selectedLocationName) {
      return;
    }

    // Reset location filter if value changes after selection
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

  return (
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

            // Smart Search: Check for status match
            const matchedStatus = reportStatuses.find(
              (s) =>
                t(`reports.status${s}`).toLowerCase() === lowerVal ||
                s.toLowerCase() === lowerVal,
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

            // Smart Search: Check for date match
            let dateParsed: Date | null = null;
            if (/^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/.test(inputValue.trim())) {
              const parts = inputValue.trim().split(/[./-]/);
              dateParsed = new Date(
                parseInt(parts[2]),
                parseInt(parts[1]) - 1,
                parseInt(parts[0]),
              );
            } else {
              const trimmed = inputValue.trim();
              let potentialDate = new Date(trimmed);
              const hasYear = /\d{4}/.test(trimmed);

              if (!isNaN(potentialDate.getTime())) {
                if (!hasYear) {
                  potentialDate.setFullYear(new Date().getFullYear());
                }
                dateParsed = potentialDate;
              } else if (!hasYear) {
                const withYear = `${trimmed} ${new Date().getFullYear()}`;
                const retryDate = new Date(withYear);
                if (!isNaN(retryDate.getTime())) {
                  dateParsed = retryDate;
                }
              }
            }

            if (dateParsed && !isNaN(dateParsed.getTime())) {
              const year = dateParsed.getFullYear();
              const month = String(dateParsed.getMonth() + 1).padStart(2, "0");
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

      {/* Suggestions Overlay */}
      {showSuggestions && suggestions.length > 0 && !selectedLocationName && (
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
  );
}
