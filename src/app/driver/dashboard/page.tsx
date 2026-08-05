"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MapPin, Navigation2, Inbox, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function DriverDashboardPage() {
  const { data: session } = useSession();
  const [activeRide, setActiveRide] = useState<any>(null);
  const [earnings, setEarnings] = useState<{
    today: number;
    bestDay: number;
    dailyAvg: number;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [activeRes, earningsRes, availableRes] = await Promise.all([
        fetch("/api/rides/active"),
        fetch("/api/driver/earnings"),
        fetch("/api/rides/available"),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveRide(data.ride);
      }
      if (earningsRes.ok) {
        setEarnings(await earningsRes.json());
      }
      if (availableRes.ok) {
        const data = await availableRes.json();
        setPendingCount(data.rides?.length ?? 0);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl font-black mb-1">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-neutral-500 mb-8">Here&apos;s how you&apos;re doing today.</p>

          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : (
            <>
              {/* Active ride banner */}
              {activeRide ? (
                <a
                  href="/driver/requests"
                  className="block bg-black text-white rounded-2xl p-5 sm:p-6 mb-8 hover:bg-neutral-900 transition-colors"
                >
                  <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                    Active ride
                  </p>
                  <div className="flex items-start gap-2 mb-1.5">
                    <MapPin size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                    <p className="text-sm break-words">{activeRide.pickup.address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation2 size={14} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                    <p className="text-sm break-words">{activeRide.drop.address}</p>
                  </div>
                  <p className="text-xs text-neutral-400 mt-3">Tap to manage →</p>
                </a>
              ) : (
                <a
                  href="/driver/requests"
                  className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 mb-8 hover:border-black hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Inbox size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {pendingCount > 0
                          ? `${pendingCount} ride${pendingCount > 1 ? "s" : ""} waiting`
                          : "No active ride"}
                      </p>
                      <p className="text-sm text-neutral-400 truncate">
                        {pendingCount > 0
                          ? "Tap to view and accept"
                          : "New requests will show up here"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0">View →</span>
                </a>
              )}

              {/* Earnings */}
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} />
                <h2 className="font-bold">Daily Earnings</h2>
                <span className="text-sm text-neutral-400">· Last 7 days performance</span>
              </div>

             <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <EarningsCard label="Best Day" value={earnings?.bestDay ?? 0} />
              <EarningsCard label="Daily Avg" value={earnings?.dailyAvg ?? 0} />
              <EarningsCard label="Today" value={earnings?.today ?? 0} />
            </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

function EarningsCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="group rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white border border-neutral-200 hover:bg-black hover:border-black transition-colors cursor-default">
      <p className="text-[10px] sm:text-xs uppercase tracking-wide mb-1.5 sm:mb-2 text-neutral-400 group-hover:text-neutral-500 truncate">
        {label}
      </p>
      <p className="text-lg sm:text-2xl font-black text-black group-hover:text-white transition-colors">
        ₹{value}
      </p>
    </div>
  );
}