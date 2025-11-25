"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { updateProfile, deleteUser } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string, language?: string) => Promise<void>;
  logOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserAuth: (updates: { displayName?: string; photoURL?: string; email?: string }) => Promise<void>;
  uploadProfileImage: (userId: string, file: File) => Promise<string | undefined>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is trying to access dashboard without verification
        if (!user.emailVerified && window.location.pathname === '/dashboard') {
          router.replace(`/verify-email?email=${encodeURIComponent(user.email || '')}`);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setProfile(userData);
            setIsAdmin(userData.role === "admin");
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signUp = async (email: string, password: string, nickname: string, language: string = "en") => {
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
        haptics: true 
      },
      language: language,
      role: "user",
      points: 0,
    };
    
    await setDoc(userDocRef, initialProfileData);
    
    // Navigation is handled by the component calling signUp or by the auth state change
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is verified and redirect accordingly
    if (userCredential.user.emailVerified) {
      router.push("/dashboard");
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    router.push("/login");
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

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error("Not authenticated");
    }
    const userDocRef = doc(db, "users", user.uid);
    const updateData = { ...updates, updatedAt: serverTimestamp() };
    await updateDoc(userDocRef, updateData);

    // Update local profile state
    setProfile((prev: UserProfile | null) =>
      prev ? { ...prev, ...updateData } : null
    );
  };

  const updateUserAuth = async (updates: { displayName?: string; photoURL?: string; email?: string }) => {
    if (!auth.currentUser) {
      throw new Error("User not authenticated for auth update.");
    }

    // Note: Email updates are not implemented in this version
    // if (updates.email && updates.email !== auth.currentUser.email) {
    //   await auth.currentUser.updateEmail(updates.email);
    //   delete updates.email;
    // }

    if (updates.displayName !== undefined || updates.photoURL !== undefined) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName !== undefined ? updates.displayName : auth.currentUser.displayName,
        photoURL: updates.photoURL !== undefined ? updates.photoURL : auth.currentUser.photoURL,
      });
    }

    // Refresh local user state
    setUser(auth.currentUser);
  };

  const uploadProfileImage = async (userId: string, file: File): Promise<string | undefined> => {
    const fileExtension = file.name.split('.').pop();
    const imageId = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profileImages/${userId}/${imageId}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile (both Auth and Firestore)
    await updateUserAuth({ photoURL: downloadURL });
    await updateUserProfile({ profileImage: downloadURL });

    return downloadURL;
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently logged in to delete.");
    }

    console.log(`[deleteAccount] Starting comprehensive account deletion for user: ${currentUser.uid}`);

    try {
      // 1. Get all user reports
      const reportsQuery = query(collection(db, "reports"), where("userId", "==", currentUser.uid));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reports: Report[] = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
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
        console.log(`[deleteAccount] Deleting profile image: ${profile.profileImage}`);
        const profileImageRef = ref(storage, profile.profileImage);
        imageDeletionPromises.push(deleteObject(profileImageRef));
      }

      // Execute all image deletions - if any fail, the entire process fails
      if (imageDeletionPromises.length > 0) {
        await Promise.all(imageDeletionPromises);
        console.log("[deleteAccount] All associated images have been deleted from Storage.");
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
      console.log("[deleteAccount] All Firestore documents (reports and user profile) deleted.");

      // 5. Delete Firebase Auth user (only after all data is successfully deleted)
      await deleteUser(currentUser);
      console.log(`[deleteAccount] Firebase Auth user deleted successfully: ${currentUser.uid}`);

    } catch (e: any) {
      console.error("[deleteAccount] Account deletion process failed:", e);

      // Handle specific Firebase Auth errors
      if (e.code === "auth/requires-recent-login") {
        throw new Error("Please sign in again before deleting your account.");
      }

      // Handle storage deletion errors
      if (e.message?.includes("storage") || e.code?.startsWith("storage/")) {
        throw new Error("Failed to delete profile data. Please try again.");
      }

      // Handle Firestore deletion errors
      if (e.message?.includes("firestore") || e.code?.startsWith("firestore/")) {
        throw new Error("Failed to delete account records. Please try again.");
      }

      // Generic error
      throw new Error("Account deletion failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      isAdmin, 
      signIn, 
      signUp, 
      logOut, 
      sendVerificationEmail,
      updateUserProfile,
      updateUserAuth,
      uploadProfileImage,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
