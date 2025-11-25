"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Camera, Save, X, Trash2, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, profile, updateUserProfile, updateUserAuth, uploadProfileImage, deleteAccount } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.displayName || "");
  const [language, setLanguage] = useState(profile?.language || "en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError("Nickname cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Update display name (both Auth and Firestore for persistence)
      if (nickname !== (profile?.displayName || "")) {
        await updateUserAuth({ displayName: nickname });
        await updateUserProfile({ displayName: nickname });
      }

      // Update language preference
      if (language !== (profile?.language || "en")) {
        await updateUserProfile({ language });
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNickname(profile?.displayName || "");
    setLanguage(profile?.language || "en");
    setIsEditing(false);
    setError("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      await uploadProfileImage(user.uid, file);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteAccount();
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 px-3 md:px-8 py-3 md:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-700">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-3 md:p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-8">

          {/* Profile Image Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 md:w-10 md:h-10 text-neutral-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {uploadingImage ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-700">Profile Picture</h3>
              <p className="text-sm text-neutral-500">Upload a new profile picture</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-700">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Nickname</label>
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-brand-primary transition-all text-neutral-700"
                  placeholder="Enter your nickname"
                />
              ) : (
                <div className="px-4 py-3 bg-neutral-50 rounded-xl text-neutral-700 font-medium">
                  {profile.displayName || "No nickname set"}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                <Mail className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-600 font-medium">{user.email}</span>
              </div>
              <p className="text-xs text-neutral-500">Email cannot be changed</p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Language</label>
              {isEditing ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                  <Globe className="w-5 h-5 text-neutral-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-neutral-700 font-medium"
                  >
                    <option value="en">English</option>
                    <option value="pl">Polski</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                  <Globe className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-700 font-medium">
                    {profile.language === "pl" ? "Polski" : "English"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-700">Account Actions</h3>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium mb-2">Are you sure you want to delete your account?</p>
                  <p className="text-red-600 text-sm">This action cannot be undone. All your data will be permanently removed.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Yes, Delete Account
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-neutral-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
