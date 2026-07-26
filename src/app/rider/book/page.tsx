"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bike, Car, CarFront, Bus } from "lucide-react";
import { getSocket } from "@/lib/socketClient";

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 bg-neutral-100 rounded-xl animate-pulse" />
    ),
  },
);

const LiveTrackerMap = dynamic(
  () => import("@/components/map/LiveTrackerMap").then((m) => m.LiveTrackerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-neutral-100 rounded-lg animate-pulse" />
    ),
  },
);

const VEHICLES = [
  { type: "bike", label: "Bike", icon: Bike },
  { type: "car", label: "Car", icon: CarFront },
  { type: "suv", label: "SUV", icon: Car },
  { type: "van", label: "Van", icon: Bus },
] as const;

type VehicleType = (typeof VEHICLES)[number]["type"];

interface Point {
  address: string;
  lat: number | null;
  lng: number | null;
}

export default function BookRidePage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [pickup, setPickup] = useState<Point>({
    address: "",
    lat: null,
    lng: null,
  });
  const [drop, setDrop] = useState<Point>({
    address: "",
    lat: null,
    lng: null,
  });
  const [estimate, setEstimate] = useState<{
    distanceKm: number;
    fare: number;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [ride, setRide] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const coordsReady =
    pickup.lat != null &&
    pickup.lng != null &&
    drop.lat != null &&
    drop.lng != null;

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

  if (ride) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
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
          <p className="text-3xl font-black mb-6">₹{ride.fare.estimated}</p>

          {ride.status === "requested" && (
            <>
              <div className="animate-pulse text-neutral-400 text-sm mb-4">
                Waiting for a nearby {vehicleType} driver to accept…
              </div>
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
              {/* Live map */}
              <div className="rounded-xl overflow-hidden border border-neutral-200">
                {driverLocation ? (
                  <LiveTrackerMap
                    lat={driverLocation.lat}
                    lng={driverLocation.lng}
                  />
                ) : (
                  <div className="h-48 bg-neutral-50 flex items-center justify-center text-sm text-neutral-400">
                    Waiting for driver&apos;s live location…
                  </div>
                )}
              </div>

              {/* Driver details */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-base">{ride.driver?.name}</p>
                  <span className="text-sm text-amber-500 font-medium">
                    ★ {ride.driver?.rating ?? 5}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {ride.driver?.vehicle?.make} {ride.driver?.vehicle?.model}
                  {ride.driver?.vehicle?.color
                    ? ` · ${ride.driver.vehicle.color}`
                    : ""}
                </p>
                <p className="text-sm text-neutral-500">
                  Plate: {ride.driver?.vehicle?.numberPlate}
                </p>

                {ride.driver?.phone && (
                  <p className="text-sm text-neutral-500">
                    Phone: {ride.driver.phone}
                  </p>
                )}
              {ride.status === "accepted" && ride.otpForRider && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-1">
                    Share this OTP with your driver
                  </p>
                  <p className="text-2xl font-black tracking-[0.3em]">
                    {ride.otpForRider}
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {ride.status === "completed" && (
            <div className="mt-2">
              <PaymentSection ride={ride} />
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-1">Book a ride</h1>
        <p className="text-neutral-500 mb-8">Enter your trip details</p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {VEHICLES.map((v) => (
            <button
              key={v.type}
              onClick={() => setVehicleType(v.type)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors ${
                vehicleType === v.type
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              <v.icon size={18} strokeWidth={1.5} />
              {v.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <LocationPicker
            label="Pickup"
            value={pickup}
            onChange={(v) => setPickup(v)}
          />
        </div>

        <div className="mb-6">
          <LocationPicker
            label="Drop"
            value={drop}
            onChange={(v) => setDrop(v)}
          />
        </div>

        {estimate && (
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500">Estimated distance</p>
              <p className="font-semibold">{estimate.distanceKm} km</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Estimated fare</p>
              <p className="font-black text-xl">₹{estimate.fare}</p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleBook}
          disabled={!coordsReady || booking || estimating}
          className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {booking ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
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
      <p className="text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        ✓ Payment successful
      </p>
    );
  }

  if (method === "cash") {
    return (
      <p className="text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        💵 Pay ₹{ride.fare.final ?? ride.fare.estimated} in cash to your driver
      </p>
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
        <button
          onClick={handlePayOnline}
          disabled={loading}
          className="flex-1 py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : `Pay ₹${ride.fare.final ?? ride.fare.estimated}`}
        </button>
        <button
          onClick={handlePayCash}
          disabled={loading}
          className="flex-1 py-3.5 rounded-full border border-neutral-200 font-semibold hover:border-black transition-colors disabled:opacity-40"
        >
          Pay with Cash
        </button>
      </div>
    </div>
  );
}