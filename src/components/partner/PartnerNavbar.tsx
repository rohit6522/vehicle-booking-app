"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function PartnerNavbar() {
  return (
    <header className="sticky top-6 z-40 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between bg-black/90 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
        <span className="text-white font-black text-lg tracking-tight">
          RYDEX <span className="text-neutral-400 font-medium text-sm">Partner</span>
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}