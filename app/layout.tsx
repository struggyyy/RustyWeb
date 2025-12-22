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

// React/Side-effects imports
import "./globals.css";

// External libraries
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Internal imports
import { AuthProvider } from "@/components/context/AuthContext";
import { ThemeProvider } from "@/components/context/ThemeProvider";
import BackgroundPattern from "@/components/common/BackgroundPattern";
import I18nProvider from "@/components/context/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rusty - Modern City Reporting",
  description: "Empowering citizens to build better cities.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Global Providers Wrapper */}
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <BackgroundPattern pattern="checker" />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
