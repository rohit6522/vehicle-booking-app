"use client";

import { useState, useEffect, useCallback } from "react";
import { Bike, Car, CarFront, Bus, Navigation } from "lucide-react";

const VEHICLES = [
  { type: "bike", label: "Bike", icon: Bike },
  { type: "car", label: "Car", icon: CarFront },
  { type: "suv", label: "SUV", icon: Car },
  { type: "van", label: "Van", icon: Bus },
] as const;

type VehicleType = (typeof VEHICLES)[number]["type"];

interface Point {
  address: string;
  lat: string;
  lng: string;
}

export default function BookRidePage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [pickup, setPickup] = useState<Point>({ address: "", lat: "", lng: "" });
  const [drop, setDrop] = useState<Point>({ address: "", lat: "", lng: "" });
  const [estimate, setEstimate] = useState<{ distanceKm: number; fare: number } | null>(
    null
  );
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [ride, setRide] = useState<any>(null);

  const coordsReady =
    pickup.lat && pickup.lng && drop.lat && drop.lng && pickup.address && drop.address;

  const getEstimate = useCallback(async () => {
    if (!pickup.lat || !pickup.lng || !drop.lat || !drop.lng) return;
    setEstimating(true);
    setError("");
    try {
      const res = await fetch("/api/rides/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { lat: parseFloat(pickup.lat), lng: parseFloat(pickup.lng) },
          drop: { lat: parseFloat(drop.lat), lng: parseFloat(drop.lng) },
          vehicleType,
        }),
      });
      const data = await res.json();
      if (res.ok) setEstimate(data);
    } finally {
      setEstimating(false);
    }
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng, vehicleType]);

  useEffect(() => {
    if (pickup.lat && pickup.lng && drop.lat && drop.lng) getEstimate();
  }, [getEstimate, pickup.lat, pickup.lng, drop.lat, drop.lng]);

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPickup((p) => ({
        ...p,
        address: p.address || "Current location",
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString(),
      }));
    });
  }

  async function handleBook() {
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          pickup: {
            address: pickup.address,
            lat: parseFloat(pickup.lat),
            lng: parseFloat(pickup.lng),
          },
          drop: {
            address: drop.address,
            lat: parseFloat(drop.lat),
            lng: parseFloat(drop.lng),
          },
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

  // Poll ride status until a driver accepts (or it's cancelled)
  useEffect(() => {
    if (!ride || ride.status !== "requested") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/rides/${ride._id}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data.ride);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [ride]);

  if (ride) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-black mb-2">
            {ride.status === "requested" && "Looking for a driver..."}
            {ride.status === "accepted" && "Driver on the way!"}
            {ride.status === "cancelled" && "Ride cancelled"}
          </h1>
          <p className="text-neutral-500 mb-6">
            {ride.pickup.address} → {ride.drop.address}
          </p>
          <p className="text-3xl font-black mb-6">₹{ride.fare.estimated}</p>
          {ride.status === "requested" && (
            <div className="animate-pulse text-neutral-400 text-sm">
              Waiting for a nearby {vehicleType} driver to accept…
            </div>
          )}
          {ride.status === "accepted" && (
            <p className="text-emerald-600 font-medium">
              Driver assigned. (Live tracking arrives in Phase 3.)
            </p>
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

        {/* Vehicle type */}
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

        {/* Pickup */}
        <label className="block text-sm font-medium mb-1.5">Pickup</label>
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Address"
            value={pickup.address}
            onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
            className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <button
            onClick={useMyLocation}
            title="Use my current location"
            className="w-11 flex items-center justify-center rounded-lg border border-neutral-200 hover:border-black"
          >
            <Navigation size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <input
            placeholder="Latitude"
            value={pickup.lat}
            onChange={(e) => setPickup({ ...pickup, lat: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <input
            placeholder="Longitude"
            value={pickup.lng}
            onChange={(e) => setPickup({ ...pickup, lng: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Drop */}
        <label className="block text-sm font-medium mb-1.5">Drop</label>
        <input
          placeholder="Address"
          value={drop.address}
          onChange={(e) => setDrop({ ...drop, address: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm mb-3 focus:outline-none focus:border-black"
        />
        <div className="grid grid-cols-2 gap-2 mb-6">
          <input
            placeholder="Latitude"
            value={drop.lat}
            onChange={(e) => setDrop({ ...drop, lat: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
          <input
            placeholder="Longitude"
            value={drop.lng}
            onChange={(e) => setDrop({ ...drop, lng: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <p className="text-xs text-neutral-400 mb-6">
          Address-search / map picking arrives in Phase 4 — for now, paste
          coordinates (e.g. from Google Maps: right-click a point → click the
          lat/lng shown).
        </p>

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