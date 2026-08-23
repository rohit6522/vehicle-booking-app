"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Bike, Car, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function UserMenu({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 rounded-full bg-black text-white font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {initial}
      </button>

           <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-5 text-left"
        >
          <p className="font-bold text-black">{name}</p>
          <p className="text-xs tracking-wide text-neutral-400 uppercase mt-0.5">
            {role}
          </p>

          <div className="h-px bg-neutral-100 my-4" />

          {role === "admin" ? (
            <a
              href="/admin/dashboard"
              className="flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                  <ShieldCheck size={16} />
                </span>
                <span className="text-sm font-medium text-black">
                  Admin Dashboard
                </span>
              </span>
              <ChevronRight
                size={16}
                className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
              />
            </a>

          ) : role === "driver" ? null : (


            <a
              href="/become-a-partner"
              className="flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center gap-0.5">
                  <Bike size={12} />
                  <Car size={12} />
                </span>
                <span className="text-sm font-medium text-black">
                  Become a Partner
                </span>
              </span>
              <ChevronRight
                size={16}
                className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
              />
            </a>
          )}

                   <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 mt-4 text-sm font-medium text-neutral-700 hover:text-black"
          >
            <LogOut size={16} />
            Logout
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}