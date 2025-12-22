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
import { deleteUser, User } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Internal imports
import { db, storage } from "@/lib/firebase/firebase";
import { Report } from "@/lib/types/reports";

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  createdAt: any;
  updatedAt?: any;
  role?: "user" | "admin";
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    haptics?: boolean;
  };
  pushToken?: string;
  language?: string;
  points?: number;
  adminPreferences?: {
    selectedStatuses?: string[];
    maxDistance?: number;
  };
}

// Initialize new user profile in Firestore
export const initializeUserProfile = async (
  user: User,
  nickname: string,
  language: string = "en"
): Promise<UserProfile> => {
  const userDocRef = doc(db, "users", user.uid);
  const initialProfileData: UserProfile = {
    id: user.uid,
    email: user.email || "",
    displayName: nickname,
    createdAt: serverTimestamp(),
    notificationPreferences: {
      email: true,
      push: true,
      haptics: true,
    },
    language: language,
    role: "user",
    points: 0,
  };

  await setDoc(userDocRef, initialProfileData);
  return initialProfileData;
};

// Upload profile image to Storage (auto-deletes old image)
export const uploadUserImage = async (
  userId: string,
  file: File,
  oldImageUrl?: string | null
): Promise<string> => {
  // 1. Delete old image if it exists
  if (oldImageUrl) {
    try {
      if (oldImageUrl.startsWith("http")) {
        // Only attempt deletion for valid URLs
        const oldImageRef = ref(storage, oldImageUrl);
        await deleteObject(oldImageRef);
        console.log(
          `[uploadUserImage] Old profile image deleted: ${oldImageUrl}`
        );
      }
    } catch (error: any) {
      // Ignore invalid-url errors as they map to local/test data we can't delete
      if (error.code !== "storage/invalid-url") {
        console.warn(
          `[uploadUserImage] Failed to delete old image: ${oldImageUrl}`,
          error
        );
      }
    }
  }

  // 2. Upload new image
  const fileExtension = file.name.split(".").pop();
  const imageId = `${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `profileImages/${userId}/${imageId}`);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Comprehensive account deletion (Reports -> Images -> Profile -> Auth)
export const deleteUserAccount = async (
  user: User,
  profileImage?: string | null
): Promise<void> => {
  console.log(
    `[deleteAccount] Starting comprehensive account deletion for user: ${user.uid}`
  );

  // 0. Security Check: Ensure session is fresh (< 5 minutes) to prevent data loss on failed auth delete
  if (user.metadata.lastSignInTime) {
    const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - lastSignIn > fiveMinutes) {
      console.warn(
        "[deleteAccount] Session stale, rejecting deletion to preserve data."
      );
      // Throw error code that matches Firebase's standard for this scenario
      const error: any = new Error("Requires recent login");
      error.code = "auth/requires-recent-login";
      throw error;
    }
  }

  // 1. Get all user reports
  const reportsQuery = query(
    collection(db, "reports"),
    where("userId", "==", user.uid)
  );
  const reportsSnapshot = await getDocs(reportsQuery);
  const reports: Report[] = reportsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Report[];

  // 2. Delete all report images from Storage
  const imageDeletionPromises: Promise<void>[] = [];
  reports.forEach((report) => {
    if (report.imageUrl) {
      // Wrap deletion in a promise that catches invalid-url errors
      const deletePromise = async () => {
        try {
          const imageRef = ref(storage, report.imageUrl);
          await deleteObject(imageRef);
        } catch (error: any) {
          if (error.code === "storage/invalid-url") {
            console.warn(
              `[deleteAccount] Skipping invalid image URL: ${report.imageUrl}`
            );
          } else {
            console.error(
              `[deleteAccount] Failed to delete image: ${report.imageUrl}`,
              error
            );
          }
        }
      };
      imageDeletionPromises.push(deletePromise());
    }
  });

  // 3. Delete user's profile picture from Storage
  if (profileImage) {
    const deleteProfilePromise = async () => {
      try {
        const profileImageRef = ref(storage, profileImage);
        await deleteObject(profileImageRef);
      } catch (error: any) {
        if (error.code === "storage/invalid-url") {
          console.warn(
            `[deleteAccount] Skipping invalid profile image URL: ${profileImage}`
          );
        } else {
          console.error(
            `[deleteAccount] Failed to delete profile image: ${profileImage}`,
            error
          );
        }
      }
    };
    imageDeletionPromises.push(deleteProfilePromise());
  }

  if (imageDeletionPromises.length > 0) {
    await Promise.all(imageDeletionPromises);
  }

  // 4. Delete all Firestore documents atomically (reports + user profile)
  const batch = writeBatch(db);
  reports.forEach((report) => {
    const reportDocRef = doc(db, "reports", report.id);
    batch.delete(reportDocRef);
  });
  const userDocRef = doc(db, "users", user.uid);
  batch.delete(userDocRef);

  await batch.commit();

  // 5. Delete Firebase Auth user
  await deleteUser(user);
};

// Update user profile data in Firestore
export const updateServiceUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const userDocRef = doc(db, "users", userId);
  const updateData = { ...updates, updatedAt: serverTimestamp() };
  await updateDoc(userDocRef, updateData);
};
