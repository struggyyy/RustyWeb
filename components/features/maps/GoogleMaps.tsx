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
import { useEffect, useRef, useState } from "react";

// External libraries
import { MapPin } from "lucide-react";

// Internal imports
import { Report } from "@/lib/types/reports";
import { useTheme } from "@/components/context/ThemeProvider";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { getPinColor, getReportCoordinates } from "@/lib/utils/maps";
import { nightMapStyle } from "@/lib/mapStyles";
import MapControls from "./MapControls";

interface GoogleMapsProps {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  className?: string;
  focusedLocation?: { latitude: number; longitude: number } | null;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMaps({
  reports,
  onMarkerClick,
  className,
  focusedLocation,
}: GoogleMapsProps) {
  const { theme } = useTheme();
  const { isLoaded, loadError } = useGoogleMaps();

  const isDark = theme === "dark";
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);

  // Initialize and update map
  useEffect(() => {
    if (!isLoaded || !window.google || !mapRef.current) return;

    const initMap = async () => {
      try {
        await window.google.maps.importLibrary("maps");

        // Default: Center of Poland
        let center = { lat: 52.2, lng: 19.1 };
        let zoom = 6;

        if (focusedLocation) {
          center = {
            lat: focusedLocation.latitude,
            lng: focusedLocation.longitude,
          };
          zoom = 15;
        } else if (reports.length > 0) {
          // Calculate center based on valid report locations
          let validReports = 0;
          let totalLat = 0;
          let totalLng = 0;

          reports.forEach((report) => {
            const coords = getReportCoordinates(report);
            if (coords) {
              totalLat += coords.lat;
              totalLng += coords.lng;
              validReports++;
            }
          });

          if (validReports > 0) {
            center = {
              lat: totalLat / validReports,
              lng: totalLng / validReports,
            };
            zoom = reports.length > 1 ? 10 : 12;
          }
        }

        const mapOptions = {
          center,
          zoom,
          mapTypeId: "roadmap",
          disableDefaultUI: true, // Use custom controls
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          styles: isDark ? nightMapStyle : [],
        };

        googleMapRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions
        );

        // Clear existing markers
        markersRef.current.forEach((marker) => (marker.map = null));
        markersRef.current = [];

        // Add new markers
        reports.forEach((report) => {
          const coords = getReportCoordinates(report);
          if (!coords) return;

          const pinColor = getPinColor(report.status);

          // SVG Icon for marker
          const svgString = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${pinColor}" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
            </svg>
          `;

          const iconUrl =
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(svgString.trim());

          const marker = new window.google.maps.Marker({
            position: coords,
            map: googleMapRef.current,
            title: `Report #${report.id.slice(0, 6)}`,
            icon: {
              url: iconUrl,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            },
          });

          marker.addListener("click", () => {
            onMarkerClick(report);
          });

          markersRef.current.push(marker);
        });

        // Fit bounds logic
        if (reports.length > 1 && !focusedLocation) {
          const bounds = new window.google.maps.LatLngBounds();
          let validBoundsCount = 0;

          reports.forEach((report) => {
            const coords = getReportCoordinates(report);
            if (coords) {
              bounds.extend(coords);
              validBoundsCount++;
            }
          });

          if (validBoundsCount > 1) {
            googleMapRef.current.fitBounds(bounds);

            // Avoid zooming in too close automatically
            const listener = window.google.maps.event.addListener(
              googleMapRef.current,
              "idle",
              () => {
                if (googleMapRef.current.getZoom() > 15) {
                  googleMapRef.current.setZoom(15);
                }
                window.google.maps.event.removeListener(listener);
              }
            );
          }
        }

        // Street View listener
        const panorama = googleMapRef.current.getStreetView();
        if (panorama) {
          panorama.addListener("visible_changed", () => {
            setIsStreetViewVisible(panorama.getVisible());
          });
        }
      } catch (error) {
        console.error("Error initializing Google Map:", error);
      }
    };

    initMap();
  }, [isLoaded, reports, onMarkerClick, focusedLocation]);

  // Handle focused location change separate from init
  useEffect(() => {
    if (googleMapRef.current && focusedLocation) {
      googleMapRef.current.panTo({
        lat: focusedLocation.latitude,
        lng: focusedLocation.longitude,
      });
      googleMapRef.current.setZoom(15);
    }
  }, [focusedLocation]);

  // Theme update effect
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setOptions({
        styles: isDark ? nightMapStyle : [],
      });
    }
  }, [isDark]);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 rounded-xl border border-neutral-200 ${className}`}
      >
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">
            Map Unavailable
          </h3>
          <p className="text-neutral-500 text-sm leading-relaxed">
            {loadError}
          </p>
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-600">
              <strong>For administrators:</strong> Configure Google Maps API key
              in environment variables to enable map functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions for controls
  const handleZoomIn = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom(googleMapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom(googleMapRef.current.getZoom() - 1);
    }
  };

  const handleMapTypeChange = (type: "roadmap" | "satellite") => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(type);
      setMapType(type);
    }
  };

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 rounded-xl border border-neutral-200 ${className}`}
      >
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} group`}>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Custom Controls Overlay */}
      <MapControls
        mapType={mapType}
        onMapTypeChange={handleMapTypeChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isVisible={!isStreetViewVisible}
      />

      {/* No reports message overlay */}
      {reports.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg max-w-sm mx-4">
            <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No Reports Found
            </h3>
            <p className="text-neutral-500 text-sm">
              No reports match your selected filters. Try adjusting your search
              criteria to see more results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
