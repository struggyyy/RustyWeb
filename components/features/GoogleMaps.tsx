"use client";

import { useEffect, useRef, useState } from "react";
import { Report } from "@/types/reports";
import { MapPin } from "lucide-react";

interface GoogleMapsProps {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMaps({ reports, onMarkerClick, className }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // Get pin color based on report status
  const getPinColor = (status: string): string => {
    switch (status) {
      case "Submitted": return "#1976D2"; // Blue
      case "Accepted": return "#00796B";  // Teal
      case "Completed": return "#2E7D32"; // Green
      case "Canceled": return "#C62828";  // Red
      default: return "#6366f1"; // Default indigo
    }
  };

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.importLibrary) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (scriptLoadedRef.current) {
        // Wait for it to load
        const checkGoogle = () => {
          if (window.google && window.google.maps && window.google.maps.importLibrary) {
            setIsLoaded(true);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      // Check if script element already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        scriptLoadedRef.current = true;
        // Wait for it to load
        const checkGoogle = () => {
          if (window.google && window.google.maps && window.google.maps.importLibrary) {
            setIsLoaded(true);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        setLoadError('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
        return;
      }

      scriptLoadedRef.current = true;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&v=beta`;
      script.async = true;

      const scriptLoadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          // Wait a bit more to ensure libraries are fully loaded
          setTimeout(() => {
            if (window.google && window.google.maps && window.google.maps.importLibrary) {
              resolve();
            } else {
              reject(new Error('Google Maps libraries not fully loaded'));
            }
          }, 500);
        };

        script.onerror = (error) => {
          console.error('Google Maps script load error:', error);
          reject(new Error('Failed to load Google Maps. Please check your internet connection and API key.'));
        };
      });

      document.head.appendChild(script);

      try {
        await scriptLoadPromise;
        setIsLoaded(true);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load Google Maps');
      }
    };

    loadGoogleMaps();

    return () => {
      // Don't remove the script on cleanup to prevent issues with multiple components
      // The script will remain loaded for the session
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !window.google || !mapRef.current) return;

    const initMap = async () => {
      try {
        const { Map } = await window.google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

        // Calculate center and zoom based on reports
        let center = { lat: 52.2, lng: 19.1 }; // Center of Poland
        let zoom = 6; // Zoom level to show entire Poland
        
        if (reports.length > 0) {
          // Calculate center based on reports when they exist
          let validReports = 0;
          let totalLat = 0;
          let totalLng = 0;

          reports.forEach((report) => {
            if (!report.location || typeof report.location !== 'object') {
              return; // Skip invalid location
            }

            const location = report.location as any;
            let lat: number, lng: number;

            if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
              lat = location.latitude;
              lng = location.longitude;
            } else if (typeof location.lat === 'number' && typeof location.lng === 'number') {
              lat = location.lat;
              lng = location.lng;
            } else {
              return; // Skip invalid location
            }

            totalLat += lat;
            totalLng += lng;
            validReports++;
          });

          if (validReports > 0) {
            center = { lat: totalLat / validReports, lng: totalLng / validReports };
            zoom = reports.length > 1 ? 10 : 12; // Normal zoom for reports
          }
        }

        const mapOptions = {
          center,
          zoom,
          mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          // Styles property removed as it conflicts with mapId
        };

        googleMapRef.current = new Map(mapRef.current, mapOptions);

        // Add markers
        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];

        reports.forEach((report) => {
          if (!report.location || typeof report.location !== 'object') {
            return;
          }

          const location = report.location as any;
          let lat: number, lng: number;

          if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            lat = location.latitude;
            lng = location.longitude;
          } else if (typeof location.lat === 'number' && typeof location.lng === 'number') {
            lat = location.lat;
            lng = location.lng;
          } else {
            return;
          }

          // Create pin element
          const pinElement = document.createElement('div');
          const pinColor = getPinColor(report.status);
          pinElement.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${pinColor}" stroke="white" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
            </svg>
          `;

          const marker = new AdvancedMarkerElement({
            position: { lat, lng },
            map: googleMapRef.current,
            title: `Report #${report.id.slice(0, 6)}`,
            content: pinElement
          });

          marker.addListener('click', () => {
            onMarkerClick(report);
          });

          markersRef.current.push(marker);
        });

        // Fit bounds only when there are multiple reports
        if (reports.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          let validBoundsCount = 0;

          reports.forEach(report => {
            if (!report.location || typeof report.location !== 'object') return;
            const location = report.location as any;
            let lat: number, lng: number;

            if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
              lat = location.latitude;
              lng = location.longitude;
            } else if (typeof location.lat === 'number' && typeof location.lng === 'number') {
              lat = location.lat;
              lng = location.lng;
            } else {
              return;
            }

            bounds.extend({ lat, lng });
            validBoundsCount++;
          });

          if (validBoundsCount > 1) {
            googleMapRef.current.fitBounds(bounds);
            
            const listener = window.google.maps.event.addListener(googleMapRef.current, 'idle', () => {
              if (googleMapRef.current.getZoom() > 15) {
                googleMapRef.current.setZoom(15);
              }
              window.google.maps.event.removeListener(listener);
            });
          }
        }

      } catch (error) {
        console.error('Error initializing Google Map:', error);
        setLoadError('Failed to initialize map');
      }
    };

    initMap();
  }, [isLoaded, reports, onMarkerClick]);

  // Removed separate marker effect since it's now handled in initMap
  // To support dynamic updates, we would need to separate them again, but for now let's initialize together to ensure libraries are loaded.
  // Actually, to support updates when 'reports' change without re-initializing the map, we should keep the map instance but update markers.
  // But 'importLibrary' is async, so we need to handle that.
  // Let's stick to this combined effect for simplicity and correctness first.


  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-xl border border-neutral-200 ${className}`}>
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">Map Unavailable</h3>
          <p className="text-neutral-500 text-sm leading-relaxed">
            {loadError}
          </p>
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-600">
              <strong>For administrators:</strong> Configure Google Maps API key in environment variables to enable map functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 rounded-xl border border-neutral-200 ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      
      {/* No reports message overlay */}
      {reports.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg max-w-sm mx-4">
            <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No Reports Found
            </h3>
            <p className="text-neutral-500 text-sm">
              No reports match your selected filters. Try adjusting your search criteria to see more results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
