"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Bookings", href: "/bookings" },
  { label: "Fleet", href: "#fleet" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-6 z-40 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/90 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
          <span className="text-white font-black text-lg tracking-tight">
            RYDEX
          </span>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-neutral-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {status === "authenticated" && session?.user ? (
            <UserMenu
              name={session.user.name ?? "User"}
              role={(session.user as any)?.role ?? "rider"}
            />
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}