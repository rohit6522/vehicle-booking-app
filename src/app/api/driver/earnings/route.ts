import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const driverId = (session.user as any).id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const rides = await Ride.find({
    driver: driverId,
    status: "completed",
    completedAt: { $gte: sevenDaysAgo },
  }).select("fare completedAt");

  // Group earnings by day (YYYY-MM-DD)
  const byDay: Record<string, number> = {};
  for (const ride of rides) {
    const day = ride.completedAt!.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + (ride.fare.final ?? ride.fare.estimated);
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const values = Object.values(byDay);

  const today = byDay[todayKey] ?? 0;
  const bestDay = values.length ? Math.max(...values) : 0;
  const dailyAvg = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / 7)
    : 0;

  return NextResponse.json({
    today,
    bestDay,
    dailyAvg,
    completedRides: rides.length,
  });
}