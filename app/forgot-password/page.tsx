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
import { useState, Suspense } from "react";

// External libraries
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Loader2, Send, XCircle } from "lucide-react";

// Internal imports
import { useAuth } from "@/context/AuthContext";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsEmailError(false);

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      setIsEmailError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setMessage({
        type: "success",
        text: "Link for password reset was sent to your email.",
      });
      setEmail(""); // Clear input on success
    } catch (err: any) {
      console.error("Reset Password Error:", err);

      let errorText = "Password reset failed.";

      if (err.code === "auth/user-not-found") {
        errorText = "User not found or invalid credentials.";
      } else if (err.code === "auth/invalid-email") {
        errorText = "Please enter a valid email address.";
        setIsEmailError(true);
      }

      setMessage({
        type: "error",
        text: errorText,
      });
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-md w-full bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 min-[600px]:p-10 border border-white/60">
        <div className="mb-5 min-[600px]:mb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-text-tertiary hover:text-brand-primary transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
          <h1 className="text-xl min-[600px]:text-3xl font-extrabold text-text-dark mb-2 min-[600px]:mb-3">
            Reset Password
          </h1>
          <p className="text-text-primary text-sm min-[600px]:text-base">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 min-[600px]:space-y-6"
        >
          {message && (
            <div
              className={`p-4 text-sm rounded-xl border font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-2 transition-all duration-300 hover:-translate-y-0.5 focus-within:-translate-y-0.5">
            <label className="text-xs min-[600px]:text-sm font-bold text-text-dark uppercase tracking-wide">
              Email
            </label>
            <div className={getInputWrapperClass(isEmailError)}>
              <Mail
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  isEmailError ? "text-red-400" : "text-text-tertiary"
                }`}
              />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isEmailError) setIsEmailError(false);
                  if (message && message.type === "error") setMessage(null);
                }}
                placeholder="name@example.com"
                className={isEmailError ? errorInputClass : inputClass}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 min-[600px]:py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-sm min-[600px]:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
