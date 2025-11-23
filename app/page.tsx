import Link from "next/link";
import { User } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans">
      {/* Fixed Top Navigation - Invisible Safe Area */}
      <nav className="fixed top-0 left-0 right-0 px-4 py-2 md:p-10 z-50 flex justify-end pointer-events-none">
        <Link 
          href="/login"
          className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-sm pointer-events-auto"
        >
          <User className="w-5 h-5 md:w-6 md:h-6 text-neutral-400" />
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 lg:py-16 flex flex-col md:flex-row items-center gap-8 lg:gap-12 pt-16 lg:pt-32 overflow-x-hidden overflow-y-auto min-h-[calc(100vh-2rem)]">
        {/* Left Side - CTA */}
        <div className="w-full md:flex-1 flex flex-col items-center md:items-center space-y-4 lg:space-y-8 z-10">
          {/* Slogan and Buttons Container */}
          <div className="w-[320px] sm:w-[320px] md:w-[320px] lg:w-[340px]">
            <h1 className="text-fluid-title font-black text-neutral-900 leading-[0.9] tracking-tighter whitespace-nowrap">
              BETTER CITIES, <span className="block text-fluid-subtitle text-neutral-400 mt-2">ONE REPORT AT A TIME.</span>
            </h1>

            <div className="flex gap-3 md:gap-4 items-center mt-2 md:mt-6">
              <Link
                href="/login"
                className="px-[var(--padding-button-horizontal)] py-[var(--padding-button-vertical)] bg-brand-primary text-white text-fluid-button font-black uppercase tracking-wider rounded-2xl shadow-xl hover:opacity-90 hover:scale-105 transition-all transform flex items-center justify-center whitespace-nowrap"
              >
                Join Us
              </Link>
              <button className="px-[var(--padding-button-horizontal)] py-[var(--padding-button-vertical)] bg-[#CECECE] text-white text-fluid-button font-black uppercase tracking-wider rounded-2xl shadow-lg hover:bg-neutral-300 hover:scale-105 transition-all transform flex items-center justify-center whitespace-nowrap">
                Download the App
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Phone Mockup */}
        <div className="w-full md:w-[320px] lg:w-[340px] flex justify-center relative mt-1 md:mt-0 flex-shrink-0">
           {/* Decorative glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neutral-50 rounded-full blur-3xl -z-10" />
           
           {/* Phone Bezel - Responsive with maintained aspect ratio */}
           <div className="relative w-[320px] h-[640px] sm:w-[320px] sm:h-[640px] md:w-[320px] md:h-[640px] lg:w-[340px] lg:h-[680px] bg-neutral-900 rounded-[3.5rem] border-[12px] border-neutral-900 shadow-2xl overflow-hidden ring-4 ring-neutral-100/50 flex-shrink-0">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-30 flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                  <div className="w-12 h-1.5 rounded-full bg-[#1a1a1a]" />
              </div>

              {/* Screen Content Placeholder */}
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center relative font-sans">
                {/* Screenshot Placeholder */}
                <div className="text-neutral-300 font-bold text-2xl uppercase tracking-widest text-center px-8">
                  App Screenshot Placeholder
                </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
