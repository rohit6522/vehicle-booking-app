"use client";

import { Bike, Car, Bus, Truck } from "lucide-react";

const VEHICLE_ICONS = [Bike, Car, Bus, Truck];

export function Hero() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden -mt-[76px] flex items-center justify-center px-4">
      {/* Faint map-like background texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Soft decorative blobs, echoing the reference's colored map pins */}
      <div className="absolute top-24 left-1/4 w-40 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-40 left-16 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-24 right-1/3 w-48 h-24 bg-orange-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 text-center max-w-3xl mx-auto pt-20">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]">
          Book Any Vehicle
        </h1>
        <p className="mt-5 text-neutral-400 text-base sm:text-lg">
          From daily rides to heavy transport — all in one platform.
        </p>

        <div className="flex items-center justify-center gap-6 mt-8">
          {VEHICLE_ICONS.map((Icon, i) => (
            <Icon
              key={i}
              size={22}
              className="text-neutral-400"
              strokeWidth={1.5}
            />
          ))}
        </div>
        <a
          href="#fleet"
          className="inline-block mt-8 px-10 py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
        >
          Book Now
        </a>
      </div>
    </section>
  );
}
