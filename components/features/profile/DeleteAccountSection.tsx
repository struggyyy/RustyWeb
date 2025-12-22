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

// External libraries
import { Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteAccountSectionProps {
  isEditing: boolean;
  isSubmitting: boolean;
  showDeleteConfirm: boolean;
  onSave: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export default function DeleteAccountSection({
  isEditing,
  isSubmitting,
  showDeleteConfirm,
  onSave,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: DeleteAccountSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center w-full">
      {isEditing ? (
        <button
          onClick={onSave}
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
          onClick={onDeleteRequest}
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
              onClick={onDeleteCancel}
              className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-bold shadow-sm hover:bg-neutral-50 transition-colors"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={onDeleteConfirm}
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
  );
}
