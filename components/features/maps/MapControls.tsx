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

// External libraries
import { Layers, Map as MapIcon, Minus, Plus } from "lucide-react";

interface MapControlsProps {
  mapType: "roadmap" | "satellite";
  onMapTypeChange: (type: "roadmap" | "satellite") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isVisible: boolean;
}

export default function MapControls({
  mapType,
  onMapTypeChange,
  onZoomIn,
  onZoomOut,
  isVisible,
}: MapControlsProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* Map Type Toggle */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
        <button
          onClick={() => onMapTypeChange("roadmap")}
          className={`p-2 transition-colors ${
            mapType === "roadmap"
              ? "bg-neutral-100 dark:bg-neutral-700 text-brand-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          }`}
          title="Map View"
        >
          <MapIcon className="w-5 h-5" />
        </button>
        <div className="h-[1px] bg-neutral-200 dark:bg-neutral-700 w-full" />
        <button
          onClick={() => onMapTypeChange("satellite")}
          className={`p-2 transition-colors ${
            mapType === "satellite"
              ? "bg-neutral-100 dark:bg-neutral-700 text-brand-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          }`}
          title="Satellite View"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col mt-2">
        <button
          onClick={onZoomIn}
          className="p-2 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="h-[1px] bg-neutral-200 dark:bg-neutral-700 w-full" />
        <button
          onClick={onZoomOut}
          className="p-2 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
