"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Video,
  UsersRound,
  ImagePlus,
} from "lucide-react";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

const COLORS = { approved: "#10b981", pending: "#f59e0b", rejected: "#ef4444" };

type Tab = "kyc" | "reviews" | "pricing";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [pricingQueue, setPricingQueue] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("kyc");
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    const [statsRes, appsRes, kycRes, pricingRes, earningsRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/partners"),
      fetch("/api/admin/kyc"),
      fetch("/api/admin/pricing"),
      fetch("/api/admin/earnings"),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (appsRes.ok) setApplications((await appsRes.json()).applications);
    if (kycRes.ok) setKycQueue((await kycRes.json()).drivers);
    if (pricingRes.ok) setPricingQueue((await pricingRes.json()).vendors);
    if (earningsRes.ok) setEarnings(await earningsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleStartCall(driverId: string) {
    await fetch(`/api/admin/kyc/${driverId}/start-call`, { method: "POST" });
    window.location.href = `/video-kyc/kyc-${driverId}`;
  }

  const chartData = stats
    ? [
        { name: "Approved", value: stats.approved, color: COLORS.approved },
        { name: "Pending", value: stats.pending, color: COLORS.pending },
        { name: "Rejected", value: stats.rejected, color: COLORS.rejected },
      ]
    : [];
  const totalForChart = stats?.total || 1;

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center flex-shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <span className="font-black tracking-tight truncate">RYDEX ADMIN</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={13} />
            Secure Mode
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
       {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5">
                  <Skeleton className="w-9 h-9 rounded-lg mb-4" />
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 mb-8">
              <Skeleton className="h-4 w-24 mb-3 rounded-full" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-3 w-32 mb-6" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} iconBg="bg-violet-50 text-violet-600" label="TOTAL VENDORS" value={stats?.total ?? 0} sub="vs last month" />
              <StatCard icon={CheckCircle2} iconBg="bg-blue-50 text-blue-600" label="APPROVED" value={stats?.approved ?? 0} sub="verified vendors" />
              <StatCard icon={Clock} iconBg="bg-amber-50 text-amber-600" label="PENDING" value={stats?.pending ?? 0} sub="awaiting review" />
              <StatCard icon={XCircle} iconBg="bg-red-50 text-red-600" label="REJECTED" value={stats?.rejected ?? 0} sub="declined" />
            </div>

            {earnings && (
              <div className="bg-white rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      ADMIN DASHBOARD
                    </span>
                    <h2 className="text-xl font-black mt-3">Daily Earnings</h2>
                    <p className="text-sm text-neutral-400">Last 7 days performance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">WEEKLY TOTAL</p>
                    <p className="text-2xl font-black">₹{earnings.weeklyTotal}</p>
                    <p
                      className={`text-xs font-medium ${
                        earnings.changePct >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {earnings.changePct >= 0 ? "↑" : "↓"} {Math.abs(earnings.changePct)}% vs
                      yesterday
                    </p>
                  </div>
                </div>

                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earnings.days}>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {earnings.days.map((d: any, i: number) => (
                          <Cell
                            key={i}
                            fill={
                              d.total === earnings.today && i === earnings.days.length - 1
                                ? "#10b981" // today = green
                                : d.total === earnings.bestDay && d.total > 0
                                ? "#8b5cf6" // best day = purple
                                : "#bfdbfe" // other days = light blue
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-5 mt-2">
                  <LegendDot color="#10b981" label="Today" />
                  <LegendDot color="#8b5cf6" label="Best day" />
                  <LegendDot color="#bfdbfe" label="Other days" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 mb-8">
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                APPLICATIONS
              </span>
              <h2 className="text-xl font-black mt-3">Status Overview</h2>
              <p className="text-sm text-neutral-400 mb-6">
                {stats?.total ?? 0} total applications
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-[160px] h-[160px] flex-shrink-0">
                  <PieChart width={160} height={160}>
                    <Pie data={chartData} dataKey="value" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270} stroke="none">
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{stats?.total ?? 0}</span>
                    <span className="text-[10px] text-neutral-400 tracking-wide">TOTAL</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <StatusRow icon={CheckCircle2} color="text-emerald-500" barColor="bg-emerald-500" label="Approved" value={stats?.approved ?? 0} pct={((stats?.approved ?? 0) / totalForChart) * 100} />
                  <StatusRow icon={Clock} color="text-amber-500" barColor="bg-amber-500" label="Pending" value={stats?.pending ?? 0} pct={((stats?.pending ?? 0) / totalForChart) * 100} />
                  <StatusRow icon={XCircle} color="text-red-500" barColor="bg-red-500" label="Rejected" value={stats?.rejected ?? 0} pct={((stats?.rejected ?? 0) / totalForChart) * 100} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                <TabButton active={tab === "kyc"} onClick={() => setTab("kyc")} icon={Video} label="Video KYC" count={kycQueue.length} />
                <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} icon={UsersRound} label="Vendor Reviews" count={applications.length} />
                <TabButton active={tab === "pricing"} onClick={() => setTab("pricing")} icon={ImagePlus} label="Pricing & Images" count={pricingQueue.length} />
              </div>

              {tab === "kyc" && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 tracking-wide mb-4">
                    VIDEO KYC QUEUE
                  </p>
                  {kycQueue.length === 0 ? (
                    <div className="text-center py-10">
                      <Video size={28} className="mx-auto text-neutral-300 mb-3" />
                      <p className="font-semibold text-neutral-600">All caught up!</p>
                      <p className="text-sm text-neutral-400">No drivers awaiting Video KYC.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {kycQueue.map((d) => (
                        <div key={d._id} className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold">
                              {d.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{d.name}</p>
                              <p className="text-xs text-neutral-400">{d.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full capitalize">
                              {d.kycStatus === "pending" ? "Pending" : "Not started"}
                            </span>
                            <button
                              onClick={() => handleStartCall(d._id)}
                              className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                            >
                              {d.kycCallStarted ? "Rejoin Call" : "Start Call"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "reviews" && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 tracking-wide mb-4">
                    PENDING APPLICATIONS
                  </p>
                  {applications.length === 0 ? (
                    <div className="text-center py-10">
                      <UsersRound size={28} className="mx-auto text-neutral-300 mb-3" />
                      <p className="font-semibold text-neutral-600">All caught up!</p>
                      <p className="text-sm text-neutral-400">No pending applications.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <a
                          key={app._id}
                          href={`/admin/vendors/${app._id}`}
                          className="block border border-neutral-200 rounded-2xl p-5 hover:border-black transition-colors"
                        >
                          <p className="font-bold">{app.name}</p>
                          <p className="text-sm text-neutral-500">{app.email}</p>
                          <p className="text-sm text-neutral-500 mt-2">
                            {app.vehicle?.type} · {app.vehicle?.model}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">Plate: {app.vehicle?.numberPlate}</p>
                          <p className="text-xs font-medium mt-3">Review application →</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "pricing" && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 tracking-wide mb-4">
                    PRICING SUBMISSIONS
                  </p>
                  {pricingQueue.length === 0 ? (
                    <div className="text-center py-10">
                      <ImagePlus size={28} className="mx-auto text-neutral-300 mb-3" />
                      <p className="font-semibold text-neutral-600">All caught up!</p>
                      <p className="text-sm text-neutral-400">No pending items right now.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pricingQueue.map((v) => (
                        <a
                          key={v._id}
                          href={`/admin/vehicles/${v._id}`}
                          className="block border border-neutral-200 rounded-2xl p-5 hover:border-black transition-colors"
                        >
                          <p className="font-bold">{v.name}</p>
                          <p className="text-sm text-neutral-500">{v.email}</p>
                          <p className="text-sm text-neutral-500 mt-2">
                            Base ₹{v.pricing?.baseFare} · ₹{v.pricing?.perKm}/km
                          </p>
                          <p className="text-xs font-medium mt-3">Review pricing →</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
        active ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-100"
      }`}
    >
      <Icon size={14} />
      {label}
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/20" : "bg-neutral-200 text-neutral-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function StatCard({ icon: Icon, iconBg, label, value, sub }: { icon: any; iconBg: string; label: string; value: number; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs tracking-wide text-neutral-400 font-medium mb-1">{label}</p>
      <p className="text-3xl font-black mb-2">{value}</p>
      <p className="text-xs text-neutral-400">{sub}</p>
    </div>
  );
}



function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function StatusRow({ icon: Icon, color, barColor, label, value, pct }: { icon: any; color: string; barColor: string; label: string; value: number; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
          <Icon size={14} />
          {label}
        </span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}