"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function PartnerNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-black border-b border-white/10">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-5 sm:px-8 py-4">
        <span className="text-white font-black text-lg tracking-tight">
          RYDEX{" "}
          <span className="text-neutral-400 font-medium text-sm">Partner</span>
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