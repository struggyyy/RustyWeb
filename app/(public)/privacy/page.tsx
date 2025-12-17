"use client";

import CustomCursor from "@/components/common/CustomCursor";
import { useTranslation, Trans } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans cursor-none bg-neutral-50 transition-colors duration-300">
      <CustomCursor />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 md:py-32">
        <h1
          suppressHydrationWarning
          className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-tight"
        >
          {t("privacy.title")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-200 font-medium mb-12">
          {t("privacy.lastUpdated")}
        </p>

        <div className="h-px bg-neutral-200 dark:bg-neutral-300 w-full my-10" />

        <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.intro")}
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-4">
            {t("privacy.permissions_title")}
          </h2>

          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mt-6 mb-3">
            {t("privacy.permissions_subtitle")}
          </h3>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.permissions_desc")}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600 dark:text-neutral-200">
            <li>
              <Trans
                i18nKey="privacy.permissions_camera"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="privacy.permissions_location"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="privacy.permissions_notifications"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
          </ul>

          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mt-8 mb-3">
            {t("privacy.personal_title")}
          </h3>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.personal_desc")}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600 dark:text-neutral-200">
            <li>
              <strong className="text-neutral-900 dark:text-white">
                {t("privacy.personal_email")}
              </strong>
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-white">
                {t("privacy.personal_creds")}
              </strong>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-4">
            {t("privacy.usage_title")}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.usage_desc")}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600 dark:text-neutral-200">
            <li>
              <Trans
                i18nKey="privacy.usage_service"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="privacy.usage_improve"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="privacy.usage_auth"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-4">
            {t("privacy.thirdparty_title")}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.thirdparty_desc")}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-neutral-600 dark:text-neutral-200">
            <li>
              <Trans
                i18nKey="privacy.thirdparty_firebase"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="privacy.thirdparty_maps"
                components={[
                  <strong className="text-neutral-900 dark:text-white" />,
                ]}
              />
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-4">
            {t("privacy.retention_title")}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.retention_desc")}
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-4">
            {t("privacy.contact_title")}
          </h2>
          <p className="text-neutral-700 dark:text-neutral-200">
            {t("privacy.contact_desc")}
          </p>
          <a
            href="mailto:jakub.strugala.business@gmail.com"
            className="text-brand-primary font-bold hover:underline mb-12 block"
          >
            struggyyycompany@gmail.com
          </a>
        </div>

        <div className="h-px bg-neutral-200 dark:bg-neutral-300 w-full mt-16 mb-6" />

        <footer className="w-full text-center text-neutral-400 dark:text-neutral-200 text-sm font-bold uppercase tracking-widest">
          {t("common.footer")}
        </footer>
      </main>
    </div>
  );
}
