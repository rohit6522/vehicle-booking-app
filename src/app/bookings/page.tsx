"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { MapPin, Navigation2 } from "lucide-react";
import { generateReceipt } from "@/lib/generateReceipt";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-neutral-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : rides.length === 0 ? (
            <p className="text-neutral-400 text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className="border border-neutral-200 rounded-2xl p-5"
                >
                 <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1.5">
                        <MapPin size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                        <p className="text-sm break-words">{ride.pickup?.address}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation2 size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                        <p className="text-sm break-words">{ride.drop?.address}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                        STATUS_STYLES[ride.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm text-neutral-400">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                      <p className="text-xs text-neutral-400">
                        Payment:{" "}
                        {ride.paymentStatus === "paid"
                          ? `Paid (${ride.paymentMethod === "cash" ? "Cash" : "Online"})`
                          : "Pending"}
                      </p>
                      <div className="flex items-center gap-2">
                        {role !== "driver" && (
                          <button
                            onClick={() => generateReceipt(ride)}
                            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black"
                          >
                            <Download size={12} />
                            Receipt
                          </button>
                        )}
                        {role === "driver" &&
                          ride.paymentMethod === "cash" &&
                          ride.paymentStatus !== "paid" && (
                            <ConfirmCashButton
                              rideId={ride._id}
                              onConfirmed={() =>
                                setRides((prev) =>
                                  prev.map((r) =>
                                    r._id === ride._id ? { ...r, paymentStatus: "paid" } : r
                                  )
                                )
                              }
                            />
                          )}
                      </div>
                    </div>
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


function ConfirmCashButton({
  rideId,
  onConfirmed,
}: {
  rideId: string;
  onConfirmed: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/confirm-cash`, { method: "POST" });
      if (res.ok) onConfirmed();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {loading ? "Confirming..." : "Confirm Cash Received"}
    </button>
  );
}