import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import BackgroundPattern from "@/components/common/BackgroundPattern";

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
        <AuthProvider>
          <BackgroundPattern pattern="checker" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
