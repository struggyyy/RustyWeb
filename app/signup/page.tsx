"use client";

import Link from "next/link";
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
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

  const getInputClass = (isError?: boolean) => `
    w-full pl-12 pr-12 py-4 bg-neutral-50 border-2 rounded-xl focus:outline-none transition-all font-medium
    ${
      isError
        ? "border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:bg-red-50"
        : "border-neutral-200 text-text-dark placeholder:text-text-tertiary focus:border-neutral-400 focus:bg-white"
    }
  `;

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

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Nickname
            </label>
            <div className="relative">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  fieldErrors.nickname ? "text-red-400" : "text-text-tertiary"
                }`}
              />
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="Your nickname"
                maxLength={15}
                className={getInputClass(fieldErrors.nickname)}
              />
              {nickname && (
                <button
                  type="button"
                  onClick={() => setNickname("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
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
                className={getInputClass(fieldErrors.email)}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
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
                className={getInputClass(fieldErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
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
                className={getInputClass(fieldErrors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
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
