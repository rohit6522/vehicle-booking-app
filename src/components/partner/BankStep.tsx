"use client";

import { useState } from "react";
import { User, CreditCard, Landmark, Phone } from "lucide-react";

export function BankStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    mobile: "",
    upi: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const canContinue =
    form.accountHolderName && form.accountNumber && form.ifsc && form.mobile.length === 10;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
      <button onClick={onBack} className="text-sm text-neutral-400 mb-4">
        ← Back
      </button>
      <p className="text-center text-xs text-neutral-400 mb-1">Step 3 of 3</p>
      <h2 className="text-center text-2xl font-black mb-1">Bank & Payout Setup</h2>
      <p className="text-center text-sm text-neutral-500 mb-6">
        Used for vendor payouts
      </p>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="As per bank records"
            value={form.accountHolderName}
            onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="relative">
          <CreditCard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Enter account number"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="relative">
          <Landmark size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="HDFC0001234"
            value={form.ifsc}
            onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="relative">
          <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="10 digit mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
            maxLength={10}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <input
          placeholder="UPI ID (optional) — name@upi"
          value={form.upi}
          onChange={(e) => setForm({ ...form, upi: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <p className="text-xs text-neutral-400 mb-4">
        Bank details are verified before first payout. This usually takes 24-48 hours.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Saving..." : "Save & Continue"}
      </button>
    </div>
  );
}