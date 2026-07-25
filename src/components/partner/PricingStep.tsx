"use client";

import { useState } from "react";
import { ImagePlus, Check } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function PricingStep() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [baseFare, setBaseFare] = useState("");
  const [perKm, setPerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleImage(file: File | null) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseFare: Number(baseFare),
          perKm: Number(perKm),
          waitingCharge: Number(waitingCharge || 0),
          vehicleImageUrl: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = imageUrl && baseFare && perKm;

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Check size={20} />
        </div>
        <h2 className="text-xl font-black mb-1">Pricing submitted</h2>
        <p className="text-sm text-neutral-500">
          Your pricing is now under admin review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
      <h2 className="text-center text-2xl font-black mb-1">Pricing & Vehicle Image</h2>
      <p className="text-center text-sm text-neutral-500 mb-6">
        Set your fare rates and upload a vehicle photo
      </p>

      <label className="block border-2 border-dashed border-neutral-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-neutral-400 mb-4 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
        ) : uploading ? (
          <span className="w-5 h-5 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
        ) : (
          <ImagePlus size={22} className="text-neutral-400" />
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="block text-sm font-medium mb-1.5">Base Fare</label>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₹</span>
        <input
          type="number"
          min="0"
          value={baseFare}
          onChange={(e) => setBaseFare(e.target.value)}
          className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <label className="block text-sm font-medium mb-1.5">Price per KM</label>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₹</span>
        <input
          type="number"
          min="0"
          value={perKm}
          onChange={(e) => setPerKm(e.target.value)}
          className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <label className="block text-sm font-medium mb-1.5">Waiting charge / min</label>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₹</span>
        <input
          type="number"
          min="0"
          value={waitingCharge}
          onChange={(e) => setWaitingCharge(e.target.value)}
          className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Submitting..." : "Submit Pricing"}
      </button>
    </div>
  );
}