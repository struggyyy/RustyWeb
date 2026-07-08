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
import { useState } from "react";

// External libraries
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Pencil } from "lucide-react";

// Internal imports
import { useAuth } from "@/components/context/AuthContext";
import ProfileImageModal from "@/components/features/profile/ProfileImageModal";
import CustomCursor from "@/components/common/CustomCursor";
import ProfileAvatar from "@/components/features/profile/ProfileAvatar";
import ProfileForm from "@/components/features/profile/ProfileForm";
import DeleteAccountSection from "@/components/features/profile/DeleteAccountSection";

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
    event: React.ChangeEvent<HTMLInputElement>,
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
            <ProfileAvatar
              imageUrl={profile.profileImage}
              isEditing={isEditing}
              uploadingImage={uploadingImage}
              onImageUpload={handleImageUpload}
              onImageClick={() =>
                profile.profileImage ? setIsModalOpen(true) : null
              }
            />

            {/* User Info / Edit Forms */}
            <ProfileForm
              isEditing={isEditing}
              nickname={nickname}
              email={user.email || ""}
              language={language}
              error={error}
              onNicknameChange={setNickname}
              onLanguageChange={setLanguage}
            />

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-8" />

            {/* Account Actions */}
            <DeleteAccountSection
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              showDeleteConfirm={showDeleteConfirm}
              onSave={handleSave}
              onDeleteRequest={() => setShowDeleteConfirm(true)}
              onDeleteConfirm={handleDeleteAccount}
              onDeleteCancel={() => setShowDeleteConfirm(false)}
            />
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
