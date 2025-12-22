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
import { Loader2 } from "lucide-react";

interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "default" | "cancel" | "destructive" | "success";
  loading?: boolean;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onRequestClose?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
}: CustomAlertProps) {
  if (!visible) return null;

  const getButtonStyle = (
    style?: "default" | "cancel" | "destructive" | "success"
  ) => {
    switch (style) {
      case "destructive":
        return "bg-red-500 text-white hover:bg-red-600";
      case "cancel":
        return "bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-600 dark:text-white dark:border-neutral-500 dark:hover:bg-neutral-500";
      case "success":
        return "bg-green-500 text-white hover:bg-green-600";
      case "default":
      default:
        return "bg-brand-primary text-white hover:opacity-90";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}

      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-[28px] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-center text-neutral-600 dark:text-neutral-300 text-base leading-relaxed mb-6">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onPress}
              disabled={button.loading}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center ${getButtonStyle(
                button.style
              )}`}
            >
              {button.loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                button.text
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
