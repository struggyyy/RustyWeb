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
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

// External libraries
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Camera,
  Save,
  X,
  Trash2,
  Globe,
} from "lucide-react";

// Internal imports
import { useAuth } from "@/context/AuthContext";
import ProfileImageModal from "@/components/features/settings/ProfileImageModal";

export default function SettingsPage() {
  const {
    user,
    profile,
    updateUserProfile,
    updateUserAuth,
    uploadProfileImage,
    deleteAccount,
  } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState(profile?.displayName || "");
  const [language, setLanguage] = useState(profile?.language || "en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError(t("settings.emptyNicknameError"));
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
      setError(err.message || t("settings.updateError"));
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("settings.invalidImageError"));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("settings.imageSizeError"));
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      await uploadProfileImage(user.uid, file);
    } catch (err: any) {
      setError(err.message || t("settings.uploadError"));
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
    } catch (err: any) {
      setError(err.message || t("settings.deleteError"));
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative">
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50">
        <Link
          href="/dashboard"
          className="w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all shadow-xl text-neutral-500 hover:text-brand-primary"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
      </div>

      <main className="max-w-xl mx-auto p-4 sm:p-8 pt-20 sm:pt-24">
        {/* Glassy Card */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden relative">
          {/* Edit Button (Top Right) */}
          <div className="absolute top-6 right-6 z-10">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/50 hover:bg-white/80 border border-white/60 text-neutral-700 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
              >
                {t("settings.editProfile")}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white/50 hover:bg-white/80 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all"
                  title={t("settings.cancel")}
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  title={t("settings.saveChanges")}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-8 sm:p-10 flex flex-col items-center">
            {/* Profile Image Section */}
            <div className="relative mb-6">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-2xl cursor-pointer transition-transform hover:scale-[1.02] group"
                onClick={() =>
                  profile.profileImage ? setIsModalOpen(true) : null
                }
              >
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-50 text-neutral-300">
                    <User className="w-16 h-16" />
                  </div>
                )}

                {/* Hover Overlay for View */}
                {profile.profileImage && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center rounded-full"></div>
                )}
              </div>

              {/* Upload Button (Floating) */}
              <div
                className="absolute bottom-1 right-1 w-9 h-9 bg-neutral-900 text-white rounded-full shadow-lg cursor-pointer hover:bg-neutral-800 hover:scale-110 transition-all border-4 border-white flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info / Edit Forms */}
            <div className="w-full space-y-6 text-center">
              {/* Display Mode */}
              {!isEditing ? (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-800 tracking-tight">
                    {profile.displayName || t("settings.anonymousUser")}
                  </h2>
                  <p className="text-neutral-500 font-medium">{user.email}</p>

                  <div className="pt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/50 rounded-full border border-neutral-200/50">
                      <Globe className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-bold text-neutral-600">
                        {language === "en" ? "English" : "Polski"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">
                      {t("settings.nickname")}
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-neutral-800 placeholder:text-neutral-300 transition-all"
                      placeholder="Your nickname"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">
                      {t("nav.language")}
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100/50 rounded-xl border border-neutral-200/50">
                      <button
                        onClick={() => setLanguage("en")}
                        className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                          language === "en"
                            ? "bg-white shadow-sm text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-600"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage("pl")}
                        className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                          language === "pl"
                            ? "bg-white shadow-sm text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-600"
                        }`}
                      >
                        Polski
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-10" />

            {/* Account Actions */}
            <div className="w-full">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-center text-red-500 hover:text-red-700 font-bold text-sm transition-colors py-2"
                >
                  {t("settings.deleteAccount")}
                </button>
              ) : (
                <div className="bg-red-50/80 border border-red-100 rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <h4 className="text-red-800 font-bold">
                      {t("settings.deleteConfirmationTitle")}
                    </h4>
                    <p className="text-red-600 text-xs">
                      {t("settings.deleteConfirmationDesc")}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-bold shadow-sm hover:bg-neutral-50 transition-colors"
                    >
                      {t("settings.cancel")}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          {t("settings.delete")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ProfileImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={profile.profileImage || null}
        title={profile.displayName || t("settings.profilePicture")}
      />
    </div>
  );
}
