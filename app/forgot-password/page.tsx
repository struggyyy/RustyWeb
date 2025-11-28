"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Send } from "lucide-react";
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
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setMessage({
        type: "success",
        text: "Password reset link sent! Check your email.",
      });
      setEmail(""); // Clear input on success
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      if (err.code === "auth/user-not-found") {
        setMessage({
          type: "error",
          text: "No account found with this email address.",
        });
      } else if (err.code === "auth/invalid-email") {
        setMessage({
          type: "error",
          text: "Please enter a valid email address.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to send reset link. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-text-dark placeholder:text-text-tertiary font-medium"
              />
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
