"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

type Theme = "light" | "dark";

// We can simply export the provider directly if we don't need custom logic,
// but keeping the wrapper allows us to maintain the exact interface consumption.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

// Wrapper hook to expose consistent interface
export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  // normalizedTheme handles 'system' preference resolution if needed,
  // but for simple toggle, we just return theme and a toggler.

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return {
    theme: (theme === "system" ? systemTheme : theme) as Theme,
    toggleTheme,
    setTheme,
  };
}
