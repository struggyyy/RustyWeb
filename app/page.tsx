import Link from "next/link";
import { User, MoreHorizontal } from "lucide-react";
import CustomCursor from "@/components/ui/CustomCursor";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans cursor-none">
      <CustomCursor />
      {/* Fixed Top Navigation - Invisible Safe Area */}
      <nav className="fixed top-0 left-0 right-0 px-4 pt-4 pb-2 md:px-10 md:pt-8 md:pb-10 z-50 flex justify-end gap-3 pointer-events-none">
        <button className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/60 hover:scale-105 transition-all shadow-lg pointer-events-auto">
          <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
        </button>
        <Link
          href="/login"
          className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center hover:bg-white/60 hover:scale-105 transition-all shadow-lg pointer-events-auto"
        >
          <User className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 flex justify-center pt-16 overflow-x-hidden overflow-y-auto min-h-[calc(100vh-2rem)] md:min-h-0">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-[var(--gap-fluid)] w-full max-w-5xl lg:max-w-[1600px]">
          {/* Left Side - CTA */}
          <div className="w-auto flex flex-col items-start space-y-4 z-10 md:pb-48">
            {/* Slogan and Buttons Container */}
            <div className="flex flex-col items-start">
              <h1 className="text-fluid-title font-black text-neutral-900 leading-[0.9] tracking-tighter whitespace-nowrap">
                BETTER CITIES,{" "}
                <span className="block text-fluid-subtitle text-neutral-400 mt-2">
                  ONE REPORT AT A TIME.
                </span>
              </h1>

              <div className="flex gap-3 md:gap-4 items-center mt-2 md:mt-3">
                <Link
                  href="/signup"
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
          <div className="w-full md:w-[320px] flex justify-center relative md:mt-0 flex-shrink-0">
            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neutral-50 rounded-full blur-3xl -z-10" />

            {/* Phone Bezel - Responsive with maintained aspect ratio */}
            <div className="relative w-[320px] h-[640px] sm:w-[320px] sm:h-[640px] md:w-[320px] md:h-[640px] bg-neutral-900 rounded-[3.5rem] border-[12px] border-neutral-900 shadow-2xl overflow-hidden ring-4 ring-neutral-100/50 flex-shrink-0">
              {/* Dynamic Island / Notch */}
              {/* <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-30 flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                <div className="w-12 h-1.5 rounded-full bg-[#1a1a1a]" />
              </div> */}
              {/* Punch Hole Camera */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 shadow-sm flex items-center justify-center ring-1 ring-white/5">
                <div className="w-2 h-2 rounded-full bg-[#0a0a0a] ring-1 ring-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-gradient-to-tr from-transparent via-blue-400/20 to-transparent rounded-full" />
                </div>
              </div>

              {/* Screen Content Placeholder */}
              {/* <div className="w-full h-full bg-neutral-100 flex items-center justify-center relative font-sans">
                <div className="text-neutral-300 font-bold text-2xl uppercase tracking-widest text-center px-8">
                  App Screenshot Placeholder
                </div>
              </div> */}
              {/* Video Placeholder - Add 'app-demo.mp4' to your public folder */}
              <video
                src="/app-demo.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-neutral-400 text-sm font-bold uppercase tracking-widest">
        © 2025 Created by struggyyy
      </footer>
    </div>
  );
}
