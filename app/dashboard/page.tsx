"use client";

import Link from "next/link";
import { MapPin, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { Report } from "@/types/reports";
import ReportCard from "@/components/features/ReportCard";
import UserReportModal from "@/components/features/UserReportModal";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const { user, logOut, isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait for authentication to load before checking user state
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (isAdmin) {
      router.push("/admin");
      return;
    }

    const q = query(
      collection(db, "reports"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(fetchedReports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router, isAdmin, authLoading]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete report:", reportId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Rusty Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-neutral-600">
            Rusty
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-base font-medium text-neutral-500 truncate max-w-[80px] sm:max-w-none">
              {user?.email}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
            </div>
          </div>
          <Link
            href="/settings"
            className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
          </Link>
          <button
            onClick={() => logOut()}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl sm:max-w-7xl mx-auto p-3 sm:p-8">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-neutral-700 mb-2">
            My Reports
          </h1>
          <p className="text-neutral-500 text-sm sm:text-lg">
            Track the status of your submitted reports.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center border border-neutral-100 shadow-sm">
            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 sm:w-10 sm:h-10 text-neutral-300" />
            </div>
            <h3 className="text-base sm:text-xl font-bold text-neutral-600 mb-2">
              No reports yet
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto text-sm sm:text-lg">
              You haven't submitted any reports yet. Use the mobile app to
              report issues in your city.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isAdmin={false}
                onDetailsPress={handleDetailsPress}
              />
            ))}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <UserReportModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
          onDelete={() => handleDeleteReport(selectedReport.id)}
        />
      )}
    </div>
  );
}
