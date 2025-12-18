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
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/context/AuthContext";
import { Report } from "@/lib/types/reports";
import ReportCard from "@/components/features/reports/ReportCard";
import UserReportModal from "@/components/features/reports/UserReportModal";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ReportCardSkeleton from "@/components/features/reports/ReportCardSkeleton";
import CustomCursor from "@/components/common/CustomCursor";

export default function UserDashboardPage() {
  const { user, logOut, isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Wait for authentication to load before checking user state
    if (authLoading) {
      return;
    }

    if (!user || isAdmin) {
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
  }, [user, isAdmin, authLoading]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString(i18n.language, {
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
      <DashboardHeader />

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
            {loading ? (
              <div className="grid gap-4 sm:gap-6 max-w-4xl">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ReportCardSkeleton key={i} />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white/80 dark:bg-neutral-900/40 backdrop-blur-md rounded-3xl p-8 sm:p-16 text-center border-2 border-dashed border-neutral-200 dark:border-white/30 mt-4 max-w-4xl mx-auto shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-black/5 dark:ring-white/10">
                  <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300 dark:text-white/80" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-neutral-700 dark:text-white mb-3">
                  {t("dashboard.noReportsTitle")}
                </h3>
                <p className="text-neutral-400 dark:text-neutral-200 max-w-md mx-auto text-sm sm:text-lg font-medium">
                  {t("dashboard.noReportsDesc")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 max-w-4xl">
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
