import { ReportStatus } from "@/types/reports";

// Send push notification via Expo Push API (proxied through Next.js API route)
export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Push notification sent successfully via API route");
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Don't throw, just log error so we don't break the main flow
  }
};

export const sendReportStatusNotification = async (
  pushToken: string,
  reportId: string,
  oldStatus: ReportStatus,
  newStatus: ReportStatus
): Promise<void> => {
  const title = "Report Status Updated";
  const body = `Your report status has changed from ${oldStatus} to ${newStatus}.`;
  
  const data = {
    type: "report_status_update",
    reportId,
    oldStatus,
    newStatus,
  };

  await sendPushNotification(pushToken, title, body, data);
};
