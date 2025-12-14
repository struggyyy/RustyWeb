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

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";

// Queue system to respect Nominatim's rate limit
let requestQueue = Promise.resolve();

// Simple in-memory cache to prevent duplicate requests in the same session
const CACHE: Record<string, string> = {};

/**
 * Fetches the city, town, or village name from coordinates using Nominatim.
 * Includes caching and rate limiting.
 */
export async function getCityFromCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  // Round coordinates to ~110m precision (3 decimal places) to increase cache hits
  // for nearby reports and reduce API load.
  const rLat = lat.toFixed(3);
  const rLng = lng.toFixed(3);
  const cacheKey = `geo:${rLat},${rLng}`;

  // 1. Check Memory Cache
  if (CACHE[cacheKey]) {
    return CACHE[cacheKey];
  }

  // 2. Check Local Storage (Client-side only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      CACHE[cacheKey] = stored;
      return stored;
    }
  }

  // 3. Chain request to queue
  const result = requestQueue.then(async () => {
    // Add a delay to respect the rate limit (1s)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10`,
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

      // Prioritize specific locality names
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

  // Update the queue tail
  requestQueue = result.then(() => {}).catch(() => {});

  return result;
}
