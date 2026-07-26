"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { MapPin, Navigation2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-50 text-amber-600",
  accepted: "bg-blue-50 text-blue-600",
  ongoing: "bg-blue-50 text-blue-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-500",
};

export default function BookingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/rides")
      .then((res) => res.json())
      .then((data) => setRides(data.rides ?? []))
      .finally(() => setLoading(false));
  }, [sessionStatus]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black mb-1">My Bookings</h1>
          <p className="text-neutral-500 mb-8">
            {role === "driver" ? "Your ride history as a driver" : "Your past and current rides"}
          </p>

          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : rides.length === 0 ? (
            <p className="text-neutral-400 text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className="border border-neutral-200 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1.5">
                        <MapPin size={14} className="mt-0.5 text-neutral-400" />
                        <p className="text-sm">{ride.pickup?.address}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation2 size={14} className="mt-0.5 text-neutral-400" />
                        <p className="text-sm">{ride.drop?.address}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLES[ride.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-400">
                    <span>
                      {new Date(ride.requestedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {ride.vehicleType} · {ride.distanceKm} km
                    </span>
                    <span className="font-bold text-black">
                      ₹{ride.fare?.final ?? ride.fare?.estimated}
                    </span>
                  </div>

                  {ride.status === "completed" && (
                    <p className="text-xs text-neutral-400 mt-2">
                      Payment:{" "}
                      {ride.paymentStatus === "paid"
                        ? `Paid (${ride.paymentMethod === "cash" ? "Cash" : "Online"})`
                        : "Pending"}
                    </p>
                  )}
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