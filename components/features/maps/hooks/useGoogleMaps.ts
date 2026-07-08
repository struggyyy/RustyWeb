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
import { useState, useEffect, useRef } from "react";

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.importLibrary
      ) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (scriptLoadedRef.current) {
        // Wait for it to load
        const checkGoogle = () => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.importLibrary
          ) {
            setIsLoaded(true);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      // Check if script element already exists
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );
      if (existingScript) {
        scriptLoadedRef.current = true;
        // Wait for it to load
        const checkGoogle = () => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.importLibrary
          ) {
            setIsLoaded(true);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setLoadError(
          "Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.",
        );
        return;
      }

      scriptLoadedRef.current = true;

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&v=weekly`;
      script.async = true;

      const scriptLoadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          // Wait a bit more to ensure libraries are fully loaded
          setTimeout(() => {
            if (
              window.google &&
              window.google.maps &&
              window.google.maps.importLibrary
            ) {
              resolve();
            } else {
              reject(new Error("Google Maps libraries not fully loaded"));
            }
          }, 500);
        };

        script.onerror = (error) => {
          console.error("Google Maps script load error:", error);
          reject(
            new Error(
              "Failed to load Google Maps. Please check your internet connection and API key.",
            ),
          );
        };
      });

      document.head.appendChild(script);

      try {
        await scriptLoadPromise;
        setIsLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load Google Maps",
        );
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, loadError };
};
