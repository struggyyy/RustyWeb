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
    <div className="min-h-screen font-sans bg-neutral-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link 
          href="/dashboard"
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Header / Actions */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-700">Profile Settings</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-lg font-medium hover:bg-neutral-50 transition-colors shadow-sm text-sm sm:text-base"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Profile Image */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-md">
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300" />
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-700 mb-1">
                  {profile.displayName || "User"}
                </h3>
                <p className="text-neutral-400 text-sm sm:text-base">{user.email}</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-brand-primary font-medium text-sm hover:underline"
                >
                  Change Profile Picture
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Nickname */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-bold text-neutral-700 uppercase tracking-wide">Nickname</label>
                {isEditing ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                    <User className="w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="flex-1 bg-transparent focus:outline-none text-neutral-700 font-medium placeholder-neutral-300 text-sm sm:text-base"
                      placeholder="Enter your nickname"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                    <User className="w-5 h-5 text-neutral-400" />
                    <span className="text-neutral-700 font-medium text-sm sm:text-base">
                      {profile.displayName || "Not set"}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-bold text-neutral-700 uppercase tracking-wide">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl opacity-75 cursor-not-allowed">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-500 font-medium text-sm sm:text-base">{user.email}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500">Email cannot be changed</p>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-bold text-neutral-700 uppercase tracking-wide">Language</label>
                {isEditing ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex-1 bg-transparent focus:outline-none text-neutral-700 font-medium text-sm sm:text-base"
                    >
                      <option value="en">English</option>
                      <option value="pl">Polski</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <span className="text-neutral-700 font-medium text-sm sm:text-base">
                      {profile.language === "pl" ? "Polski" : "English"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t border-neutral-200 pt-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-700">Account Actions</h3>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium mb-2 text-sm sm:text-base">Are you sure you want to delete your account?</p>
                    <p className="text-red-600 text-sm">This action cannot be undone. All your data will be permanently removed.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
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
                      className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-neutral-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
