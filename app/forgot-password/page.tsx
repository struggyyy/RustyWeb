"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
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
            href="/login"
            className="inline-flex items-center text-text-tertiary hover:text-brand-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
          <h1 className="text-3xl font-extrabold text-text-dark mb-3">
            Reset Password
          </h1>
          <p className="text-text-primary">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
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
                className={getInputClass(isEmailError)}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-primary text-text-inverse rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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
