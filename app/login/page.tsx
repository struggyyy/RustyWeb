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
  Eye,
  EyeOff,
  XCircle,
  Check,
} from "lucide-react";

// Internal imports
import { useAuth } from "@/context/AuthContext";

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
                  if (generalError) setGeneralError("");
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
                    setFieldErrors((prev) => ({ ...prev, password: false }));
                  if (generalError) setGeneralError("");
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-text-primary font-medium cursor-pointer group select-none relative z-10">
              <div className="relative mr-3 flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 rounded-full border-2 border-neutral-300 checked:bg-brand-primary checked:border-brand-primary transition-all duration-200 cursor-pointer"
                />
                <Check
                  className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                  strokeWidth={3}
                />
              </div>
              <span className="text-sm">Remember me</span>
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
