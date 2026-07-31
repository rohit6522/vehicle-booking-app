"use client";

import { motion } from "framer-motion";
import { Bike, Car, Bus, Truck } from "lucide-react";

const VEHICLE_ICONS = [Bike, Car, Bus, Truck];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center px-4">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="absolute top-24 left-1/4 w-40 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-40 left-16 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-24 right-1/3 w-48 h-24 bg-orange-500/10 blur-3xl rounded-full" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-3xl mx-auto pt-20"
      >
        <motion.h1
          variants={item}
          className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]"
        >
          Book Any Vehicle
        </motion.h1>
        <motion.p variants={item} className="mt-5 text-neutral-400 text-base sm:text-lg">
          From daily rides to heavy transport — all in one platform.
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-6 mt-8">
          {VEHICLE_ICONS.map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4, ease: "backOut" }}
            >
              <Icon size={22} className="text-neutral-400" strokeWidth={1.5} />
            </motion.div>
          ))}
        </motion.div>

        <motion.a
          variants={item}
          href="#fleet"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block mt-8 px-10 py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
        >
          Book Now
        </motion.a>
      </motion.div>
    </section>
  );
}