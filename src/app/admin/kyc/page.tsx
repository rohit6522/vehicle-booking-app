"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { VideoCallRoom } from "@/components/kyc/VideoCallRoom";
import { Video, Check, X } from "lucide-react";

export default function AdminKycPage() {
  const { data: session } = useSession();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchDrivers = useCallback(async () => {
    const res = await fetch("/api/admin/kyc");
    const data = await res.json();
    if (res.ok) {
      setDrivers(data.drivers);
      setError("");
    } else {
      setError(data.error ?? "Could not load drivers");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  async function handleReview(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActiveCallId(null);
        await fetchDrivers();
      }
    } finally {
      setProcessingId(null);
    }
  }

  const adminId = (session?.user as any)?.id;
  const adminName = session?.user?.name ?? "Admin";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black mb-1">Video KYC review</h1>
          <p className="text-neutral-500 mb-8">
            Join a driver&apos;s call to verify their identity live.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {activeCallId ? (
            <div>
              <VideoCallRoom
                roomId={`kyc-${activeCallId}`}
                userId={adminId}
                userName={adminName}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleReview(activeCallId, "approve")}
                  disabled={processingId === activeCallId}
                  className="flex-1 py-3 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => handleReview(activeCallId, "reject")}
                  disabled={processingId === activeCallId}
                  className="flex-1 py-3 rounded-full border border-neutral-200 text-neutral-700 font-semibold hover:border-red-400 hover:text-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
              </div>
              <button
                onClick={() => setActiveCallId(null)}
                className="w-full mt-3 text-sm text-neutral-400"
              >
                ← Back to list
              </button>
            </div>
          ) : loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : drivers.length === 0 ? (
            <p className="text-neutral-400 text-sm">No drivers awaiting KYC.</p>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div
                  key={driver._id}
                  className="border border-neutral-200 rounded-2xl p-5 flex items-center justify-between bg-white"
                >
                  <div>
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-sm text-neutral-500">{driver.email}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {driver.vehicle?.type} · {driver.vehicle?.model}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveCallId(driver._id)}
                    className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <Video size={14} />
                    Join Call
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}