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
import { createContext, useContext, useEffect, useState, useRef } from "react";

// External libraries
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Internal imports
import "../../lib/i18n/i18n";
import { auth, db } from "@/lib/firebase/firebase";
import {
  UserProfile,
  initializeUserProfile,
  uploadUserImage,
  deleteUserAccount,
  updateServiceUserProfile,
} from "@/lib/services/userService";

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
  previousPath: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Protected routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/profile", "/admin", "/verify-email"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const isClosingSessionRef = useRef(false);
  const { i18n } = useTranslation();

  // Use a ref to track the path from the previous render cycle
  const currentPathRef = useRef(pathname);
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      setPreviousPath(currentPathRef.current);
      currentPathRef.current = pathname;
    }
  }, [pathname]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        isClosingSessionRef.current = false;
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setProfile(userData);

            // Sync language from profile
            if (userData.language && userData.language !== i18n.language) {
              i18n.changeLanguage(userData.language);
            }

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
        setProfileLoaded(true);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setProfileLoaded(true);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Dedicated Effect for Route Protection
  useEffect(() => {
    if (loading) return; // Wait for initial auth check

    // If logged in but profile not loaded yet, wait (unless we are sure there is no user)
    if (user && !profileLoaded) return;

    const isProtected = PROTECTED_PATHS.some((path) =>
      pathname?.startsWith(path)
    );

    if (user) {
      // 1. Check Email Verification
      if (user.emailVerified && pathname?.startsWith("/verify-email")) {
        router.replace("/dashboard");
        return;
      }

      // If user is NOT verified and tries to access other protected routes
      if (
        !user.emailVerified &&
        isProtected &&
        !pathname?.startsWith("/verify-email")
      ) {
        router.replace(
          `/verify-email?email=${encodeURIComponent(user.email || "")}`
        );
        return;
      }

      // 2. Role-based Redirects
      if (isAdmin && pathname?.startsWith("/dashboard")) {
        router.replace("/admin");
      } else if (!isAdmin && pathname?.startsWith("/admin")) {
        router.replace("/dashboard");
      }
    } else {
      // 3. Unauthenticated User trying to access protected route
      if (isProtected && !isClosingSessionRef.current) {
        router.replace("/login");
      }
    }
  }, [user, isAdmin, profileLoaded, loading, pathname, router]);

  // Sync Firebase Auth language with current i18n language
  useEffect(() => {
    auth.languageCode = i18n.language;
  }, [i18n.language]);

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    language: string = "en"
  ) => {
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    const initialProfile = await initializeUserProfile(
      newUser.user,
      nickname,
      language
    );

    // Optimistically update local state
    setProfile(initialProfile);
    setProfileLoaded(true);

    // Send verification email
    try {
      await sendEmailVerification(newUser.user);
    } catch (error) {
      console.warn("Failed to send initial verification email:", error);
    }

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

      // Only redirect to home if we are currently on a protected route
      const isProtected = PROTECTED_PATHS.some((path) =>
        pathname?.startsWith(path)
      );

      if (isProtected) {
        router.push("/");
      } else {
        isClosingSessionRef.current = false;
      }
    } catch (error) {
      isClosingSessionRef.current = false;
      throw error;
    }
  };

  // Reset session close flag on public pages
  useEffect(() => {
    const isProtected = PROTECTED_PATHS.some((path) =>
      pathname?.startsWith(path)
    );
    if (!isProtected && isClosingSessionRef.current) {
      isClosingSessionRef.current = false;
    }
  }, [pathname]);

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    if (auth.currentUser.emailVerified)
      throw new Error("Your email is already verified.");
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
    if (!user) throw new Error("Not authenticated");

    await updateServiceUserProfile(user.uid, updates);

    setProfile((prev: UserProfile | null) =>
      prev ? { ...prev, ...updates } : null
    );

    if (updates.language) {
      i18n.changeLanguage(updates.language);
    }
  };

  const updateUserAuth = async (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
  }) => {
    if (!auth.currentUser)
      throw new Error("User not authenticated for auth update.");

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
    const downloadURL = await uploadUserImage(
      userId,
      file,
      profile?.profileImage
    );
    await updateUserAuth({ photoURL: downloadURL });
    await updateUserProfile({ profileImage: downloadURL });
    return downloadURL;
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser)
      throw new Error("No user is currently logged in to delete.");

    isClosingSessionRef.current = true;

    try {
      await deleteUserAccount(currentUser, profile?.profileImage);
      router.push("/");
    } catch (e: any) {
      isClosingSessionRef.current = false;
      console.error("[deleteAccount] Account deletion process failed:", e);

      // Map Firebase errors to user-friendly messages
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
        previousPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
