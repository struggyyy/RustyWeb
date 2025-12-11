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
import { useAuth } from "@/context/AuthContext";

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
        if (!nickname) firstErrorMessage = "Nickname is required.";
        else if (nickname.length < 2)
          firstErrorMessage = "Nickname must be at least 2 characters.";
        else
          firstErrorMessage = "Nickname cannot be longer than 15 characters.";
      }
      hasError = true;
    }

    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      newFieldErrors.email = true;
      if (!firstErrorMessage)
        firstErrorMessage = "Please enter a valid email address.";
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
        if (!password) firstErrorMessage = "Password is required.";
        else if (password !== confirmPassword)
          firstErrorMessage = "Passwords do not match.";
        else if (password.length < 6)
          firstErrorMessage = "Password must be at least 6 characters.";
        else
          firstErrorMessage =
            "Password must contain at least one uppercase letter and one number.";
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
      await signUp(email, password, nickname, "en");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setGeneralError(
          "This email address is already registered. Try logging in?"
        );
      } else {
        setGeneralError(err.message || "Sign up failed. Please try again.");
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
        : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:shadow-[0_8px_30px_rgb(var(--brand-primary),0.15)]"
    }
  `;

  const inputClass =
    "w-full pl-12 pr-12 py-4 bg-transparent outline-none rounded-xl text-text-dark placeholder:text-text-tertiary placeholder:font-normal";
  const errorInputClass =
    "w-full pl-12 pr-12 py-4 bg-transparent outline-none rounded-xl text-red-900 placeholder:text-red-300 placeholder:font-normal";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 min-[540px]:p-10 border border-white/60">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-text-tertiary hover:text-brand-primary transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-text-dark mb-3">
            Create Account
          </h1>
          <p className="text-text-primary">
            Join us to start reporting abandoned vehicles.
          </p>
        </div>

        <form onSubmit={handleSignupPress} className="space-y-6">
          {generalError && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {generalError}
            </div>
          )}

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Nickname
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
                placeholder="Your nickname"
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
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Email
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
                placeholder="name@example.com"
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
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Password
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
                placeholder="••••••••"
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
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Confirm Password
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
            className="w-full py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-primary font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-primary font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
