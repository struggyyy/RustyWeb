"use client";

import CustomCursor from "@/components/ui/CustomCursor";
import { useTranslation, Trans } from "react-i18next";

export default function DownloadPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans cursor-none">
      <CustomCursor />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-center justify-center pt-16 overflow-x-hidden">
        {/* Hero Description */}
        <div className="text-center max-w-5xl mx-auto mb-8 space-y-6">
          <h1 className="text-fluid-title font-black text-neutral-900 tracking-tighter uppercase leading-[0.9]">
            <Trans
              i18nKey="download.title"
              components={[<span className="text-brand-primary" key="0" />]}
            />
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-medium leading-relaxed max-w-4xl mx-auto">
            {t("download.description")}
          </p>
        </div>

        {/* Download Columns */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-3xl px-2">
          {/* Android Column (First - Green) */}
          <div className="flex flex-col items-center p-6 sm:p-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl transition-all duration-300 w-full max-w-[320px] mx-auto transform hover:scale-[1.02] hover:shadow-2xl">
            {/* QR Placeholder */}
            <div className="w-full aspect-square max-w-[250px] bg-[#3DDC84]/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-all border border-[#3DDC84]/20 relative overflow-hidden">
              <div className="text-center p-4 z-10 w-full flex flex-col items-center">
                {/* Google Play Logo SVG - Filled */}
                <svg
                  viewBox="0 0 16 16"
                  className="w-16 h-16 sm:w-20 sm:h-20 text-[#3DDC84] mb-4 drop-shadow-sm"
                  fill="currentColor"
                >
                  <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96 2.694-1.586Zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.295ZM1 13.396V2.603L6.846 8 1 13.396ZM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27Z" />
                </svg>
                <span className="text-[#3DDC84]/80 font-bold uppercase tracking-widest text-xs sm:text-sm">
                  {t("download.comingSoon")}
                </span>
              </div>
            </div>

            {/* Store Button */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-[#3DDC84] text-white rounded-xl w-full max-w-[250px] justify-center transition-all transform hover:scale-105 hover:opacity-90 shadow-xl hover:bg-[#35c274]"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex-shrink-0">
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96 2.694-1.586Zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.295ZM1 13.396V2.603L6.846 8 1 13.396ZM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27Z" />
                </svg>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold opacity-90">
                  {t("download.getItOn")}
                </span>
                <span className="text-base font-bold whitespace-nowrap">
                  Google Play
                </span>
              </div>
            </a>
          </div>

          {/* iOS Column (Second - Black) */}
          <div className="flex flex-col items-center p-6 sm:p-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl transition-all duration-300 w-full max-w-[320px] mx-auto transform hover:scale-[1.02] hover:shadow-2xl">
            {/* QR Placeholder */}
            <div className="w-full aspect-square max-w-[250px] bg-neutral-900 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-all relative overflow-hidden">
              <div className="text-center p-4 z-10 w-full flex flex-col items-center">
                {/* Apple Logo SVG - Filled */}
                <svg
                  viewBox="0 0 16 16"
                  className="w-16 h-16 sm:w-20 sm:h-20 text-white mb-4 drop-shadow-sm"
                  fill="currentColor"
                >
                  <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                </svg>
                <span className="text-white font-bold uppercase tracking-widest text-xs sm:text-sm">
                  {t("download.comingSoon")}
                </span>
              </div>
            </div>

            {/* Store Button */}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-black text-white rounded-xl w-full max-w-[250px] justify-center transition-all transform hover:scale-105 hover:opacity-90 shadow-xl hover:bg-neutral-800"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex-shrink-0">
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                </svg>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold opacity-90">
                  {t("download.downloadOn")}
                </span>
                <span className="text-lg sm:text-xl font-bold">App Store</span>
              </div>
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-neutral-400 text-sm font-bold uppercase tracking-widest">
        {t("common.footer")}
      </footer>
    </div>
  );
}
