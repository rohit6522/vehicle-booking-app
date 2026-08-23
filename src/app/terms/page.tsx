import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { motion } from "framer-motion";
export default function TermsPage() {
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
            LEGAL
          </span>
          <h1 className="text-4xl font-black mt-3 mb-6">Terms of Service</h1>
          <p className="text-sm text-neutral-400 mb-8">Last updated: {new Date().getFullYear()}</p>

          <div className="space-y-6 text-neutral-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Using RYDEX</h2>
              <p>
                By booking a ride, you agree to provide accurate pickup/drop
                details and to pay the fare shown at the time of booking
                (subject to change if the actual route differs).
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Drivers</h2>
              <p>
                Drivers must complete document verification and video KYC
                before accepting rides, and are responsible for maintaining
                valid licenses and vehicle registration.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Cancellations</h2>
              <p>
                Riders and drivers may cancel a ride before it starts.
                Unaccepted requests automatically expire after 10 minutes.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Liability</h2>
              <p>
                RYDEX connects riders and independent drivers; we are not a
                transportation carrier and are not liable for the conduct of
                drivers or riders during a trip.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}