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
// React-specific imports
import React from "react";

// External libraries
import { Loader2, LucideIcon } from "lucide-react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function AuthButton({
  isLoading,
  icon: Icon,
  children,
  className,
  disabled,
  variant = "primary",
  ...props
}: AuthButtonProps) {
  // Button styles
  const baseClass =
    "w-full py-2.5 min-[600px]:py-4 rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-brand-primary text-text-inverse" // Brand primary color
      : "bg-neutral-100 text-text-dark dark:bg-neutral-800 dark:text-white"; // Secondary neutral style

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseClass} ${variantClass} ${className || ""}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          {children}
        </>
      )}
    </button>
  );
}
