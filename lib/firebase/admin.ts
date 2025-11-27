import { doc, writeBatch, increment, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ReportStatus } from "@/types/reports";
import { sendReportStatusNotification } from "../notifications";

/**
 * Updates the status of a report and adjusts the user's points accordingly.
 * 
 * Points Logic:
 * - Submitted: 0 pts
 * - Accepted: 10 pts
 * - Completed: 100 pts
 * - Canceled: 0 pts
 */
export const updateReportStatus = async (
  reportId: string,
  userId: string,
  currentStatus: ReportStatus,
  newStatus: ReportStatus
): Promise<void> => {
  if (currentStatus === newStatus) return; // No change, do nothing

  const reportDocRef = doc(db, "reports", reportId);
  const userDocRef = doc(db, "users", userId);

  const pointsMap: Record<ReportStatus, number> = {
    Submitted: 0,
    Accepted: 10,
    Completed: 100,
    Canceled: 0,
  };

  const pointsForCurrentStatus = pointsMap[currentStatus] || 0;
  const pointsForNewStatus = pointsMap[newStatus] || 0;

  const pointsDifference = pointsForNewStatus - pointsForCurrentStatus;

  try {
    const batch = writeBatch(db);

    // Update the report's status and points
    batch.update(reportDocRef, {
      status: newStatus,
      points: pointsForNewStatus,
    });

    // Update the user's total points
    if (pointsDifference !== 0) {
      batch.update(userDocRef, { points: increment(pointsDifference) });
    }

    await batch.commit();
    console.log(
      `Report ${reportId} status updated to ${newStatus}. User ${userId} points adjusted by ${pointsDifference}.`
    );

    // Send Notification
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const pushToken = userData.pushToken;
        // Default to true if preference is missing
        const pushEnabled = userData.notificationPreferences?.push !== false;

        if (pushToken && pushEnabled) {
          await sendReportStatusNotification(
            pushToken,
            reportId,
            currentStatus,
            newStatus
          );
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      // Don't fail the status update if notification fails
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status.");
  }
};
