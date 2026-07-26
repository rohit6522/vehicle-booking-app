"use client";

import { useRef } from "react";

import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/vehicleTypes";

const CATEGORIES = [
  {
    badge: "POPULAR",
    icon: Car,
    title: "All Vehicles",
    desc: "Browse the full fleet",
    num: "01",
    seats: null,
  },
  ...VEHICLE_TYPES.map((v, i) => ({
    badge: ["QUICK", "COMFORT", "PREMIUM", "FAMILY"][i],
    icon: v.icon,
    title: v.label + (v.label.endsWith("s") ? "" : "s"),
    desc: v.desc,
    num: String(i + 2).padStart(2, "0"),
    seats: v.seats,
  })),
];

const STATS = [
  { value: "6+", label: "Categories" },
  { value: "50+", label: "Vehicle types" },
  { value: "24/7", label: "Availability" },
];

export function FleetSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    scrollerRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  return (
    <section id="fleet" className="bg-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-4 h-px bg-black" />
              <span className="text-xs tracking-[0.2em] text-neutral-500 font-medium">
                FLEET
              </span>
            </div>
            <h2 className="text-4xl font-black text-black leading-tight">
              Vehicle
              <br />
              <span className="underline decoration-2 underline-offset-4">
                Categories
              </span>
            </h2>
            <p className="text-neutral-500 mt-3">
              Choose the ride that fits your journey
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:border-black hover:text-black transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="min-w-[220px] flex-shrink-0 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] tracking-wide font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  {cat.badge}
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">
                  {cat.num}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
                <cat.icon size={20} className="text-black" strokeWidth={1.5} />
              </div>

              <h3 className="font-bold text-black">{cat.title}</h3>
              <p className="text-sm text-neutral-500 mt-1">{cat.desc}</p>
              {cat.seats && (
                <p className="text-xs text-neutral-400 mt-1">
                  {cat.seats} seat{cat.seats > 1 ? "s" : ""}
                </p>
              )}


            </div>

          ))}
        </div>

        <div className="flex items-center gap-10 mt-8 pt-6 border-t border-neutral-100">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="text-lg font-black text-black">{stat.value}</span>
              <span className="text-sm text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}