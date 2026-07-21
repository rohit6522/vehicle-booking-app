"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bike, Car, CarFront, Truck } from "lucide-react";

const VEHICLE_TYPES = [
  { type: "bike", label: "Bike", icon: Bike },
  { type: "auto", label: "Auto", icon: CarFront },
  { type: "car", label: "Car", icon: Car },
  { type: "premium", label: "Premium", icon: Truck },
] as const;

export default function BecomePartnerPage() {
  const router = useRouter();
  const { status } = useSession();
  const [vehicleType, setVehicleType] = useState<(typeof VEHICLE_TYPES)[number]["type"]>("car");
  const [form, setForm] = useState({ make: "", model: "", numberPlate: "", color: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Login required</h1>
          <p className="text-neutral-500">Please log in first to apply as a partner.</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/partner/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleType, ...form }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2">You&apos;re a partner now 🎉</h1>
          <p className="text-neutral-500">Redirecting you home...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-1">Become a Partner</h1>
        <p className="text-neutral-500 mb-8">
          Add your vehicle details to start accepting rides.
        </p>

        <label className="block text-sm font-medium mb-2">Vehicle type</label>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {VEHICLE_TYPES.map((v) => (
            <button
              key={v.type}
              type="button"
              onClick={() => setVehicleType(v.type)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors ${
                vehicleType === v.type
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              <v.icon size={18} strokeWidth={1.5} />
              {v.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Make (e.g. Honda)"
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <input
            required
            placeholder="Model (e.g. Activa)"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <input
            required
            placeholder="Number plate"
            value={form.numberPlate}
            onChange={(e) => setForm({ ...form, numberPlate: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <input
            required
            placeholder="Color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <p className="text-xs text-neutral-400 mt-4">
          Note: video KYC verification (Phase 5) will be required before your
          account can accept live ride requests.
        </p>
      </div>
    </main>
  );
}