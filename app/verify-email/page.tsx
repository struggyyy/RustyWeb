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
import { useState, useEffect, Suspense } from "react";

// External libraries
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

// Internal imports
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

function VerifyEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { user, sendVerificationEmail, logOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || user?.email || "";
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

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
                `emailResendCooldownExpiry_${normalizedEmail}`
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
      setResendMessage(t("auth.verifyEmail.pleaseWait", { seconds: cooldown }));
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      await sendVerificationEmail();
      setResendMessage(t("auth.verifyEmail.success"));

      const COOLDOWN_SECONDS = 60;
      setCooldown(COOLDOWN_SECONDS);

      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const expiryTime = Date.now() + COOLDOWN_SECONDS * 1000;
        localStorage.setItem(
          `emailResendCooldownExpiry_${normalizedEmail}`,
          expiryTime.toString()
        );
      }
    } catch (err: any) {
      console.error("Resend Error:", err);
      if (err.message && err.message.includes("Too many")) {
        setResendMessage(t("auth.verifyEmail.tooMany"));
      } else {
        setResendMessage(t("auth.verifyEmail.failed"));
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
      <div className="max-w-md w-full bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 min-[600px]:p-10 border border-white/60 relative">
        <div className="absolute top-4 right-4 flex bg-neutral-100/50 rounded-lg p-0.5 border border-white/40 z-10">
          <button
            suppressHydrationWarning
            onClick={() => handleLanguageChange("en")}
            className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
              i18n.language === "en"
                ? "bg-white shadow-sm text-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            EN
          </button>
          <button
            suppressHydrationWarning
            onClick={() => handleLanguageChange("pl")}
            className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
              i18n.language === "pl"
                ? "bg-white shadow-sm text-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            PL
          </button>
        </div>

        <div className="mb-5 min-[600px]:mb-6 mt-8">
          <h1
            suppressHydrationWarning
            className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark mb-2 min-[600px]:mb-3"
          >
            {t("auth.verifyEmail.title")}
          </h1>
          <p
            suppressHydrationWarning
            className="text-text-primary text-sm min-[600px]:text-base"
          >
            {t("auth.verifyEmail.subtitle")}
          </p>
        </div>

        {resendMessage && (
          <div
            className={`p-4 text-sm rounded-xl border font-medium mb-6 ${
              resendMessage.includes(t("auth.verifyEmail.success"))
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}
          >
            {resendMessage}
          </div>
        )}

        <div className="space-y-5">
          <button
            onClick={handleResendVerification}
            disabled={isResending || cooldown > 0}
            className="w-full py-2.5 min-[600px]:py-4 bg-neutral-100 text-text-dark rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2 hidden min-[540px]:block" />
                {cooldown > 0
                  ? t("auth.verifyEmail.resendCooldown", { seconds: cooldown })
                  : t("auth.verifyEmail.resendButton")}
              </>
            )}
          </button>

          <button
            onClick={goToLogin}
            className="w-full py-2.5 min-[600px]:py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide"
          >
            {t("auth.verifyEmail.backToLogin")}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-text-tertiary font-medium">
          {t("auth.verifyEmail.spamHint")}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
