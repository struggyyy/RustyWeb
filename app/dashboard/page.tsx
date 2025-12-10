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

// React specific imports
import { useEffect, useState } from "react";

// External libraries
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

// Internal imports
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { Report } from "@/types/reports";
import ReportCard from "@/components/features/ReportCard";
import UserReportModal from "@/components/features/UserReportModal";
import DashboardHeader from "@/components/layout/DashboardHeader";

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
    <div className="h-screen w-full relative overflow-hidden font-sans">
      <DashboardHeader />

      {/* Fixed Title Section */}
      <div className="absolute top-0 left-0 w-full pt-4 md:pt-8 px-4 md:px-10 z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center h-10 md:h-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-800 tracking-tight">
            My Reports
          </h1>
        </div>
        <div className="max-w-7xl mx-auto mt-1 sm:mt-2">
          <p className="text-neutral-500 text-sm sm:text-base lg:text-lg font-medium">
            Track the status of your submitted reports.
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main className="absolute top-28 md:top-36 bottom-0 left-0 right-0 overflow-y-auto px-4 sm:px-10 pb-6">
        <div className="max-w-7xl mx-auto flex flex-col min-h-full">
          <div className="flex-1">
            {reports.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-16 text-center border-2 border-dashed border-neutral-200 mt-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-neutral-700 mb-3">
                  No reports yet
                </h3>
                <p className="text-neutral-400 max-w-md mx-auto text-sm sm:text-lg font-medium">
                  You haven't submitted any reports yet. Use the mobile app to
                  report issues in your city.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="transform transition-all duration-300 hover:scale-[1.01]"
                  >
                    <ReportCard
                      report={report}
                      isAdmin={false}
                      onDetailsPress={handleDetailsPress}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="w-full py-6 text-center text-neutral-400 text-sm font-bold uppercase tracking-widest mt-8">
            © 2025 Created by struggyyy
          </footer>
        </div>
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
