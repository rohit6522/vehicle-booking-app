"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

const RIDER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Book a Ride", href: "/rider/book" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Fleet", href: "#fleet" },
  { label: "Contact", href: "#contact" },
];

const DRIVER_LINKS = [
  { label: "Dashboard", href: "/driver/dashboard" },
  { label: "Ride Requests", href: "/driver/requests" },
  { label: "My Bookings", href: "/bookings" },
];

const ADMIN_LINKS = [{ label: "Dashboard", href: "/admin/dashboard" }];

export function Navbar() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  const role = (session?.user as any)?.role;
  const links =
    role === "driver" ? DRIVER_LINKS : role === "admin" ? ADMIN_LINKS : RIDER_LINKS;

  return (
    <>
      <header className="sticky top-6 z-40 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/90 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
          <span className="text-white font-black text-lg tracking-tight">
            RYDEX
          </span>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
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
              role={role ?? "rider"}
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