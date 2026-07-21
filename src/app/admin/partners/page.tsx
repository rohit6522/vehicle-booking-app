"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";

export default function AdminPartnersPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    const res = await fetch("/api/admin/partners");
    const data = await res.json();
    if (res.ok) {
      setApplications(data.applications);
      setError("");
    } else {
      setError(data.error ?? "Could not load applications");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleReview(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update application");
        return;
      }
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-1">Partner applications</h1>
        <p className="text-neutral-500 mb-8">
          Review and approve drivers who applied to become partners.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-neutral-400 text-sm">No pending applications.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="border border-neutral-200 rounded-2xl p-5 flex items-start justify-between"
              >
                <div>
                  <p className="font-bold">{app.name}</p>
                  <p className="text-sm text-neutral-500">{app.email}</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    {app.vehicle?.type} · {app.vehicle?.make} {app.vehicle?.model} ·{" "}
                    {app.vehicle?.color}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Plate: {app.vehicle?.numberPlate}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(app._id, "approve")}
                    disabled={processingId === app._id}
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-50"
                    title="Approve"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleReview(app._id, "reject")}
                    disabled={processingId === app._id}
                    className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-600 flex items-center justify-center hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}