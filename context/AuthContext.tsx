"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Report } from "@/types/reports";

interface UserProfile {
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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  profileLoaded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    nickname: string,
    language?: string
  ) => Promise<void>;
  logOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserAuth: (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
  }) => Promise<void>;
  uploadProfileImage: (
    userId: string,
    file: File
  ) => Promise<string | undefined>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isClosingSessionRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Define protected routes
      const protectedPaths = ["/dashboard", "/settings", "/admin"];
      const isProtected = protectedPaths.some((path) =>
        pathname?.startsWith(path)
      );

      if (user) {
        isClosingSessionRef.current = false;
        // 1. Check Email Verification for protected routes
        if (!user.emailVerified && isProtected) {
          router.replace(
            `/verify-email?email=${encodeURIComponent(user.email || "")}`
          );
          // Wait for profile to load before returning?
          // Mobile logic continues, so we continue too.
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setProfile(userData);
            const isUserAdmin = userData.role === "admin";
            setIsAdmin(isUserAdmin);
            setProfileLoaded(true);

            // 2. Strict Admin Redirect (Match Mobile Case 5)
            // If user is Admin, they MUST be on /admin routes OR /settings.
            if (
              isUserAdmin &&
              !pathname?.startsWith("/admin") &&
              !pathname?.startsWith("/settings")
            ) {
              router.replace("/admin");
            }
          } else {
            setProfile(null);
            setIsAdmin(false);
            setProfileLoaded(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setIsAdmin(false);
          setProfileLoaded(true);
        }
      } else {
        // 3. Redirect to Login if trying to access protected route while logged out
        if (isProtected && !isClosingSessionRef.current) {
          router.replace("/login");
        }
        setProfile(null);
        setIsAdmin(false);
        setProfileLoaded(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    language: string = "en"
  ) => {
    const newUser = await createUserWithEmailAndPassword(auth, email, password);

    // Create complete user profile in Firestore
    const userDocRef = doc(db, "users", newUser.user.uid);
    const initialProfileData: UserProfile = {
      id: newUser.user.uid,
      email: newUser.user.email || email,
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

    // Optimistically update local state to match Mobile App behavior (prevents race conditions)
    setProfile(initialProfileData);
    setProfileLoaded(true);

    // Send verification email automatically
    await sendEmailVerification(newUser.user);

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (userCredential.user.emailVerified) {
      router.push("/dashboard");
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  const logOut = async () => {
    isClosingSessionRef.current = true;
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      isClosingSessionRef.current = false;
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("No user is currently logged in.");
    }
    if (auth.currentUser.emailVerified) {
      throw new Error("Your email is already verified.");
    }
    await sendEmailVerification(auth.currentUser);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error("Not authenticated");
    }
    const userDocRef = doc(db, "users", user.uid);
    const updateData = { ...updates, updatedAt: serverTimestamp() };
    await updateDoc(userDocRef, updateData);

    setProfile((prev: UserProfile | null) =>
      prev ? { ...prev, ...updateData } : null
    );
  };

  const updateUserAuth = async (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
  }) => {
    if (!auth.currentUser) {
      throw new Error("User not authenticated for auth update.");
    }

    if (updates.displayName !== undefined || updates.photoURL !== undefined) {
      await updateProfile(auth.currentUser, {
        displayName:
          updates.displayName !== undefined
            ? updates.displayName
            : auth.currentUser.displayName,
        photoURL:
          updates.photoURL !== undefined
            ? updates.photoURL
            : auth.currentUser.photoURL,
      });
    }

    setUser(auth.currentUser);
  };

  const uploadProfileImage = async (
    userId: string,
    file: File
  ): Promise<string | undefined> => {
    const fileExtension = file.name.split(".").pop();
    const imageId = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profileImages/${userId}/${imageId}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    await updateUserAuth({ photoURL: downloadURL });
    await updateUserProfile({ profileImage: downloadURL });

    return downloadURL;
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently logged in to delete.");
    }

    console.log(
      `[deleteAccount] Starting comprehensive account deletion for user: ${currentUser.uid}`
    );

    isClosingSessionRef.current = true;

    try {
      // 1. Get all user reports
      const reportsQuery = query(
        collection(db, "reports"),
        where("userId", "==", currentUser.uid)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reports: Report[] = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      console.log(`[deleteAccount] Found ${reports.length} reports to delete.`);

      // 2. Delete all report images from Storage
      const imageDeletionPromises: Promise<void>[] = [];
      reports.forEach((report) => {
        if (report.imageUrl) {
          const imageRef = ref(storage, report.imageUrl);
          imageDeletionPromises.push(deleteObject(imageRef));
        }
      });

      // 3. Delete user's profile picture from Storage
      if (profile?.profileImage) {
        console.log(
          `[deleteAccount] Deleting profile image: ${profile.profileImage}`
        );
        const profileImageRef = ref(storage, profile.profileImage);
        imageDeletionPromises.push(deleteObject(profileImageRef));
      }

      if (imageDeletionPromises.length > 0) {
        await Promise.all(imageDeletionPromises);
        console.log(
          "[deleteAccount] All associated images have been deleted from Storage."
        );
      }

      // 4. Delete all Firestore documents atomically (reports + user profile)
      const batch = writeBatch(db);
      reports.forEach((report) => {
        const reportDocRef = doc(db, "reports", report.id);
        batch.delete(reportDocRef);
      });
      const userDocRef = doc(db, "users", currentUser.uid);
      batch.delete(userDocRef);

      await batch.commit();
      console.log(
        "[deleteAccount] All Firestore documents (reports and user profile) deleted."
      );

      // 5. Delete Firebase Auth user
      await deleteUser(currentUser);
      router.push("/");
      console.log(
        `[deleteAccount] Firebase Auth user deleted successfully: ${currentUser.uid}`
      );
    } catch (e: any) {
      isClosingSessionRef.current = false;
      console.error("[deleteAccount] Account deletion process failed:", e);

      if (e.code === "auth/requires-recent-login") {
        throw new Error("Please sign in again before deleting your account.");
      }

      if (e.message?.includes("storage") || e.code?.startsWith("storage/")) {
        throw new Error("Failed to delete profile data. Please try again.");
      }

      if (
        e.message?.includes("firestore") ||
        e.code?.startsWith("firestore/")
      ) {
        throw new Error("Failed to delete account records. Please try again.");
      }

      throw new Error("Account deletion failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        profileLoaded,
        signIn,
        signUp,
        logOut,
        sendVerificationEmail,
        resetPassword,
        updateUserProfile,
        updateUserAuth,
        uploadProfileImage,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
