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
// External imports
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: "900px",
      md: "768px", // Keeping standard md just in case, though we use sm mostly
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "sidebar-break": "1140px",
    },
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)", // Main brand color
        },
        neutral: {
          50: "var(--neutral-50)", // White backgrounds, text on dark
          100: "var(--neutral-100)", // Medium gray for backgrounds and borders
          200: "var(--neutral-200)", // Tertiary text, disabled states
          300: "var(--neutral-300)", // Primary text
          400: "var(--neutral-400)", // Dark gray text
          500: "var(--neutral-500)", // Black for shadows
          800: "var(--neutral-800)", // Deep dark
        },
        status: {
          Submitted: "var(--status-Submitted)", // Blue for submitted
          Accepted: "var(--status-Accepted)", // Teal for accepted
          Completed: "var(--status-Completed)", // Green for completed
          Canceled: "var(--status-Canceled)", // Red for canceled
        },
        text: {
          primary: "var(--text-primary)", // neutral[300]
          tertiary: "var(--text-tertiary)", // neutral[200]
          inverse: "var(--text-inverse)", // neutral[50]
          dark: "var(--text-dark)", // neutral[400]
        },
        border: {
          default: "var(--border-default)", // neutral[100]
        },
        error: "#C62828",
      },
      keyframes: {
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
