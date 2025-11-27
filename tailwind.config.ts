import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '900px',
      'md': '768px', // Keeping standard md just in case, though we use sm mostly
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'sidebar-break': '1140px',
    },
    extend: {
      colors: {
        brand: {
          primary: "#BD5151", // Main brand color
        },
        neutral: {
          50: "#FFFFFF",   // White backgrounds, text on dark
          100: "#CECECEFF", // Medium gray for backgrounds and borders (Note: FF opacity is implicit in hex but good to match)
          200: "#9E9E9E",   // Tertiary text, disabled states
          300: "#656565",   // Primary text
          400: "#333333",   // Dark gray text
          500: "#000000",   // Black for shadows
        },
        status: {
          Submitted: "#1976D2", // Blue for submitted
          Accepted: "#00796B",  // Teal for accepted
          Completed: "#2E7D32", // Green for completed
          Canceled: "#C62828",  // Red for canceled
        },
        text: {
          primary: "#656565",   // neutral[300]
          tertiary: "#9E9E9E",  // neutral[200]
          inverse: "#FFFFFF",   // neutral[50]
          dark: "#333333",      // neutral[400]
        },
        border: {
          default: "#CECECEFF", // neutral[100]
        },
        error: "#C62828",
      },
    },
  },
  plugins: [],
};
export default config;
