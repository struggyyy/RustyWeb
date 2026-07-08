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

// React-specific imports
import { useState, useEffect, Suspense } from "react";

// External libraries
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import AuthCard from "@/components/features/auth/AuthCard";
import AuthButton from "@/components/features/auth/AuthButton";

function VerifyEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { user, sendVerificationEmail, logOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || user?.email || "";
  const { t } = useTranslation();

  // Load cooldown from localStorage on mount
  useEffect(() => {
    if (!email) return;
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const key = `emailResendCooldownExpiry_${normalizedEmail}`;
      const expiryString = localStorage.getItem(key);

      if (expiryString) {
        const expiryTime = parseInt(expiryString, 10);
        const now = Date.now();
        if (expiryTime > now) {
          const remaining = Math.ceil((expiryTime - now) / 1000);
          setCooldown(remaining);
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }, [email]);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (email) {
              const normalizedEmail = email.trim().toLowerCase();
              localStorage.removeItem(
                `emailResendCooldownExpiry_${normalizedEmail}`,
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown, email]);

  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setResendMessage("auth.verifyEmail.pleaseWait");
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      await sendVerificationEmail();
      setResendMessage("auth.verifyEmail.success");

      const COOLDOWN_SECONDS = 60;
      setCooldown(COOLDOWN_SECONDS);

      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const expiryTime = Date.now() + COOLDOWN_SECONDS * 1000;
        localStorage.setItem(
          `emailResendCooldownExpiry_${normalizedEmail}`,
          expiryTime.toString(),
        );
      }
    } catch (err: any) {
      console.error("Resend Error:", err);
      if (err.message && err.message.includes("Too many")) {
        setResendMessage("auth.verifyEmail.tooMany");
      } else {
        setResendMessage("auth.verifyEmail.failed");
      }
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    try {
      await logOut();
      await logOut(); // Kept double call from original code, though likely redundant
      router.replace(
        `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`,
      );
    } catch (err: any) {
      console.error("Logout failed:", err);
      router.replace(
        `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`,
      );
    }
  };

  // Check if user is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <AuthCard>
      <div className="mb-5 min-[600px]:mb-6 mt-8 relative z-10">
        <h1
          suppressHydrationWarning
          className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark dark:text-white mb-2 min-[600px]:mb-3"
        >
          {t("auth.verifyEmail.title")}
        </h1>
        <p
          suppressHydrationWarning
          className="text-text-primary dark:text-neutral-200 text-sm min-[600px]:text-base"
        >
          {t("auth.verifyEmail.subtitle")}
        </p>
      </div>

      {resendMessage && (
        <div
          className={`p-4 text-sm rounded-xl border font-medium mb-6 relative z-10 ${
            resendMessage === "auth.verifyEmail.success"
              ? "bg-green-50 text-green-600 border-green-100"
              : "bg-blue-50 text-blue-600 border-blue-100"
          }`}
        >
          {t(resendMessage, { seconds: cooldown })}
        </div>
      )}

      <div className="space-y-5 relative z-10">
        <AuthButton
          variant="secondary"
          onClick={handleResendVerification}
          disabled={isResending || cooldown > 0}
          isLoading={isResending}
          icon={RefreshCw}
        >
          <span suppressHydrationWarning>
            {cooldown > 0
              ? t("auth.verifyEmail.resendCooldown", {
                  seconds: cooldown,
                })
              : t("auth.verifyEmail.resendButton")}
          </span>
        </AuthButton>

        <AuthButton onClick={goToLogin}>
          {t("auth.verifyEmail.backToLogin")}
        </AuthButton>
      </div>

      <div className="mt-8 text-center text-sm text-text-tertiary dark:text-white font-medium relative z-10">
        {t("auth.verifyEmail.spamHint")}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
