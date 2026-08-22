"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, CarFront, Bus, ChevronLeft, ChevronRight } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/vehicleTypes";

export function FleetSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [totalDrivers, setTotalDrivers] = useState(0);

  useEffect(() => {
    fetch("/api/drivers/availability")
      .then((res) => res.json())
      .then((data) => {
        setCounts(data.counts);
        setTotalDrivers(data.totalDrivers ?? 0);
      })
      .catch(() => {});
  }, []);

  const categories = [
    {
      badge: "POPULAR",
      icon: Car,
      title: "All Vehicles",
      desc: "Browse the full fleet",
      num: "01",
      count: totalDrivers,
    },
    ...VEHICLE_TYPES.map((v, i) => ({
      badge: ["QUICK", "COMFORT", "PREMIUM", "FAMILY"][i],
      icon: v.icon,
      title: v.label + (v.label.endsWith("s") ? "" : "s"),
      desc: v.desc,
      num: String(i + 2).padStart(2, "0"),
      count: counts?.[v.type] ?? 0,
    })),
  ];

  const activeCategories = counts
    ? Object.values(counts).filter((c) => c > 0).length
    : 0;

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
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="min-w-[220px] flex-shrink-0 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-sm transition-colors"
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
              <p className="text-xs text-neutral-400 mt-2">
                {counts === null ? (
                  <span className="inline-block h-3 w-16 bg-neutral-100 rounded animate-pulse" />
                ) : cat.count > 0 ? (
                  <span className="text-emerald-600 font-medium">
                    {cat.count} driver{cat.count > 1 ? "s" : ""} online
                  </span>
                ) : (
                  "No drivers yet"
                )}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-10 mt-8 pt-6 border-t border-neutral-100"
        >
          <StatItem value={`${activeCategories}+`} label="Categories" delay={0} />
          <StatItem value={`${totalDrivers}+`} label="Total drivers" delay={0.1} />
          <StatItem value="24/7" label="Availability" delay={0.2} />
        </motion.div>
      </div>
    </section>
  );
}

function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "backOut" }}
      className="flex items-baseline gap-2"
    >
      <span className="text-lg font-black text-black">{value}</span>
      <span className="text-sm text-neutral-500">{label}</span>
    </motion.div>
  );
}