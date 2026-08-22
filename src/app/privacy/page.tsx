import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-4 py-24">
        <div className="max-w-2xl mx-auto prose prose-neutral">
          <span className="text-xs tracking-[0.2em] text-neutral-500 font-medium">
            LEGAL
          </span>
          <h1 className="text-4xl font-black mt-3 mb-6">Privacy Policy</h1>
          <p className="text-sm text-neutral-400 mb-8">Last updated: {new Date().getFullYear()}</p>

          <div className="space-y-6 text-neutral-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-black mb-2">What we collect</h2>
              <p>
                We collect your name, email, phone number, and location data
                (pickup/drop points, live location during an active ride) to
                provide the booking service. Drivers additionally provide
                vehicle and identity documents for verification.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">How we use it</h2>
              <p>
                Your data is used to match you with drivers, calculate fares,
                process payments, and improve the platform. We do not sell
                your personal data to third parties.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Payments</h2>
              <p>
                Online payments are processed by Razorpay; we do not store
                your card or UPI details on our servers.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-black mb-2">Contact</h2>
              <p>
                Questions about this policy? Reach us at{" "}
                <a href="/contact" className="underline">
                  our contact page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}