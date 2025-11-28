"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [lastResendTime, setLastResendTime] = useState<number>(0);
  const { user, sendVerificationEmail, logOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || user?.email || "";

  const handleResendVerification = async () => {
    // Prevent rapid clicking - minimum 10 seconds between requests
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const minDelay = 10000; // 10 seconds

    if (timeSinceLastResend < minDelay) {
      setResendMessage("Please wait a moment before requesting another email.");
      return;
    }

    setIsResending(true);
    setResendMessage("");
    setLastResendTime(now);

    try {
      await sendVerificationEmail();
      setResendMessage("Verification email sent successfully!");
    } catch (err: any) {
      console.error("Resend Error:", err);
      if (err.message?.includes("Too many")) {
        setResendMessage(
          "Too many emails sent. Please wait before trying again."
        );
      } else {
        setResendMessage(
          "Failed to send verification email. Please try again."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    try {
      await logOut();
      router.replace("/login");
    } catch (err: any) {
      console.error("Logout failed:", err);
      // Still navigate to login even if logout fails
      router.replace("/login");
    }
  };

  // Check if user is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 min-[540px]:p-10 border border-neutral-100">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-text-tertiary hover:text-brand-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-text-dark mb-3">
            Verify Your Email
          </h1>
          <p className="text-text-primary">
            We've sent a verification email to{" "}
            <span className="text-brand-primary font-bold">{email}</span>
          </p>
        </div>

        {resendMessage && (
          <div className="p-4 bg-blue-50 text-blue-600 text-sm rounded-xl border border-blue-100 font-medium mb-6">
            {resendMessage}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full py-4 bg-neutral-100 text-text-dark rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2 hidden min-[540px]:block" />
                Resend Verification Email
              </>
            )}
          </button>

          <button
            onClick={goToLogin}
            className="w-full py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-text-tertiary font-medium">
          Check your spam folder if you don't see the email in your inbox.
        </div>
      </div>
    </div>
  );
}
