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
// External libraries
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

// Internal imports
import { db, storage } from "./firebase";

// Delete Report Logic
export const deleteReportImage = async (imageUrl: string) => {
  if (!imageUrl) return;

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === "storage/object-not-found") {
      console.warn(`Image at ${imageUrl} not found, but proceeding.`);
    } else {
      console.error(`Failed to delete image at ${imageUrl}:`, error);
      throw error;
    }
  }
};

export const deleteReport = async (reportId: string, imageUrl: string) => {
  if (!reportId) {
    throw new Error("Report ID is required to delete a report.");
  }

  try {
    // Delete the image from Storage first
    if (imageUrl) {
      await deleteReportImage(imageUrl);
    }

    // Then delete the report document from Firestore
    const reportDocRef = doc(db, "reports", reportId);
    await deleteDoc(reportDocRef);

    console.log(
      `Report ${reportId} and associated image deleted successfully.`,
    );
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete report. Please check logs for details.");
  }
};
