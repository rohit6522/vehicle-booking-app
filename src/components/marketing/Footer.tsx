"use client";

const COMPANY_LINKS = ["About", "Careers", "Blog", "Contact"];
const SERVICE_LINKS = ["Bike Rental", "Car Rental", "SUV & Van", "Truck Booking"];

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.95 1.43-3.95 4.06V10H7.6v3.1h2.78v8h3.12z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="15" height="15" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <path d="M18.3 2H21l-6.6 7.5L22.2 22h-6.9l-5.4-6.9L3.6 22H1l7.1-8.1L1.1 2H8.2l4.9 6.3L18.3 2Zm-1.2 18h1.9L7 4h-2l12.1 16Z" />
    </svg>
  );
}
function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.78 2.66 4.78 6.1V21h-4v-5.6c0-1.35-.02-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.7h-4V9z" />
    </svg>
  );
}

const SOCIALS = [FacebookIcon, InstagramIcon, XIcon, LinkedInIcon];

export function Footer() {
  return (
    <footer className="bg-black px-4 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white font-black text-xl tracking-tight">
              RYDEX
            </h3>
            <p className="text-neutral-400 text-sm mt-3 max-w-[220px]">
              Book any vehicle — from bikes to trucks. Trusted owners.
              Transparent pricing.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIALS.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/40 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-neutral-300 text-xs tracking-wide font-semibold mb-4">
              COMPANY
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  
                   <a href="#"
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
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
                <li key={link}>
                  
                   <a href="#"
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-xs tracking-wide font-semibold mb-4">
              STAY UPDATED
            </h4>
            <p className="text-sm text-neutral-400 mb-3">
              Subscribe for updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-l-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
              />
              <button className="px-4 rounded-r-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors">
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-6 border-t border-white/10">
          <p className="text-xs text-neutral-500">
            © 2026 RYDEX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-neutral-500 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-neutral-500 hover:text-white">
              Terms
            </a>
            <a href="#" className="text-xs text-neutral-500 hover:text-white">
              Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}