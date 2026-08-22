"use client";

import { useState } from "react";
import { toast } from "sonner";

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "#", soon: true },
  { label: "Blog", href: "#", soon: true },
  { label: "Contact", href: "/contact" },
];

const SERVICE_LINKS = [
  { label: "Bike Rental", href: "/rider/book?vehicle=bike" },
  { label: "Car Rental", href: "/rider/book?vehicle=car" },
  { label: "SUV & Van", href: "/rider/book?vehicle=suv" },
  { label: "Truck Booking", href: "/rider/book?vehicle=van" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success(data.message ?? "Subscribed!");
      setEmail("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-black px-4 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white font-black text-xl tracking-tight">RYDEX</h3>
            <p className="text-neutral-400 text-sm mt-3 max-w-[220px]">
              Book any vehicle — from bikes to trucks. Trusted owners.
              Transparent pricing.
            </p>
          </div>

          <div>
            <h4 className="text-neutral-300 text-xs tracking-wide font-semibold mb-4">
              COMPANY
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  {link.soon ? (
                    <span className="text-sm text-neutral-600 cursor-default">
                      {link.label} <span className="text-[10px]">(soon)</span>
                    </span>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-xs tracking-wide font-semibold mb-4">
              SERVICES
            </h4>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-xs tracking-wide font-semibold mb-4">
              STAY UPDATED
            </h4>
            <p className="text-sm text-neutral-400 mb-3">Subscribe for updates</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-l-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 rounded-r-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Go"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-6 border-t border-white/10">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} RYDEX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-xs text-neutral-500 hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-neutral-500 hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}