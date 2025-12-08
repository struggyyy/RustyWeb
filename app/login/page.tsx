"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

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
      if (!email) setGeneralError("Email is required.");
      else if (newFieldErrors.email)
        setGeneralError("Please enter a valid email address.");
      else if (!password) setGeneralError("Password is required.");
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
        setGeneralError("User not found or invalid credentials.");
      } else if (err.code === "auth/wrong-password") {
        setGeneralError("Incorrect password. Please try again.");
        setFieldErrors({ password: true });
      } else if (err.code === "auth/invalid-email") {
        setGeneralError("Please enter a valid email address.");
        setFieldErrors({ email: true });
      } else if (err.code === "auth/too-many-requests") {
        setGeneralError("Too many login attempts. Please try again later.");
      } else {
        setGeneralError(
          err.message ||
            "Login failed. Please check your connection and try again."
        );
      }
      setIsSubmitting(false);
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
            Welcome Back
          </h1>
          <p className="text-text-primary">
            Sign in to manage your reports and profile.
          </p>
        </div>

        <form onSubmit={handleLoginPress} className="space-y-6">
          {generalError && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {generalError}
            </div>
          )}

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
                  if (generalError) setGeneralError("");
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
                    setFieldErrors((prev) => ({ ...prev, password: false }));
                  if (generalError) setGeneralError("");
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-text-primary font-medium cursor-pointer">
              <input
                type="checkbox"
                className="mr-3 w-4 h-4 rounded border-neutral-200 text-brand-primary focus:ring-brand-primary"
              />
              Remember me
            </label>
          </div>

          <div className="flex justify-end">
            <Link
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              className="text-sm font-bold text-brand-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-primary font-medium">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-primary font-bold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
