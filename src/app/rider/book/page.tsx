"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { VEHICLE_TYPES, VehicleType } from "@/lib/vehicleTypes";
import { getSocket } from "@/lib/socketClient";

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 bg-neutral-100 rounded-xl animate-pulse" /> }
);

const LiveTrackerMap = dynamic(
  () => import("@/components/map/LiveTrackerMap").then((m) => m.LiveTrackerMap),
  { ssr: false, loading: () => <div className="h-48 bg-neutral-100 rounded-lg animate-pulse" /> }
);

interface Point {
  address: string;
  lat: number | null;
  lng: number | null;
}

export default function BookRidePage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [pickup, setPickup] = useState<Point>({ address: "", lat: null, lng: null });
  const [drop, setDrop] = useState<Point>({ address: "", lat: null, lng: null });
  const [estimate, setEstimate] = useState<{ distanceKm: number; fare: number } | null>(
    null
  );
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [ride, setRide] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [availability, setAvailability] = useState<Record<string, number> | null>(null);

  const coordsReady =
    pickup.lat != null && pickup.lng != null && drop.lat != null && drop.lng != null;

  useEffect(() => {
    fetch("/api/drivers/availability")
      .then((res) => res.json())
      .then((data) => setAvailability(data.counts))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/rides/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.ride) setRide(data.ride);
      });
  }, []);

  const getEstimate = useCallback(async () => {
    if (!coordsReady) return;
    setEstimating(true);
    setError("");
    try {
      const res = await fetch("/api/rides/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { lat: pickup.lat, lng: pickup.lng },
          drop: { lat: drop.lat, lng: drop.lng },
          vehicleType,
        }),
      });
      const data = await res.json();
      if (res.ok) setEstimate(data);
    } finally {
      setEstimating(false);
    }
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng, vehicleType, coordsReady]);

  useEffect(() => {
    if (coordsReady) getEstimate();
  }, [getEstimate, coordsReady]);

  async function handleBook() {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          pickup: { address: pickup.address, lat: pickup.lat, lng: pickup.lng },
          drop: { address: drop.address, lat: drop.lat, lng: drop.lng },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not book ride");
        return;
      }
      setRide(data.ride);
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel() {
    if (!ride?._id) return;
    await fetch(`/api/rides/${ride._id}/cancel`, { method: "POST" });
    setRide(null);
  }

  useEffect(() => {
    if (!ride?._id) return;

    const socket = getSocket();
    socket.emit("ride:join", ride._id);

    function handleUpdate({ ride: updatedRide }: { ride: any }) {
      setRide(updatedRide);
    }
    function handleLocation({ lat, lng }: { lat: number; lng: number }) {
      setDriverLocation({ lat, lng });
    }

    socket.on("ride:update", handleUpdate);
    socket.on("driver:location", handleLocation);

    return () => {
      socket.emit("ride:leave", ride._id);
      socket.off("ride:update", handleUpdate);
      socket.off("driver:location", handleLocation);
    };
  }, [ride?._id]);

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <AnimatePresence mode="wait">
        {ride ? (
          <motion.div
            key={ride.status}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md mx-auto text-center"
          >
            <h1 className="text-2xl font-black mb-2">
              {ride.status === "requested" && "Looking for a driver..."}
              {ride.status === "accepted" && "Driver on the way!"}
              {ride.status === "ongoing" && "Ride in progress"}
              {ride.status === "completed" && "Ride completed"}
              {ride.status === "cancelled" && "Ride cancelled"}
            </h1>
            <p className="text-neutral-500 mb-6">
              {ride.pickup.address} → {ride.drop.address}
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
              className="text-3xl font-black mb-6"
            >
              ₹{ride.fare.estimated}
            </motion.p>

            {ride.status === "requested" && (
              <>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="text-neutral-400 text-sm mb-4"
                >
                  Waiting for a nearby {vehicleType} driver to accept…
                </motion.div>
                <button
                  onClick={handleCancel}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Cancel Ride
                </button>
              </>
            )}

            {(ride.status === "accepted" || ride.status === "ongoing") && (
              <div className="text-left space-y-4">
                <div className="rounded-xl overflow-hidden border border-neutral-200">
                  {driverLocation ? (
                    <LiveTrackerMap lat={driverLocation.lat} lng={driverLocation.lng} />
                  ) : (
                    <div className="h-48 bg-neutral-50 flex items-center justify-center text-sm text-neutral-400">
                      Waiting for driver&apos;s live location…
                    </div>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="bg-neutral-50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-base">{ride.driver?.name}</p>
                    <span className="text-sm text-amber-500 font-medium">
                      ★ {ride.driver?.rating ?? 5}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {ride.driver?.vehicle?.make} {ride.driver?.vehicle?.model}
                    {ride.driver?.vehicle?.color ? ` · ${ride.driver.vehicle.color}` : ""}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Plate: {ride.driver?.vehicle?.numberPlate}
                  </p>
                  {ride.driver?.phone && (
                    <p className="text-sm text-neutral-500">Phone: {ride.driver.phone}</p>
                  )}

                  {ride.status === "accepted" && ride.otpForRider && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
                      className="mt-3 pt-3 border-t border-neutral-200"
                    >
                      <p className="text-xs text-neutral-400 mb-1">
                        Share this OTP with your driver
                      </p>
                      <p className="text-2xl font-black tracking-[0.3em]">
                        {ride.otpForRider}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}

            {ride.status === "completed" && (
              <div className="mt-2 space-y-4">
                <PaymentSection ride={ride} />
                {!ride.rating?.score && <RatingSection rideId={ride._id} />}
                <button
                  onClick={() => setRide(null)}
                  className="w-full py-3 rounded-full border border-neutral-200 font-medium hover:border-black transition-colors"
                >
                  Done — Book Another Ride
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-3xl font-black mb-1">Book a ride</h1>
            <p className="text-neutral-500 mb-8">Enter your trip details</p>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {VEHICLE_TYPES.map((v) => (
                <motion.button
                  key={v.type}
                  onClick={() => setVehicleType(v.type)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors ${
                    vehicleType === v.type
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  <v.icon size={18} strokeWidth={1.5} />
                  {v.label}
                  <span className="text-[10px] opacity-70">
                    {v.seats} seat{v.seats > 1 ? "s" : ""}
                  </span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {availability && availability[vehicleType] === 0 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 overflow-hidden"
                >
                  ⚠️ No {vehicleType} drivers available right now.{" "}
                  {VEHICLE_TYPES.find((v) => availability[v.type] > 0)
                    ? `Try ${VEHICLE_TYPES.find((v) => availability[v.type] > 0)!.label} instead.`
                    : "Please check back later."}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="mb-6" />

            <div className="mb-5">
              <LocationPicker label="Pickup" value={pickup} onChange={(v) => setPickup(v)} />
            </div>

            <div className="mb-6">
              <LocationPicker label="Drop" value={drop} onChange={(v) => setDrop(v)} />
            </div>

            <AnimatePresence>
              {estimate && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-neutral-50 rounded-xl p-4 mb-6 flex items-center justify-between overflow-hidden"
                >
                  <div>
                    <p className="text-xs text-neutral-500">Estimated distance</p>
                    <p className="font-semibold">{estimate.distanceKm} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Estimated fare</p>
                    <p className="font-black text-xl">₹{estimate.fare}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4 overflow-hidden"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleBook}
              disabled={!coordsReady || booking || estimating}
              whileHover={coordsReady ? { scale: 1.02 } : {}}
              whileTap={coordsReady ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PaymentSection({ ride }: { ride: any }) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(ride.paymentStatus === "paid");
  const [method, setMethod] = useState<"cash" | "online" | null>(ride.paymentMethod ?? null);
  const [error, setError] = useState("");

  async function handlePayOnline() {
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch(`/api/rides/${ride._id}/create-order`, {
        method: "POST",
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error ?? "Could not start payment");
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: "INR",
          name: "RYDEX",
          description: `${ride.pickup.address} → ${ride.drop.address}`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch(`/api/rides/${ride._id}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (verifyRes.ok) setPaid(true);
            else setError("Payment succeeded but verification failed. Contact support.");
          },
          theme: { color: "#000000" },
        });
        rzp.open();
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function handlePayCash() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rides/${ride._id}/pay-cash`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setMethod("cash");
    } finally {
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
      >
        ✓ Payment successful
      </motion.p>
    );
  }

  if (method === "cash") {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
      >
        💵 Pay ₹{ride.fare.final ?? ride.fare.estimated} in cash to your driver
      </motion.p>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <motion.button
          onClick={handlePayOnline}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : `Pay ₹${ride.fare.final ?? ride.fare.estimated}`}
        </motion.button>
        <motion.button
          onClick={handlePayCash}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 rounded-full border border-neutral-200 font-semibold hover:border-black transition-colors disabled:opacity-40"
        >
          Pay with Cash
        </motion.button>
      </div>
    </div>
  );
}

function RatingSection({ rideId }: { rideId: string }) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (score === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rides/${rideId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment: comment.trim() || undefined }),
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

  if (submitted) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="text-sm text-neutral-500 bg-neutral-50 rounded-xl px-4 py-3"
      >
        Thanks for rating your driver! 🙌
      </motion.p>
    );
  }

  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <p className="text-sm font-medium mb-3">Rate your driver</p>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            onClick={() => setScore(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            whileTap={{ scale: 1.3 }}
            className="text-2xl leading-none"
          >
            {n <= (hovered || score) ? "★" : "☆"}
          </motion.button>
        ))}
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm resize-none focus:outline-none focus:border-black mb-3"
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <motion.button
        onClick={handleSubmit}
        disabled={score === 0 || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </motion.button>
    </div>
  );
}