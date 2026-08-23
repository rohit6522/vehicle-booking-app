import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-4 py-24">
                <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        > 
          <span className="text-xs tracking-[0.2em] text-neutral-500 font-medium">
            ABOUT US
          </span>
          <h1 className="text-4xl font-black mt-3 mb-6">Moving people, simply.</h1>
          <p className="text-neutral-600 leading-relaxed mb-4">
            RYDEX is a real-time vehicle booking platform built to make everyday
            travel — from a quick bike ride across town to a family trip in a
            van — simple, transparent, and reliable.
          </p>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Every driver on our platform goes through document verification and
            a live video KYC check before they can accept a single ride, so you
            always know who&apos;s behind the wheel. Fares are calculated
            transparently before you book, and you can track your ride live
            from pickup to drop-off.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            We&apos;re just getting started — thanks for riding with us.
          </p>
      </motion.div>
      </main>
      <Footer />
    </>
  );
}