"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation2 } from "lucide-react";

export default function DriverRequestsPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async () => {
    const res = await fetch("/api/rides/available");
    const data = await res.json();
    if (res.ok) {
      setRides(data.rides);
      setError("");
    } else {
      setError(data.error ?? "Could not load ride requests");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, [fetchRides]);

  async function handleAccept(id: string) {
    setAcceptingId(id);
    try {
      const res = await fetch(`/api/rides/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not accept ride");
        await fetchRides();
        return;
      }
      // Remove accepted ride from the list immediately
      setRides((prev) => prev.filter((r) => r._id !== id));
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-black mb-1">Ride requests</h1>
        <p className="text-neutral-500 mb-8">
          New requests matching your vehicle type appear here automatically.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading...</p>
        ) : rides.length === 0 ? (
          <p className="text-neutral-400 text-sm">
            No ride requests right now. This list refreshes every few seconds.
          </p>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="border border-neutral-200 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1.5">
                      <MapPin size={14} className="mt-0.5 text-neutral-400" />
                      <p className="text-sm">{ride.pickup.address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation2 size={14} className="mt-0.5 text-neutral-400" />
                      <p className="text-sm">{ride.drop.address}</p>
                    </div>
                  </div>
                  <p className="font-black text-lg">₹{ride.fare.estimated}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-400">
                    {ride.distanceKm} km · {ride.rider?.name ?? "Rider"}
                  </p>
                  <button
                    onClick={() => handleAccept(ride._id)}
                    disabled={acceptingId === ride._id}
                    className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {acceptingId === ride._id ? "Accepting..." : "Accept"}
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