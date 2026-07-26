import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 previous days = 7 days
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const rides = await Ride.find({
    status: "completed",
    completedAt: { $gte: sevenDaysAgo },
  }).select("fare completedAt");

  // Build a fixed 7-day series (so days with ₹0 still show up on the chart).
  const days: { key: string; label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    days.push({ key, label, total: 0 });
  }

  for (const ride of rides) {
    const key = ride.completedAt!.toISOString().slice(0, 10);
    const day = days.find((d) => d.key === key);
    if (day) day.total += ride.fare.final ?? ride.fare.estimated;
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = days[days.length - 2]?.key;

  const today = days.find((d) => d.key === todayKey)?.total ?? 0;
  const yesterday = days.find((d) => d.key === yesterdayKey)?.total ?? 0;
  const weeklyTotal = days.reduce((sum, d) => sum + d.total, 0);
  const bestDay = Math.max(...days.map((d) => d.total));
  const changePct =
    yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : today > 0 ? 100 : 0;

  return NextResponse.json({ days, weeklyTotal, today, bestDay, changePct });
}