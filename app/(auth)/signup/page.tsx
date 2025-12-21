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

// External libraries
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import AuthCard from "@/components/features/auth/AuthCard";
import AuthInput from "@/components/features/auth/AuthInput";
import AuthButton from "@/components/features/auth/AuthButton";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    nickname?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleSignupPress = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: typeof fieldErrors = {};
    let firstErrorMessage = "";

    // Nickname Validation (Length check 2-15)
    if (!nickname || nickname.length < 2 || nickname.length > 15) {
      newFieldErrors.nickname = true;
      if (!firstErrorMessage) {
        if (!nickname)
          firstErrorMessage = "auth.signup.errors.nicknameRequired";
        else if (nickname.length < 2)
          firstErrorMessage = "auth.signup.errors.nicknameLength";
        else firstErrorMessage = "auth.signup.errors.nicknameTooLong";
      }
      hasError = true;
    }

    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      newFieldErrors.email = true;
      if (!firstErrorMessage)
        firstErrorMessage = "auth.signup.errors.emailInvalid";
      hasError = true;
    }

    // Password validation
    const complexityRegex = /^(?=.*[A-Z])(?=.*\d)/;
    if (
      !password ||
      password.length < 6 ||
      !complexityRegex.test(password) ||
      password !== confirmPassword
    ) {
      newFieldErrors.password = true;
      newFieldErrors.confirmPassword = true;

      if (!firstErrorMessage) {
        if (!password)
          firstErrorMessage = "auth.signup.errors.passwordRequired";
        else if (password !== confirmPassword)
          firstErrorMessage = "auth.signup.errors.passwordMismatch";
        else if (password.length < 6)
          firstErrorMessage = "auth.signup.errors.passwordShort";
        else firstErrorMessage = "auth.signup.errors.passwordComplexity";
      }
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setGeneralError(firstErrorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password, nickname, i18n.language);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setGeneralError("auth.signup.errors.emailInUse");
      } else {
        setGeneralError(err.message || "auth.signup.errors.generic");
      }
      setIsSubmitting(false);
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= 15) {
      setNickname(text);
      if (fieldErrors.nickname)
        setFieldErrors((prev) => ({ ...prev, nickname: false }));
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
          {t("auth.signup.title")}
        </h1>
        <p
          suppressHydrationWarning
          className="text-text-primary dark:text-neutral-200 text-sm min-[600px]:text-base"
        >
          {t("auth.signup.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSignupPress}
        className="space-y-5 min-[600px]:space-y-6 relative z-10"
      >
        {generalError && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
            {t(generalError)}
          </div>
        )}

        <AuthInput
          label={t("auth.signup.nicknameLabel")}
          value={nickname}
          onChange={handleNicknameChange}
          placeholder={t("auth.signup.placeholders.nickname")}
          maxLength={15}
          icon={User}
          isError={fieldErrors.nickname}
          onClear={() => setNickname("")}
          showClearButton
        />

        <AuthInput
          label={t("auth.signup.emailLabel")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors((prev) => ({ ...prev, email: false }));
          }}
          placeholder={t("auth.signup.placeholders.email")}
          icon={Mail}
          isError={fieldErrors.email}
          onClear={() => setEmail("")}
          showClearButton
        />

        <AuthInput
          label={t("auth.signup.passwordLabel")}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({
                ...prev,
                password: false,
                confirmPassword: false,
              }));
          }}
          placeholder={t("auth.signup.placeholders.password")}
          icon={Lock}
          isError={fieldErrors.password}
        />

        <AuthInput
          label={t("auth.signup.confirmPasswordLabel")}
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: false,
              }));
          }}
          placeholder="••••••••"
          icon={Lock}
          isError={fieldErrors.confirmPassword}
        />

        <AuthButton type="submit" isLoading={isSubmitting}>
          {t("auth.signup.createAccountButton")}
        </AuthButton>
      </form>

      <div className="mt-8 text-center text-sm text-text-primary dark:text-white font-medium relative z-10">
        {t("auth.signup.hasAccount")}{" "}
        <Link
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="text-brand-primary font-bold hover:underline"
        >
          {t("auth.signup.signInLink")}
        </Link>
      </div>
    </AuthCard>
  );
}
