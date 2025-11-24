"use client";

import { ReportStatus, reportStatuses } from "@/types/reports";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
}

interface ReportFiltersProps {
  // Status filtering
  selectedStatuses: ReportStatus[];
  onStatusesChange: (statuses: ReportStatus[]) => void;

  // Location filtering
  locationQuery: string;
  onLocationChange: (location: string, coords?: { latitude: number; longitude: number }) => void;

  // Radius filtering
  filterRadius: number | null;
  onRadiusChange: (radius: number | null) => void;
}

export default function ReportFilters({
  selectedStatuses,
  onStatusesChange,
  locationQuery,
  onLocationChange,
  filterRadius,
  onRadiusChange
}: ReportFiltersProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string>("");

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Submitted": return "bg-status-Submitted/10 text-status-Submitted border-status-Submitted/20";
      case "Accepted": return "bg-status-Accepted/10 text-status-Accepted border-status-Accepted/20";
      case "Completed": return "bg-status-Completed/10 text-status-Completed border-status-Completed/20";
      case "Canceled": return "bg-status-Canceled/10 text-status-Canceled border-status-Canceled/20";
      default: return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  };

  const handleShowAllPress = () => {
    onStatusesChange([]);
  };

  const handleStatusToggle = (status: ReportStatus) => {
    if (!selectedStatuses || selectedStatuses.length === 0) {
      onStatusesChange([status]);
      return;
    }
    const exists = selectedStatuses.includes(status);
    let next = exists
      ? selectedStatuses.filter((s: ReportStatus) => s !== status)
      : [...selectedStatuses, status];
    // If all statuses are selected, collapse to Show All (empty selection)
    if (next.length === reportStatuses.length) {
      next = [];
    }
    onStatusesChange(next);
  };

  // Geocode location with autocomplete suggestions
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setLocationError("");

    try {
      // Using Nominatim (OpenStreetMap) API for free geocoding - Poland only
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=pl&dedupe=1&extratags=1&namedetails=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      // Map Polish city names to their proper display versions
      const polishDisplayNames: { [key: string]: string } = {
        'krakow': 'Kraków',
        'warszawa': 'Warszawa',
        'gdansk': 'Gdańsk',
        'wroclaw': 'Wrocław',
        'poznan': 'Poznań',
        'lodz': 'Łódź',
        'szczecin': 'Szczecin',
        'bydgoszcz': 'Bydgoszcz',
        'lublin': 'Lublin',
        'katowice': 'Katowice',
        'bialystok': 'Białystok',
        'gdynia': 'Gdynia',
        'czestochowa': 'Częstochowa',
        'radom': 'Radom',
        'torun': 'Toruń',
        'gliwice': 'Gliwice',
        'zabrze': 'Zabrze',
        'olsztyn': 'Olsztyn',
        'rzeszow': 'Rzeszów',
        'kielce': 'Kielce',
        'zielona gora': 'Zielona Góra',
        'opole': 'Opole'
      };

      // Create a map of English to Polish city names for major cities
      const englishToPolish: { [key: string]: string } = {
        'warsaw': 'Warszawa',
        'cracow': 'Kraków',
        'cracovia': 'Kraków',
        'crac': 'Kraków',
        'gdansk': 'Gdańsk',
        'danzig': 'Gdańsk',
        'wroclaw': 'Wrocław',
        'breslau': 'Wrocław',
        'poznan': 'Poznań',
        'lodz': 'Łódź',
        'szczecin': 'Szczecin',
        'bydgoszcz': 'Bydgoszcz',
        'lublin': 'Lublin',
        'katowice': 'Katowice',
        'bialystok': 'Białystok',
        'gdynia': 'Gdynia',
        'czestochowa': 'Częstochowa',
        'radom': 'Radom',
        'torun': 'Toruń',
        'gliwice': 'Gliwice',
        'zabrze': 'Zabrze',
        'olsztyn': 'Olsztyn',
        'rzeszow': 'Rzeszów',
        'kielce': 'Kielce',
        'zielona gora': 'Zielona Góra',
        'opole': 'Opole',
        'krakow': 'Kraków',
        'warszawa': 'Warszawa'
      };

      // Check if the query matches an English city name (exact or partial)
      let polishEquivalent: string | undefined;
      const queryLower = query.toLowerCase();

      // First check for exact matches
      if (englishToPolish[queryLower]) {
        polishEquivalent = englishToPolish[queryLower];
      } else {
        // Check for partial matches (e.g., "crac" should match "cracow")
        for (const [english, polish] of Object.entries(englishToPolish)) {
          if (english.startsWith(queryLower) || queryLower.startsWith(english)) {
            polishEquivalent = polish;
            break;
          }
        }
      }

      let searchData = data;

      // If we found an English equivalent, also search for the Polish name
      if (polishEquivalent && !data.some((item: any) => {
        const itemCity = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.display_name.split(',')[0];
        return itemCity.includes(polishEquivalent!);
      })) {
        const polishResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(polishEquivalent)}&limit=3&addressdetails=1&countrycodes=pl&dedupe=1`
        );
        if (polishResponse.ok) {
          const polishData = await polishResponse.json();
          searchData = [...data, ...polishData];
        }
      }

      // Group by city name to remove duplicates
      const cityMap = new Map<string, LocationSuggestion>();

      searchData.forEach((item: any) => {
        const cityName = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.display_name.split(',')[0];
        const cleanCityName = cityName.replace(/\s*\([^)]*\)\s*/g, '').trim(); // Remove parentheses

        // Get the proper Polish display name if available
        const cityKey = cleanCityName.toLowerCase().replace(/\s+/g, ' ');
        const displayName = polishDisplayNames[cityKey] || cleanCityName;

        if (!cityMap.has(cleanCityName) || (item.importance > (cityMap.get(cleanCityName)?.importance || 0))) {
          cityMap.set(cleanCityName, {
            place_id: item.place_id,
            display_name: displayName,
            lat: item.lat,
            lon: item.lon,
            importance: item.importance || 0
          });
        }
      });

      const formattedSuggestions: LocationSuggestion[] = Array.from(cityMap.values())
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 5);

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Unable to search locations. Please try coordinates format: lat,lng');
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle initial mount - set up selected city if locationQuery exists
  useEffect(() => {
    if (locationQuery.trim()) {
      // Check if it's coordinates format
      const coordMatch = locationQuery.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (!coordMatch) {
        // It's a city name, assume it's already selected
        lastSelectedRef.current = locationQuery;
      }
    }
  }, []); // Empty dependency array - only runs on mount

  // Debounced location search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (locationQuery.trim() && locationQuery !== lastSelectedRef.current) {
        searchLocations(locationQuery);
      } else {
        // Don't show suggestions for already selected cities or empty input
        setSuggestions([]);
        setShowSuggestions(false);
        if (!locationQuery.trim()) {
          setLocationError("");
        }
      }
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [locationQuery]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const coords = {
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    };
    lastSelectedRef.current = suggestion.display_name;
    onLocationChange(suggestion.display_name, coords);
    setShowSuggestions(false);
    setLocationError("");
  };

  const handleLocationInputChange = (value: string) => {
    // Reset last selected if user is typing something different
    if (value !== lastSelectedRef.current) {
      lastSelectedRef.current = "";
    }
    onLocationChange(value);

    // Check if it's coordinate format
    const coordMatch = value.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onLocationChange(value, { latitude: lat, longitude: lng });
        setSuggestions([]);
        setShowSuggestions(false);
        setLocationError("");
        return;
      }
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      handleLocationSelect(suggestions[0]); // Select first suggestion
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClearLocation = () => {
    lastSelectedRef.current = "";
    onLocationChange("", undefined);
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationError("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleShowAllPress}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedStatuses.length === 0
              ? "bg-brand-primary text-white"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Show All
        </button>
        {reportStatuses.map((status) => {
          const isSelected = selectedStatuses?.includes(status) ?? false;
          return (
            <button
              key={status}
              onClick={() => handleStatusToggle(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? `${getStatusColor(status)} border-2`
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* Location and Radius Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-neutral-600 mb-2">
            Location (Polish City, Street, or Coordinates)
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={locationQuery}
              onChange={(e) => handleLocationInputChange(e.target.value)}
              onKeyDown={handleLocationKeyDown}
              placeholder="Select a city to show reports from that area (50km radius)"
              className="w-full pr-10 px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600 placeholder-neutral-400"
            />

            {/* Clear button */}
            {locationQuery && (
              <button
                onClick={handleClearLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                title="Clear location"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Loading indicator */}
          {isLoadingSuggestions && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center ${locationQuery ? 'right-8' : ''}`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 focus:outline-none focus:bg-neutral-50"
                >
                  <div className="text-sm font-medium text-neutral-700">{suggestion.display_name}</div>
                  <div className="text-xs text-neutral-500">
                    {parseFloat(suggestion.lat).toFixed(4)}, {parseFloat(suggestion.lon).toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Error message */}
          {locationError && (
            <p className="text-xs text-red-500 mt-1">{locationError}</p>
          )}

          <p className="text-xs text-neutral-400 mt-1">
            Selecting a city shows reports within 50km. Use radius input for custom range.
          </p>
        </div>

        <div className="sm:w-32">
          <label className="block text-sm font-medium text-neutral-600 mb-2">
            Radius (km)
          </label>
          <input
            type="number"
            value={filterRadius || ""}
            onChange={(e) => onRadiusChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Custom radius (default 50km)"
            min="0"
            step="0.1"
            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600 placeholder-neutral-400"
          />
          {filterRadius !== null && filterRadius > 0 && (
            <p className="text-xs text-neutral-400 mt-1">
              Custom: {filterRadius}km radius
            </p>
          )}
          {filterRadius === null && locationQuery && (
            <p className="text-xs text-neutral-400 mt-1">
              Using default 50km radius
            </p>
          )}
          {filterRadius === null && !locationQuery && (
            <p className="text-xs text-neutral-400 mt-1">
              No location selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
