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

// External imports
import { AlertTriangle, RefreshCw } from "lucide-react";

interface PhoneCrashStateProps {
  onRestart: () => void;
}

export default function PhoneCrashState({ onRestart }: PhoneCrashStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-6 relative overflow-hidden">
      {/* Glitch Effect Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-white animate-[pulse_0.1s_infinite]" />
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 animate-[pulse_0.2s_infinite]" />
        <div className="absolute bottom-1/4 left-0 w-full h-2 bg-blue-500 animate-[pulse_0.3s_infinite]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-mono font-bold text-red-500 tracking-wider uppercase">
            System Failure
          </h3>
          <p className="text-sm text-neutral-400 max-w-[200px] font-mono leading-relaxed">
            Connection to image server interrupted.
          </p>
        </div>

        <button
          onClick={onRestart}
          className="group relative px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <div className="flex items-center gap-3 font-mono text-sm font-bold tracking-wide">
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>RESTART_SYSTEM</span>
          </div>
        </button>

        <div className="font-mono text-[10px] text-neutral-600 pt-8 animate-pulse">
          Error Code: 0xDEADBEEF
        </div>
      </div>
    </div>
  );
}
