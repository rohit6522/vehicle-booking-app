"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Navigation2 } from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
export default function DriverRequestsPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [otp, setOtp] = useState("");
  const [startingRide, setStartingRide] = useState(false);
const [confirmingCash, setConfirmingCash] = useState(false);

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
    if (activeRide) return; // no need to poll for new requests while on a ride
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, [fetchRides, activeRide]);

  // On page load/refresh, check the server for an already-active ride
  // (e.g. accepted in a previous session) instead of assuming there's none.
  useEffect(() => {
    fetch("/api/rides/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.ride) setActiveRide(data.ride);
      });
  }, []);

async function handleAccept(id: string) {
    setAcceptingId(id);
    try {
      const res = await fetch(`/api/rides/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not accept ride");
        toast.error(data.error ?? "Could not accept ride");
        await fetchRides();
        return;
      }
      toast.success("Ride accepted!");
      setActiveRide(data.ride);
      setRides([]);
    } finally {
      setAcceptingId(null);
    }
  }

 async function handleStartRide() {
    if (!activeRide || otp.length !== 4) return;
    setStartingRide(true);
    setError("");
    try {
      const res = await fetch(`/api/rides/${activeRide._id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start ride");
        toast.error(data.error ?? "Could not start ride");
        return;
      }
      toast.success("Ride started!");
      setActiveRide(data.ride);
    } finally {
      setStartingRide(false);
    }
  }

 

  async function handleComplete() {
    if (!activeRide) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/rides/${activeRide._id}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not complete ride");
        toast.error(data.error ?? "Could not complete ride");
        return;
      }
      toast.success("Ride marked as completed");
      setActiveRide(data.ride);
    } finally {
      setCompleting(false);
    }
  }


 async function handleConfirmCash() {
    if (!activeRide) return;
    setConfirmingCash(true);
    try {
      const res = await fetch(`/api/rides/${activeRide._id}/confirm-cash`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Cash payment confirmed");
        setActiveRide(null);
      } else {
        toast.error("Could not confirm cash payment");
      }
    } finally {
      setConfirmingCash(false);
    }
  }

  async function handleCancel() {
    if (!activeRide) return;
    setCompleting(true);
    try {
      await fetch(`/api/rides/${activeRide._id}/cancel`, { method: "POST" });
      setActiveRide(null);
    } finally {
      setCompleting(false);
    }
  }

  // While there's an active ride, join its room and stream live GPS location.
  useEffect(() => {
    if (!activeRide?._id) return;

    const socket = getSocket();
    socket.emit("ride:join", activeRide._id);

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          socket.emit("driver:location", {
            rideId: activeRide._id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    }

    return () => {
      socket.emit("ride:leave", activeRide._id);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeRide?._id]);

  if (activeRide) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-black mb-1">Active ride</h1>
          <p className="text-neutral-500 mb-6">
            Sharing your live location with the rider.
          </p>

          <div className="border border-neutral-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={14} className="mt-0.5 text-neutral-400" />
              <p className="text-sm">{activeRide.pickup.address}</p>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <Navigation2 size={14} className="mt-0.5 text-neutral-400" />
              <p className="text-sm">{activeRide.drop.address}</p>
            </div>
            <p className="font-black text-xl">₹{activeRide.fare.estimated}</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {activeRide.status === "accepted" ? (
            <>
              <label className="block text-sm font-medium mb-2">
                Ask the rider for their 4-digit OTP to start the ride
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="w-full px-4 py-3 rounded-full border border-neutral-200 text-center text-xl tracking-[0.4em] font-semibold mb-4 focus:outline-none focus:border-black"
              />
              <button
                onClick={handleStartRide}
                disabled={otp.length !== 4 || startingRide}
                className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40 mb-3"
              >
                {startingRide ? "Verifying..." : "Start Ride"}
              </button>
              <button
                onClick={handleCancel}
                disabled={completing}
                className="w-full py-3 rounded-full border border-neutral-200 text-red-500 font-medium hover:border-red-300 transition-colors disabled:opacity-40"
              >
                Cancel Ride
              </button>
            </>
         ) : activeRide.status === "completed" ? (
            <div className="space-y-3">
              {activeRide.paymentStatus === "paid" ? (
                <p className="text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                  ✓ Ride paid
                </p>
              ) : activeRide.paymentMethod === "cash" ? (
                <button
                  onClick={handleConfirmCash}
                  disabled={confirmingCash}
                  className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
                >
                  {confirmingCash ? "Confirming..." : "Confirm Cash Received"}
                </button>
              ) : (
                <p className="text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-center text-sm">
                  Waiting for rider to choose a payment method…
                </p>
              )}
            </div>
          ) : (


            <div className="space-y-3">
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
              >
                {completing ? "Completing..." : "Mark Ride Completed"}
              </button>
              <button
                onClick={handleCancel}
                disabled={completing}
                className="w-full py-3 rounded-full border border-neutral-200 text-red-500 font-medium hover:border-red-300 transition-colors disabled:opacity-40"
              >
                Cancel Ride
              </button>
            </div>
          )}
          
        </div>
      </main>
    );
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
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-neutral-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rides.length === 0 ? (
          <p className="text-neutral-400 text-sm">
            No ride requests right now. This list refreshes every few seconds.
          </p>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
             <div
                key={ride._id}
                className="border border-neutral-200 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1.5">
                      <MapPin size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                      <p className="text-sm break-words">{ride.pickup.address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation2 size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                      <p className="text-sm break-words">{ride.drop.address}</p>
                    </div>
                  </div>
                  <p className="font-black text-lg flex-shrink-0">₹{ride.fare.estimated}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-neutral-400">
                    {ride.distanceKm} km · {ride.rider?.name ?? "Rider"}
                  </p>
                  <button
                    onClick={() => handleAccept(ride._id)}
                    disabled={acceptingId === ride._id}
                    className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
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
