"use client";

import { useState } from "react";
import { User, CreditCard, Landmark, Phone, Check, Pencil } from "lucide-react";

interface BankData {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  mobile: string;
  upi: string;
}

export function BankStep({
  onBack,
  onNext,
  existingBank,
}: {
  onBack: () => void;
  onNext: () => void;
  existingBank?: Partial<BankData> | null;
}) {
  const alreadySaved = !!(
    existingBank?.accountNumber &&
    existingBank?.ifsc &&
    existingBank?.mobile
  );

  const [editing, setEditing] = useState(!alreadySaved);
  const [form, setForm] = useState<BankData>({
    accountHolderName: existingBank?.accountHolderName ?? "",
    accountNumber: existingBank?.accountNumber ?? "",
    ifsc: existingBank?.ifsc ?? "",
    mobile: existingBank?.mobile ?? "",
    upi: existingBank?.upi ?? "",
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

  const missing: string[] = [];
  if (!form.accountHolderName) missing.push("Account holder name");
  if (!form.accountNumber) missing.push("Bank account number");
  if (!form.ifsc) missing.push("IFSC code");
  if (form.mobile.length !== 10) missing.push("Valid 10-digit mobile number");

  const canContinue = missing.length === 0;

  if (!editing) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <button onClick={onBack} className="text-sm text-neutral-400 mb-4">
          ← Back
        </button>
        <p className="text-center text-xs text-neutral-400 mb-1">Step 3 of 3</p>
        <h2 className="text-center text-2xl font-black mb-1">Bank & Payout Setup</h2>
        <p className="text-center text-sm text-neutral-500 mb-4">
          Used for vendor payouts
        </p>

        <div className="flex flex-col items-center gap-1 mb-6">
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Check size={15} />
            Bank details added
          </span>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black underline underline-offset-2"
          >
            <Pencil size={12} />
            Edit details
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <ReadRow label="Account holder name" value={form.accountHolderName} />
          <ReadRow label="Bank account number" value={form.accountNumber} />
          <ReadRow label="IFSC code" value={form.ifsc} />
          <ReadRow label="Mobile number" value={form.mobile} />
          <ReadRow label="UPI ID" value={form.upi || "—"} />
        </div>

        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          Continue →
        </button>
      </div>
    );
  }

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

      {missing.length > 0 && (
        <div className="text-xs text-neutral-500 mb-4">
          <p className="font-medium mb-1">Complete the following to continue:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

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

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}