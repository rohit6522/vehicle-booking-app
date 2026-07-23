"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PieChart, Pie, Cell } from "recharts";
import { Users, CheckCircle2, Clock, XCircle, ShieldCheck, Check, X } from "lucide-react";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

const COLORS = { approved: "#10b981", pending: "#f59e0b", rejected: "#ef4444" };

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    const [statsRes, appsRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/partners"),
    ]);
    const statsData = await statsRes.json();
    const appsData = await appsRes.json();

    if (statsRes.ok) setStats(statsData);
    if (appsRes.ok) setApplications(appsData.applications);
    else setError(appsData.error ?? "Could not load applications");

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleReview(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchAll();
      }
    } finally {
      setProcessingId(null);
    }
  }

  const chartData = stats
    ? [
        { name: "Approved", value: stats.approved, color: COLORS.approved },
        { name: "Pending", value: stats.pending, color: COLORS.pending },
        { name: "Rejected", value: stats.rejected, color: COLORS.rejected },
      ]
    : [];

  const totalForChart = stats?.total || 1; // avoid divide-by-zero

  return (
    <main className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <span className="font-black tracking-tight">RYDEX ADMIN</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
          <ShieldCheck size={13} />
          Secure Mode
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-neutral-400 text-sm">Loading...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Users}
                iconBg="bg-violet-50 text-violet-600"
                label="TOTAL VENDORS"
                value={stats?.total ?? 0}
                sub="vs last month"
              />
              <StatCard
                icon={CheckCircle2}
                iconBg="bg-blue-50 text-blue-600"
                label="APPROVED"
                value={stats?.approved ?? 0}
                sub="verified vendors"
              />
              <StatCard
                icon={Clock}
                iconBg="bg-amber-50 text-amber-600"
                label="PENDING"
                value={stats?.pending ?? 0}
                sub="awaiting review"
              />
              <StatCard
                icon={XCircle}
                iconBg="bg-red-50 text-red-600"
                label="REJECTED"
                value={stats?.rejected ?? 0}
                sub="declined"
              />
            </div>

            {/* Status overview + applications */}
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
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
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
                  <StatusRow
                    icon={CheckCircle2}
                    color="text-emerald-500"
                    barColor="bg-emerald-500"
                    label="Approved"
                    value={stats?.approved ?? 0}
                    pct={((stats?.approved ?? 0) / totalForChart) * 100}
                  />
                  <StatusRow
                    icon={Clock}
                    color="text-amber-500"
                    barColor="bg-amber-500"
                    label="Pending"
                    value={stats?.pending ?? 0}
                    pct={((stats?.pending ?? 0) / totalForChart) * 100}
                  />
                  <StatusRow
                    icon={XCircle}
                    color="text-red-500"
                    barColor="bg-red-500"
                    label="Rejected"
                    value={stats?.rejected ?? 0}
                    pct={((stats?.rejected ?? 0) / totalForChart) * 100}
                  />
                </div>
              </div>
            </div>

            {/* Pending applications list */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-black mb-1">Pending applications</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Review vendor details and approve or reject.
              </p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              {applications.length === 0 ? (
                <p className="text-neutral-400 text-sm">No pending applications.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="border border-neutral-200 rounded-2xl p-5 flex items-start justify-between"
                    >
                      <div>
                        <p className="font-bold">{app.name}</p>
                        <p className="text-sm text-neutral-500">{app.email}</p>
                        <p className="text-sm text-neutral-500 mt-2">
                          {app.vehicle?.type} · {app.vehicle?.model}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Plate: {app.vehicle?.numberPlate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(app._id, "approve")}
                          disabled={processingId === app._id}
                          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReview(app._id, "reject")}
                          disabled={processingId === app._id}
                          className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-600 flex items-center justify-center hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: any;
  iconBg: string;
  label: string;
  value: number;
  sub: string;
}) {
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

function StatusRow({
  icon: Icon,
  color,
  barColor,
  label,
  value,
  pct,
}: {
  icon: any;
  color: string;
  barColor: string;
  label: string;
  value: number;
  pct: number;
}) {
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
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}