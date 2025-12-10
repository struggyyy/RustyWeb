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
import React from "react";

export default function ReportCardSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 shadow-sm p-3 sm:p-5 rounded-2xl animate-pulse">
      <div className="flex flex-row items-center gap-3 md:gap-4">
        {/* Image Placeholder */}
        <div className="w-24 h-24 min-[450px]:w-32 min-[450px]:h-28 sm:w-40 sm:h-32 bg-neutral-200/50 rounded-xl flex-shrink-0" />

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-row items-center justify-between py-1 gap-2">
          {/* Left Info Group */}
          <div className="flex flex-col gap-2 items-start w-full">
            {/* Date */}
            <div className="h-5 sm:h-7 w-24 sm:w-32 bg-neutral-200/50 rounded-lg" />

            {/* City Name */}
            <div className="h-4 sm:h-5 w-20 sm:w-28 bg-neutral-200/50 rounded-lg" />

            {/* Coordinates */}
            <div className="h-3 sm:h-4 w-16 sm:w-24 bg-neutral-200/50 rounded-lg" />
          </div>

          {/* Right Actions Group */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-3 h-full justify-center pl-2">
            {/* Status Badge */}
            <div className="h-5 sm:h-7 w-16 sm:w-24 bg-neutral-200/50 rounded-full" />

            {/* Points */}
            <div className="h-4 sm:h-5 w-12 sm:w-16 bg-neutral-200/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
