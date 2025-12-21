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
import React, { useState, Suspense } from "react";

// External libraries
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Send } from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import AuthCard from "@/components/features/auth/AuthCard";
import AuthInput from "@/components/features/auth/AuthInput";
import AuthButton from "@/components/features/auth/AuthButton";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEmailError, setIsEmailError] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  // Handle Password Reset Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsEmailError(false);

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      setMessage({
        type: "error",
        text: "auth.forgotPassword.errors.emailInvalid",
      });
      setIsEmailError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setMessage({
        type: "success",
        text: "auth.forgotPassword.success",
      });
      setEmail(""); // Clear input on success
    } catch (err: any) {
      let errorText = "";
      if (err.code === "auth/user-not-found") {
        errorText = "auth.forgotPassword.errors.userNotFound";
      } else if (err.code === "auth/invalid-email") {
        errorText = "auth.forgotPassword.errors.emailInvalid";
        setIsEmailError(true);
      } else {
        errorText = "auth.forgotPassword.errors.generic";
      }

      setMessage({
        type: "error",
        text: errorText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-5 min-[600px]:mb-6 relative z-10">
        <Link
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="inline-flex items-center text-text-tertiary dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />{" "}
          <span suppressHydrationWarning>
            {t("auth.forgotPassword.backToLogin")}
          </span>
        </Link>
        <h1
          suppressHydrationWarning
          className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark dark:text-white mb-2 min-[600px]:mb-3"
        >
          {t("auth.forgotPassword.title")}
        </h1>
        <p
          suppressHydrationWarning
          className="text-text-primary dark:text-neutral-200 text-sm min-[600px]:text-base"
        >
          {t("auth.forgotPassword.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 min-[600px]:space-y-6 relative z-10"
      >
        {message && (
          <div
            className={`p-4 text-sm rounded-xl border font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {t(message.text)}
          </div>
        )}

        <AuthInput
          label={t("auth.forgotPassword.emailLabel")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (isEmailError) setIsEmailError(false);
            if (message && message.type === "error") setMessage(null);
          }}
          placeholder={t("auth.signup.placeholders.email")}
          icon={Mail}
          isError={isEmailError}
          onClear={() => setEmail("")}
          showClearButton
        />

        <AuthButton type="submit" isLoading={isSubmitting} icon={Send}>
          {t("auth.forgotPassword.sendButton")}
        </AuthButton>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
