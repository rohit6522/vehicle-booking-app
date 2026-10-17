"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

type NavLink = { label: string; href: string; authRequired?: boolean };

const RIDER_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Book a Ride", href: "/rider/book", authRequired: true },
  { label: "My Bookings", href: "/bookings", authRequired: true },
  { label: "Fleet", href: "/#fleet" },
  { label: "Contact", href: "/contact" },
];

const DRIVER_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/driver/dashboard" },
  { label: "Ride Requests", href: "/driver/requests" },
  { label: "My Bookings", href: "/bookings" },
];

const ADMIN_LINKS: NavLink[] = [{ label: "Dashboard", href: "/admin/dashboard" }];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const role = (session?.user as any)?.role;
  const links: NavLink[] =
    status === "loading"
      ? []
      : role === "driver"
      ? DRIVER_LINKS
      : role === "admin"
      ? ADMIN_LINKS
      : RIDER_LINKS;

  function handleLinkClick(e: React.MouseEvent, link: NavLink) {
    setMobileOpen(false);
    if (link.authRequired && status !== "authenticated") {
      e.preventDefault();
      setModalOpen(true);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-8 py-4">
          <Link href="/" className="text-white font-black text-lg tracking-tight">
            RYDEX
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-white font-semibold"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {status === "authenticated" && session?.user ? (
              <UserMenu
                name={session.user.name ?? "User"}
                role={role ?? "rider"}
              />
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
              title="Menu"
              className="md:hidden w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && links.length > 0 && (
          <nav className="md:hidden flex flex-col px-5 sm:px-8 pb-3 border-t border-white/10">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="text-sm text-neutral-300 hover:text-white transition-colors py-3"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}