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
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

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
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string, language?: string) => Promise<void>;
  logOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
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

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, logOut, sendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
