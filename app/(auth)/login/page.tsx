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
import React, { useState } from "react";
import { Suspense } from "react";

// External libraries
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Lock, Check } from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import AuthCard from "@/components/features/auth/AuthCard";
import AuthInput from "@/components/features/auth/AuthInput";
import AuthButton from "@/components/features/auth/AuthButton";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { t } = useTranslation();

  // Handle Login Submission
  const handleLoginPress = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: typeof fieldErrors = {};

    // Check for empty email or invalid format
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      newFieldErrors.email = true;
      hasError = true;
    }
    if (!password) {
      newFieldErrors.password = true;
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      if (!email) setGeneralError("auth.login.errors.emailRequired");
      else if (newFieldErrors.email)
        setGeneralError("auth.login.errors.emailInvalid");
      else if (!password) setGeneralError("auth.login.errors.passwordRequired");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email, password);
      // Redirect handled in AuthContext
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setGeneralError("auth.login.errors.userNotFound");
      } else if (err.code === "auth/wrong-password") {
        setGeneralError("auth.login.errors.wrongPassword");
        setFieldErrors({ password: true });
      } else if (err.code === "auth/invalid-email") {
        setGeneralError("auth.login.errors.emailInvalid");
        setFieldErrors({ email: true });
      } else if (err.code === "auth/too-many-requests") {
        setGeneralError("auth.login.errors.tooManyRequests");
      } else {
        setGeneralError(err.message || "auth.login.errors.generic");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-5 min-[600px]:mb-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-text-tertiary dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />{" "}
          <span suppressHydrationWarning>
            {t("auth.verifyEmail.backToHome")}
          </span>
        </Link>
        <h1
          suppressHydrationWarning
          className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark dark:text-white mb-2 min-[600px]:mb-3"
        >
          {t("auth.login.title")}
        </h1>
        <p
          suppressHydrationWarning
          className="text-text-primary dark:text-neutral-200 text-sm min-[600px]:text-base"
        >
          {t("auth.login.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleLoginPress}
        className="space-y-5 min-[600px]:space-y-6 relative z-10"
      >
        {generalError && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
            {t(generalError)}
          </div>
        )}

        <AuthInput
          label={t("auth.login.emailLabel")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors((prev) => ({ ...prev, email: false }));
            if (generalError) setGeneralError("");
          }}
          placeholder="name@example.com"
          icon={Mail}
          isError={fieldErrors.email}
          onClear={() => setEmail("")}
          showClearButton
        />

        <AuthInput
          label={t("auth.login.passwordLabel")}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: false }));
            if (generalError) setGeneralError("");
          }}
          placeholder="••••••••"
          icon={Lock}
          isError={fieldErrors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-text-primary dark:text-white font-medium cursor-pointer group select-none relative z-10">
            <div className="relative mr-3 flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                className="peer appearance-none w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-white checked:bg-brand-primary checked:border-brand-primary transition-all duration-200 cursor-pointer"
              />
              <Check
                className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                strokeWidth={3}
              />
            </div>
            <span className="text-sm">{t("auth.login.rememberMe")}</span>
          </label>
        </div>

        <div className="flex justify-end">
          <Link
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="text-sm font-bold text-brand-primary hover:underline"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        <AuthButton type="submit" isLoading={isSubmitting}>
          {t("auth.login.signInButton")}
        </AuthButton>
      </form>

      <div className="mt-8 text-center text-sm text-text-primary dark:text-white font-medium relative z-10">
        {t("auth.login.noAccount")}{" "}
        <Link
          href={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="text-brand-primary font-bold hover:underline"
        >
          {t("auth.login.signUpLink")}
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
