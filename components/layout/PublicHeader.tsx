import Link from "next/link";
import { User, MoreHorizontal } from "lucide-react";

export default function PublicHeader() {
  return (
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
  );
}
