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

// React-specific imports
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

// External libraries
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  X,
  Trash2,
  Globe,
  Pencil,
} from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import ProfileImageModal from "@/components/features/settings/ProfileImageModal";
import CustomCursor from "@/components/common/CustomCursor";
import LanguageToggle from "@/components/common/LanguageToggle";

export default function SettingsPage() {
  const {
    user,
    profile,
    updateUserProfile,
    updateUserAuth,
    uploadProfileImage,
    deleteAccount,
    isAdmin,
    loading,
  } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State Management
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState(profile?.displayName || "");
  const [language, setLanguage] = useState(profile?.language || "en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isGoingBack, setIsGoingBack] = useState(false);

  const handleBack = () => {
    setIsGoingBack(true);

    setTimeout(() => {
      // Check if there is a referrer and if it belongs to our app (same origin)
      if (
        document.referrer &&
        document.referrer.startsWith(window.location.origin)
      ) {
        router.back();
      } else {
        // Fallback if opened directly, from external site, or no referrer
        router.push(isAdmin ? "/admin" : "/dashboard");
      }
    }, 600);
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError("profile.emptyNicknameError");
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
      setError(err.message || "profile.updateError");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const originalLanguage = profile?.language || "en";
    setNickname(profile?.displayName || "");
    setLanguage(originalLanguage);
    i18n.changeLanguage(originalLanguage);
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
      setError("profile.invalidImageError");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("profile.imageSizeError");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      await uploadProfileImage(user.uid, file);
    } catch (err: any) {
      setError(err.message || "profile.uploadError");
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
      setError(err.message || "profile.deleteError");
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative">
      {!isAdmin && <CustomCursor variant="precise" />}
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50">
        <button
          onClick={handleBack}
          className={`relative overflow-hidden w-10 h-10 md:w-12 md:h-12 bg-neutral-50/60 backdrop-blur-2xl border border-white/60 dark:border-neutral-700/60 rounded-full flex items-center justify-center hover:bg-neutral-50/80 hover:scale-105 transition-all duration-500 ease-in-out shadow-xl ${
            isGoingBack
              ? "scale-110 shadow-brand-primary/20 dark:shadow-brand-primary/20"
              : "scale-100 dark:shadow-white/10"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          <ArrowLeft
            className={`relative z-10 w-5 h-5 md:w-6 md:h-6 text-neutral-500 dark:text-white transition-all duration-500 ease-in-out ${
              isGoingBack
                ? "animate-shake-left"
                : "translate-x-0 opacity-100 scale-100"
            }`}
          />
        </button>
      </div>

      <main className="max-w-xl mx-auto p-4 sm:p-8 pt-20 sm:pt-24">
        {/* Glassy Card */}
        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl border border-white/60 dark:border-neutral-700/60 shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] rounded-3xl overflow-hidden relative transition-all duration-300">
          {/* Liquid Glass Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          {/* Edit/Cancel Button (Top Right) */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  setIsEditing(true);
                }
              }}
              className="transition-transform hover:scale-110 active:scale-95"
              title={isEditing ? t("profile.cancel") : t("profile.editProfile")}
            >
              {isEditing ? (
                <X className="w-6 h-6 text-neutral-900 dark:text-white" />
              ) : (
                <Pencil className="w-6 h-6 text-neutral-900 dark:text-white" />
              )}
            </button>
          </div>

          <div className="p-8 sm:p-10 flex flex-col items-center">
            {/* Profile Image Section */}
            <div className="relative mb-6">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-700 shadow-2xl dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer transition-transform hover:scale-[1.02] group"
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
                  <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
                    <User className="w-16 h-16" />
                  </div>
                )}

                {/* Hover Overlay for View */}
                {profile.profileImage && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center rounded-full"></div>
                )}
              </div>

              {/* Upload Button (Floating) */}
              {isEditing && (
                <>
                  <div
                    className="absolute bottom-1 right-1 w-9 h-9 bg-neutral-900 dark:bg-neutral-700 text-white rounded-full shadow-lg cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-600 hover:scale-110 transition-all border-4 border-white dark:border-neutral-800 flex items-center justify-center"
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
                </>
              )}
            </div>

            {/* User Info / Edit Forms */}
            <div className="w-full space-y-6 text-center">
              {/* Display Mode */}
              {!isEditing ? (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-800 dark:text-white tracking-tight">
                    {profile.displayName || t("profile.anonymousUser")}
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-300 font-medium">
                    {user.email}
                  </p>

                  <div className="pt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-full border border-neutral-200/50 dark:border-neutral-700/50 dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      <Globe className="w-4 h-4 text-neutral-400 dark:text-neutral-300" />
                      <span className="text-sm font-bold text-neutral-600 dark:text-white">
                        {language === "en" ? "English" : "Polski"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-neutral-400 dark:text-white uppercase tracking-wider ml-1">
                      {t("profile.nickname")}
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-neutral-200 border border-neutral-200 dark:border-neutral-200 rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary font-bold text-neutral-800 dark:text-neutral-900 placeholder:text-neutral-400 transition-all h-12"
                      placeholder={t("profile.nicknamePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-neutral-400 dark:text-white uppercase tracking-wider ml-1">
                      {t("nav.language")}
                    </label>
                    <LanguageToggle
                      variant="long"
                      onLanguageChange={(lang) => setLanguage(lang)}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {t(error)}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-8" />

            {/* Account Actions */}
            {/* Action Buttons (Below Card) */}
            <div className="flex justify-center w-full">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-12 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t("profile.saveChanges")}
                    </>
                  )}
                </button>
              ) : !showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 font-bold transition-colors text-sm"
                >
                  {t("profile.deleteAccount")}
                </button>
              ) : (
                <div className="w-full bg-red-50/80 border border-red-100 rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <h4 className="text-red-800 font-bold">
                      {t("profile.deleteConfirmationTitle")}
                    </h4>
                    <p className="text-red-600 text-xs">
                      {t("profile.deleteConfirmationDesc")}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-bold shadow-sm hover:bg-neutral-50 transition-colors"
                    >
                      {t("profile.cancel")}
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
                          {t("profile.delete")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-6 text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest mt-8">
          {t("common.footer")}
        </footer>
      </main>

      <ProfileImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={profile.profileImage || null}
        title={profile.displayName || t("profile.profilePicture")}
      />
    </div>
  );
}
