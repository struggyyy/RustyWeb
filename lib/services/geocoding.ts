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

// Internal imports
import {
  POLISH_DISPLAY_NAMES,
  ENGLISH_TO_POLISH,
} from "@/lib/constants/locations";

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

// Queue system to respect Nominatim's rate limit
let requestQueue = Promise.resolve();

// Simple in-memory cache to prevent duplicate requests in the same session
const CACHE: Record<string, string> = {};

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
}

// Fetch city name from coordinates with caching and rate limiting
export async function getCityFromCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  const rLat = lat.toFixed(3);
  const rLng = lng.toFixed(3);
  const cacheKey = `geo:${rLat},${rLng}`;

  // 1. Check Memory Cache
  if (CACHE[cacheKey]) {
    return CACHE[cacheKey];
  }

  // 2. Check Local Storage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      CACHE[cacheKey] = stored;
      return stored;
    }
  }

  // 3. Chain request to queue
  const result = requestQueue.then(async () => {
    // Add delay to respect rate limit (1s)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await fetch(
        `${NOMINATIM_REVERSE_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        {
          headers: {
            "User-Agent": "RustyWeb/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.status}`);
      }

      const data = await response.json();
      const address = data.address;

      if (!address) {
        return "Unknown Location";
      }

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.hamlet ||
        address.suburb ||
        address.city_district ||
        address.county ||
        address.state ||
        "Unknown Location";

      // Save to caches
      CACHE[cacheKey] = city;
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, city);
      }

      return city;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Unknown Location";
    }
  });

  requestQueue = result.then(() => {}).catch(() => {});
  return result;
}

// Search locations by query string with English to Polish translation support
export async function searchLocations(
  query: string
): Promise<LocationSuggestion[]> {
  try {
    // 1. Check for English/Common names mapping
    let polishEquivalent: string | undefined;
    const queryLower = query.toLowerCase();

    // Exact match
    if (ENGLISH_TO_POLISH[queryLower]) {
      polishEquivalent = ENGLISH_TO_POLISH[queryLower];
    } else {
      // Partial match
      for (const [english, polish] of Object.entries(ENGLISH_TO_POLISH)) {
        if (english.startsWith(queryLower) || queryLower.startsWith(english)) {
          polishEquivalent = polish;
          break;
        }
      }
    }

    // 2. Build Search URL
    const buildUrl = (q: string) =>
      `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(
        q
      )}&limit=8&addressdetails=1&countrycodes=pl&dedupe=1&extratags=1&namedetails=1`;

    // 3. Perform primary search
    const response = await fetch(buildUrl(query));
    if (!response.ok) throw new Error("Geocoding service unavailable");
    let data = await response.json();

    // 4. Perform secondary search if equivalent found and not in first results
    if (
      polishEquivalent &&
      !data.some((item: any) => {
        const itemCity =
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.display_name.split(",")[0];
        return itemCity
          ?.toLowerCase()
          .includes(polishEquivalent!.toLowerCase());
      })
    ) {
      const polishResponse = await fetch(buildUrl(polishEquivalent));
      if (polishResponse.ok) {
        const polishData = await polishResponse.json();
        data = [...data, ...polishData];
      }
    }

    // 5. Process and Deduplicate Results
    const cityMap = new Map<string, LocationSuggestion>();

    data.forEach((item: any) => {
      const cityName =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality ||
        item.display_name.split(",")[0];

      if (!cityName) return;

      const cleanCityName = cityName.replace(/\s*\([^)]*\)\s*/g, "").trim();
      const cityKey = cleanCityName.toLowerCase().replace(/\s+/g, " ");
      const displayName = POLISH_DISPLAY_NAMES[cityKey] || cleanCityName;

      if (
        !cityMap.has(cleanCityName) ||
        item.importance > (cityMap.get(cleanCityName)?.importance || 0)
      ) {
        cityMap.set(cleanCityName, {
          place_id: item.place_id,
          display_name: displayName,
          lat: item.lat,
          lon: item.lon,
          importance: item.importance || 0,
        });
      }
    });

    return Array.from(cityMap.values())
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 5);
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
}
