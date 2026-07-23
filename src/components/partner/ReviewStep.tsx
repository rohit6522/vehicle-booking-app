"use client";

import { useState } from "react";

export function ReviewStep({
  onBack,
  onSubmitted,
}: {
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/submit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onSubmitted();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
      <button onClick={onBack} className="text-sm text-neutral-400 mb-4 float-left">
        ← Back
      </button>
      <div className="clear-both" />
      <p className="text-center text-xs text-neutral-400 mb-1">Final step</p>
      <h2 className="text-2xl font-black mb-1">Ready to submit</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Your vehicle, documents, and bank details have been saved. Submit your
        application for our team to review.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  );
}