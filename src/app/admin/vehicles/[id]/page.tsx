"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Car, IndianRupee, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VehiclePricingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/pricing/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendor) setVendor(data.vendor);
        else setError(data.error ?? "Could not load vendor");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDecision(action: "approve" | "reject") {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success(
        action === "approve"
          ? "Pricing approved — driver is live!"
          : "Pricing rejected",
      );
      router.push("/admin/dashboard");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : !vendor ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                <div className="min-w-0">
                  <h1 className="text-2xl font-black truncate">
                    {vendor.name}
                  </h1>
                  <p className="text-neutral-500 text-sm truncate">
                    {vendor.email}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 self-start sm:self-auto">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                  {vendor.pricing?.vehicleImageUrl ? (
                    <img
                      src={vendor.pricing.vehicleImageUrl}
                      alt="Vehicle"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-neutral-300 text-sm">
                      No image uploaded
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Car size={16} />
                      <h2 className="font-bold">Vehicle Details</h2>
                    </div>
                    <Row label="Vehicle Type" value={vendor.vehicle?.type} />
                    <Row
                      label="Registration Number"
                      value={vendor.vehicle?.numberPlate}
                    />
                    <Row label="Model" value={vendor.vehicle?.model} />
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <IndianRupee size={16} />
                      <h2 className="font-bold">Pricing Configuration</h2>
                    </div>
                    <Row
                      label="Base Fare"
                      value={`₹${vendor.pricing?.baseFare ?? "—"}`}
                    />
                    <Row
                      label="Price per KM"
                      value={`₹${vendor.pricing?.perKm ?? "—"}`}
                    />
                    <Row
                      label="Waiting Charge"
                      value={`₹${vendor.pricing?.waitingCharge ?? "—"}`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ShieldCheck size={16} />
                    <h2 className="font-bold">Admin Decision</h2>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecision("approve")}
                      disabled={processing}
                      className="flex-1 py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {processing ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDecision("reject")}
                      disabled={processing}
                      className="flex-1 py-3.5 rounded-full border border-neutral-200 text-neutral-700 font-semibold hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
