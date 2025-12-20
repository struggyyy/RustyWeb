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
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  XCircle,
  Check,
} from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, updateUserProfile } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (lang !== i18n.language) {
      // Optional: Persist to user profile if we had a user object, but we are logging in.
      // We can just rely on i18next local storage persistence here.
    }
  };

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
        // Generic security message, highlight both if possible or neither (to avoid leaking existence)
        // Mobile app highlights neither, just shows generic error. We will do the same.
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

  const getInputWrapperClass = (isError?: boolean) => `
    relative w-full rounded-xl transition-all duration-300 font-medium
    ${
      isError
        ? "bg-red-50/50 dark:bg-red-900/20 shadow-[0_8px_30px_rgb(239,68,68,0.15)] ring-1 ring-red-100 dark:ring-red-800"
        : "bg-white dark:bg-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.25)] dark:focus-within:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
    }
  `;

  const inputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-text-dark placeholder:text-text-tertiary placeholder:font-normal";
  const errorInputClass =
    "w-full pl-12 pr-12 py-2.5 min-[600px]:py-4 bg-transparent outline-none rounded-xl text-red-900 placeholder:text-red-300 placeholder:font-normal";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-neutral-50/60 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] p-4 min-[600px]:p-10 border border-white/60 dark:border-neutral-700/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
        <div className="absolute top-4 right-4 flex bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg p-0.5 border border-white/40 dark:border-neutral-700/40 z-10 w-24">
          {/* Animated Sliding Background */}
          <div
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white dark:bg-neutral-600 rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              i18n.language === "pl" ? "translate-x-full" : "translate-x-0"
            } left-0.5`}
          />
          <button
            suppressHydrationWarning
            onClick={() => handleLanguageChange("en")}
            className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
              i18n.language === "en"
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            }`}
          >
            EN
          </button>
          <button
            suppressHydrationWarning
            onClick={() => handleLanguageChange("pl")}
            className={`flex-1 relative z-10 px-2 py-0.5 text-xs font-bold rounded-md transition-colors duration-200 ${
              i18n.language === "pl"
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            }`}
          >
            PL
          </button>
        </div>

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

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark dark:text-neutral-200 uppercase tracking-wide">
              {t("auth.login.emailLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.email)}>
              <Mail
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.email
                    ? "text-red-400"
                    : "text-text-tertiary dark:text-neutral-500"
                }`}
              />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: false }));
                  if (generalError) setGeneralError("");
                }}
                placeholder="name@example.com"
                className={`${
                  fieldErrors.email ? errorInputClass : inputClass
                } dark:text-neutral-900 dark:placeholder:text-neutral-500`}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-neutral-500 hover:text-text-primary dark:hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark dark:text-neutral-200 uppercase tracking-wide">
              {t("auth.login.passwordLabel")}
            </label>
            <div className={getInputWrapperClass(fieldErrors.password)}>
              <Lock
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  fieldErrors.password
                    ? "text-red-400"
                    : "text-text-tertiary dark:text-neutral-500"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: false }));
                  if (generalError) setGeneralError("");
                }}
                placeholder="••••••••"
                className={`${
                  fieldErrors.password ? errorInputClass : inputClass
                } dark:text-neutral-900 dark:placeholder:text-neutral-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-neutral-500 hover:text-text-primary dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 min-[600px]:py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              t("auth.login.signInButton")
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-primary dark:text-white font-medium relative z-10">
          {t("auth.login.noAccount")}{" "}
          <Link
            href={`/signup${
              email ? `?email=${encodeURIComponent(email)}` : ""
            }`}
            className="text-brand-primary font-bold hover:underline"
          >
            {t("auth.login.signUpLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
