"use client";

import { useState } from "react";
import { Bike, Car, CarFront, Package, Truck } from "lucide-react";

const VEHICLE_TYPES = [
  { type: "bike", label: "Bike", desc: "2 wheeler", icon: Bike },
  { type: "auto", label: "Auto", desc: "3 wheeler ride", icon: CarFront },
  { type: "car", label: "Car", desc: "4 wheeler ride", icon: Car },
  { type: "premium", label: "Premium", desc: "Premium ride", icon: Truck },
] as const;

export function VehicleStep({
  onNext,
}: {
  onNext: () => void;
}) {
  const [vehicleType, setVehicleType] = useState<(typeof VEHICLE_TYPES)[number]["type"]>("bike");
  const [numberPlate, setNumberPlate] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleType, numberPlate, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onNext();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
      <p className="text-center text-xs text-neutral-400 mb-1">Step 1 of 3</p>
      <h2 className="text-center text-2xl font-black mb-1">Vehicle Details</h2>
      <p className="text-center text-sm text-neutral-500 mb-6">
        Add your vehicle information
      </p>

      <label className="block text-sm font-medium mb-2">Vehicle type</label>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {VEHICLE_TYPES.map((v) => (
          <button
            key={v.type}
            onClick={() => setVehicleType(v.type)}
            className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border text-xs transition-colors ${
              vehicleType === v.type
                ? "border-black bg-black text-white"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            <v.icon size={18} strokeWidth={1.5} />
            <span className="font-semibold">{v.label}</span>
            <span className="opacity-70">{v.desc}</span>
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium mb-1.5">Vehicle number</label>
      <input
        placeholder="MH12AB1234"
        value={numberPlate}
        onChange={(e) => setNumberPlate(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm mb-4 focus:outline-none focus:border-black"
      />

      <label className="block text-sm font-medium mb-1.5">Vehicle model / capacity</label>
      <input
        placeholder="Honda Activa"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm mb-4 focus:outline-none focus:border-black"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!numberPlate || !model || loading}
        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Saving..." : "Continue →"}
      </button>
    </div>
  );
}