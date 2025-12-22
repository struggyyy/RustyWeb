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
import React, { useRef } from "react";

// External libraries
import { User, Camera } from "lucide-react";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  isEditing: boolean;
  uploadingImage: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageClick: () => void;
}

export default function ProfileAvatar({
  imageUrl,
  isEditing,
  uploadingImage,
  onImageUpload,
  onImageClick,
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mb-6">
      <div
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-700 shadow-2xl dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer transition-transform hover:scale-[1.02] group"
        onClick={onImageClick}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
            <User className="w-16 h-16" />
          </div>
        )}

        {/* Hover Overlay for View */}
        {imageUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center rounded-full"></div>
        )}
      </div>

      {/* Upload Button (Floating) */}
      {isEditing && (
        <>
          <div
            className="absolute bottom-1 right-1 w-9 h-9 bg-neutral-900 dark:bg-neutral-700 text-white rounded-full shadow-lg cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-600 hover:scale-110 transition-all border-4 border-white dark:border-neutral-800 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingImage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onImageUpload}
          />
        </>
      )}
    </div>
  );
}
