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
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// External libraries
import { X } from "lucide-react";

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
}

export default function ProfileImageModal({
  isOpen,
  onClose,
  imageUrl,
  title = "Profile Picture",
}: ProfileImageModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !imageUrl) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-200 rounded-[32px] shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-300">
          <h3 className="text-xl font-black text-neutral-800 dark:text-black tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 dark:text-black hover:text-neutral-600 dark:hover:text-black/70 hover:bg-neutral-100 dark:hover:bg-neutral-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-8 flex items-center justify-center bg-white dark:bg-neutral-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-sm dark:shadow-md border border-neutral-100 dark:border-neutral-300"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
