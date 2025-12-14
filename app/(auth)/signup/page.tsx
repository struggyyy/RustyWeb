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
import { useState } from "react";
import { useTranslation } from "react-i18next";

// External libraries
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
  User,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSignupPress = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: typeof fieldErrors = {};
    let firstErrorMessage = "";

    // Nickname validation
    if (!nickname || nickname.length < 2 || nickname.length > 15) {
      newFieldErrors.nickname = true;
      if (!firstErrorMessage) {
        if (!nickname)
          firstErrorMessage = t("auth.signup.errors.nicknameRequired");
        else if (nickname.length < 2)
          firstErrorMessage = t("auth.signup.errors.nicknameLength");
        else firstErrorMessage = t("auth.signup.errors.nicknameTooLong");
      }
      hasError = true;
    }

    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      newFieldErrors.email = true;
      if (!firstErrorMessage)
        firstErrorMessage = t("auth.signup.errors.emailInvalid");
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
          firstErrorMessage = t("auth.signup.errors.passwordRequired");
        else if (password !== confirmPassword)
          firstErrorMessage = t("auth.signup.errors.passwordMismatch");
        else if (password.length < 6)
          firstErrorMessage = t("auth.signup.errors.passwordShort");
        else firstErrorMessage = t("auth.signup.errors.passwordComplexity");
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
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setGeneralError(t("auth.signup.errors.emailInUse"));
      } else {
        setGeneralError(err.message || t("auth.signup.errors.generic"));
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

  const getInputWrapperClass = (isError?: boolean) => `
    relative w-full rounded-xl transition-all duration-300 font-medium
    ${
      isError
        ? "bg-red-50/50 shadow-[0_8px_30px_rgb(239,68,68,0.15)] ring-1 ring-red-100"
        : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
    }
  `;

  const inputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-text-dark placeholder:text-text-tertiary placeholder:font-normal";
  const errorInputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-red-900 placeholder:text-red-300 placeholder:font-normal";

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

        <div className="mb-5 min-[600px]:mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-text-tertiary hover:text-brand-primary transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{" "}
            <span suppressHydrationWarning>
              {t("auth.verifyEmail.backToHome")}
            </span>
          </Link>
          <h1
            suppressHydrationWarning
            className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark mb-2 min-[600px]:mb-3"
          >
            {t("auth.signup.title")}
          </h1>
          <p
            suppressHydrationWarning
            className="text-text-primary text-sm min-[600px]:text-base"
          >
            {t("auth.signup.subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSignupPress}
          className="space-y-5 min-[600px]:space-y-6"
        >
          {generalError && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {generalError}
            </div>
          )}

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark uppercase tracking-wide">
              {t("auth.signup.nicknameLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.nickname)}>
              <User
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.nickname ? "text-red-400" : "text-text-tertiary"
                }`}
              />
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder={t("auth.signup.placeholders.nickname")}
                maxLength={15}
                className={fieldErrors.nickname ? errorInputClass : inputClass}
              />
              {nickname && (
                <button
                  type="button"
                  onClick={() => setNickname("")}
                  className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark uppercase tracking-wide">
              {t("auth.signup.emailLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.email)}>
              <Mail
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.email ? "text-red-400" : "text-text-tertiary"
                }`}
              />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: false }));
                }}
                placeholder={t("auth.signup.placeholders.email")}
                className={fieldErrors.email ? errorInputClass : inputClass}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark uppercase tracking-wide">
              {t("auth.signup.passwordLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.password)}>
              <Lock
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.password ? "text-red-400" : "text-text-tertiary"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
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
                className={fieldErrors.password ? errorInputClass : inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark uppercase tracking-wide">
              {t("auth.signup.confirmPasswordLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.confirmPassword)}>
              <Lock
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.confirmPassword
                    ? "text-red-400"
                    : "text-text-tertiary"
                }`}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
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
                className={
                  fieldErrors.confirmPassword ? errorInputClass : inputClass
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 min-[600px]:py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              t("auth.signup.createAccountButton")
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-primary font-medium">
          {t("auth.signup.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-brand-primary font-bold hover:underline"
          >
            {t("auth.signup.signInLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
