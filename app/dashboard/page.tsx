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
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

// Internal imports
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/components/context/AuthContext";
import { Report } from "@/lib/types/reports";
import { deleteReport } from "@/lib/firebase/reports";
import UserReportModal from "@/components/features/reports/UserReportModal";
import Header from "@/components/layout/Header";
import CustomCursor from "@/components/common/CustomCursor";
import ReportsGrid from "@/components/features/reports/ReportsGrid";
import DashboardEmptyState from "@/components/features/dashboard/DashboardEmptyState";

export default function UserDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Wait for authentication to load before checking user state
    if (authLoading) {
      return;
    }

    if (!user || isAdmin) {
      return;
    }

    // Fetch reports for current user
    const q = query(
      collection(db, "reports"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
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
  }, [user, isAdmin, authLoading]);

  // Handle opening details modal
  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    if (!selectedReport) return;
    try {
      await deleteReport(reportId, selectedReport.imageUrl);
      // Optimistic update or wait for snapshot? Snapshot will handle it, but we should close modal
      setShowReportModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(t("profile.deleteError"));
    }
  };

  if (authLoading || isAdmin || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans">
      <CustomCursor variant="precise" />
      <Header variant="protected" />

      {/* Header Content */}
      <div className="flex-shrink-0 w-full pt-4 md:pt-8 px-4 sm:px-10 z-10 pointer-events-auto">
        <div className="max-w-4xl mx-auto flex items-center h-10 md:h-12">
          <h1 className="text-lg min-[400px]:text-xl sm:text-4xl lg:text-5xl font-black text-neutral-800 dark:text-white tracking-tight">
            {t("dashboard.title")}
          </h1>
        </div>
        <div className="max-w-4xl mx-auto mt-1 sm:mt-2">
          <p className="text-neutral-500 dark:text-neutral-200 text-xs min-[400px]:text-sm sm:text-base lg:text-lg font-medium">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main className="flex-1 w-full overflow-y-auto px-4 sm:px-10 pb-6 pt-4 sm:pt-6 [mask-image:linear-gradient(to_bottom,transparent,black_20px)]">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          <div className="flex-1">
            <ReportsGrid
              isLoading={loading}
              reports={reports}
              onDetailsPress={handleDetailsPress}
              emptyState={<DashboardEmptyState />}
            />
          </div>

          <footer className="w-full py-6 text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest mt-8">
            {t("common.footer")}
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
