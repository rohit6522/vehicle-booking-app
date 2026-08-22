"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

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

function NavContent({
  links,
  status,
  session,
  role,
  onLoginClick,
  mobileOpen,
  onMobileToggle,
}: {
  links: { label: string; href: string }[];
  status: string;
  session: any;
  role: string | undefined;
  onLoginClick: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <ThemeToggle dark />
          {status === "authenticated" && session?.user ? (
            <UserMenu
              name={session.user.name ?? "User"}
              role={role ?? "rider"}
            />
          ) : (
            <button
              onClick={onLoginClick}
              className="px-5 sm:px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              Login
            </button>
          )}

          <button
            onClick={onMobileToggle}
            aria-label="Toggle menu"
            className="md:hidden w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity,margin-top] duration-300 ease-out ${
          mobileOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <nav className="flex flex-col gap-1 pb-2 border-t border-white/10 pt-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={onMobileToggle}
              className="text-sm text-neutral-300 hover:text-white transition-colors py-2.5"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tickingRef = useRef(false);

   useEffect(() => {
    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        // Hysteresis: switch to pill only after 80px down, switch back to
        // rectangle only below 30px. This gap stops the shape flickering
        // when the scroll position hovers near a single threshold.
        setScrolled((prev) => {
          const y = window.scrollY;
          if (!prev && y > 80) return true;
          if (prev && y < 30) return false;
          return prev;
        });
        tickingRef.current = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [status]);

  const role = (session?.user as any)?.role;
  const links =
    role === "driver"
      ? DRIVER_LINKS
      : role === "admin"
        ? ADMIN_LINKS
        : RIDER_LINKS;

  const shared = {
    links,
    status,
    session,
    role,
    onLoginClick: () => setModalOpen(true),
    mobileOpen,
    onMobileToggle: () => setMobileOpen((o) => !o),
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[76px]">
        {/* Rectangle state (top of page) — full width, sharp corners.
            Always absolutely positioned inside the fixed-height header,
            so toggling never shifts the page's layout — only opacity fades. */}
        <div
          className="absolute inset-x-0 top-0 flex items-center bg-black/90 backdrop-blur-md border border-white/10 px-5 sm:px-8 py-[18px] transition-opacity duration-300 ease-out"
          style={{
            opacity: scrolled ? 0 : 1,
            pointerEvents: scrolled ? "none" : "auto",
          }}
        >
          <div className="w-full">
            <NavContent {...shared} />
          </div>
        </div>

        {/* Pill state (scrolled) — centered, rounded, margin from edges */}
        <div
          className="absolute inset-x-0 top-0 px-4 pt-4 transition-opacity duration-300 ease-out"
          style={{
            opacity: scrolled ? 1 : 0,
            pointerEvents: scrolled ? "auto" : "none",
          }}
        >
          <div className="mx-auto max-w-6xl rounded-3xl bg-black/90 backdrop-blur-md border border-white/10 px-6 py-3">
            <NavContent {...shared} />
          </div>
        </div>
      </header>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
