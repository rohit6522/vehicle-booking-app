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
    role === "driver" ? DRIVER_LINKS : role === "admin" ? ADMIN_LINKS : RIDER_LINKS;

  return (
    <>
      {/* Fixed-height wrapper so this element's own internal resize never
          reflows the rest of the page — everything below stays put while
          the bar itself gradually morphs. */}
      <header className="sticky top-0 z-40 h-[76px] px-0">
        <div
          className={`mx-auto bg-black/90 backdrop-blur-md border border-white/10 transition-[max-width,border-radius,padding,margin-top] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[max-width,padding] ${
            scrolled
              ? "max-w-6xl rounded-full px-6 py-3 mt-6 mx-4 sm:mx-auto"
              : "max-w-full rounded-none px-5 sm:px-8 py-[18px] mt-0"
          }`}
        >
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
                <UserMenu name={session.user.name ?? "User"} role={role ?? "rider"} />
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setMobileOpen((o) => !o)}
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
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors py-2.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}