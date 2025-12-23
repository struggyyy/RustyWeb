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

import { Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export default function PhoneBootState() {
  const [logs, setLogs] = useState<string[]>([]);
  const [dots, setDots] = useState("");

  const bootSequence = [
    "BIOS Check... OK",
    "Loading Kernel...",
    "Mounting Assets...",
    "Connecting to Network...",
    "Initializing UI...",
    "Starting RustyOS...",
  ];

  useEffect(() => {
    let currentIndex = 0;

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Animate logs
    const logInterval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setLogs((prev) => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 800);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-6 relative overflow-hidden font-mono z-50">
      <div className="flex flex-col items-center space-y-8 w-full max-w-[240px]">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse" />
          <Terminal className="w-12 h-12 text-brand-primary relative z-10" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-widest text-white">
            RUSTY<span className="text-brand-primary">OS</span>
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
        </div>

        {/* Terminal Logs */}
        <div className="w-full h-32 flex flex-col justify-end space-y-1.5 text-[10px] text-neutral-400 border-l-2 border-neutral-800 pl-3">
          {logs.map((log, i) => (
            <div
              key={i}
              className="animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span className="text-neutral-600 mr-2">{">"}</span>
              <span
                className={i === logs.length - 1 ? "text-brand-primary" : ""}
              >
                {log}
              </span>
            </div>
          ))}
          <div className="animate-pulse text-brand-primary">
            <span className="text-neutral-600 mr-2">{">"}</span>
            Booting{dots}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary/50 animate-[progress_2s_ease-in-out_infinite]"
            style={{ width: "50%" }}
          />
        </div>
      </div>

      {/* Version Footer */}
      <div className="absolute bottom-6 text-[10px] text-neutral-600 tracking-widest">
        V 1.0.0 ALPHA
      </div>
    </div>
  );
}
