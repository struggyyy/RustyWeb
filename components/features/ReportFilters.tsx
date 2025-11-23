"use client";

import { ReportStatus, reportStatuses } from "@/types/reports";
import { useState, useEffect, useRef } from "react";

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
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
      // Using Nominatim (OpenStreetMap) API for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,de,fr,it,es,nl,be,ch,at,pl`
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name.split(',')[0] + (item.address?.state ? `, ${item.address.state}` : '') + (item.address?.country ? `, ${item.address.country}` : ''),
        lat: item.lat,
        lon: item.lon
      }));

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

  // Debounced location search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (locationQuery.trim()) {
        searchLocations(locationQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setLocationError("");
        onLocationChange("", undefined);
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
    onLocationChange(suggestion.display_name, coords);
    setShowSuggestions(false);
    setLocationError("");
  };

  const handleLocationInputChange = (value: string) => {
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
            Location (City, Street, or Coordinates)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={locationQuery}
            onChange={(e) => handleLocationInputChange(e.target.value)}
            placeholder="Start typing a city name or enter coordinates..."
            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600 placeholder-neutral-400"
          />

          {/* Loading indicator */}
          {isLoadingSuggestions && (
            <div className="absolute right-3 top-9 flex items-center">
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

          {/* Helper text */}
          <p className="text-xs text-neutral-400 mt-1">
            Type at least 3 characters for city suggestions, or use coordinates format: lat,lng
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
            placeholder="5"
            min="0"
            step="0.1"
            className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-neutral-600 placeholder-neutral-400"
          />
          {filterRadius && filterRadius > 0 && (
            <p className="text-xs text-neutral-400 mt-1">
              Within {filterRadius}km radius
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
