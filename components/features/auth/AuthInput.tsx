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
import React, { useState } from "react";

// External libraries
import { Eye, EyeOff, LucideIcon, XCircle } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  isError?: boolean;
  onClear?: () => void;
  showClearButton?: boolean;
}

export default function AuthInput({
  label,
  icon: Icon,
  isError,
  type = "text",
  className,
  onClear,
  showClearButton,
  value,
  onChange,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  // Derived Styles
  const getInputWrapperClass = (hasError?: boolean) => `
    relative w-full rounded-xl transition-all duration-300 font-medium
    ${
      hasError
        ? "bg-red-50/50 dark:bg-red-900/20 shadow-[0_8px_30px_rgb(239,68,68,0.15)] ring-1 ring-red-100 dark:ring-red-800"
        : "bg-white dark:bg-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.25)] dark:focus-within:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
    }
  `;

  // Base input text styles
  const inputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-text-dark placeholder:text-text-tertiary placeholder:font-normal";

  // Error state input text styles (red text)
  const errorInputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-red-900 placeholder:text-red-300 placeholder:font-normal";

  // Combine appropriate classes
  const finalInputClass = `${
    isError ? errorInputClass : inputClass
  } dark:text-neutral-900 dark:placeholder:text-neutral-500 ${className || ""}`;

  return (
    <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
      <label
        suppressHydrationWarning
        className="text-xs min-[600px]:text-sm font-bold text-text-dark dark:text-neutral-200 uppercase tracking-wide"
      >
        {label}
      </label>
      <div className={getInputWrapperClass(isError)}>
        {Icon && (
          <Icon
            className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              isError
                ? "text-red-400"
                : "text-text-tertiary dark:text-neutral-500"
            }`}
          />
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          className={finalInputClass}
          {...props}
        />

        {/* Password Visibility Toggle */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-neutral-500 hover:text-text-primary dark:hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Clear Button (only if not password and explicitly enabled & has value) */}
        {!isPasswordType && showClearButton && value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-neutral-500 hover:text-text-primary dark:hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
