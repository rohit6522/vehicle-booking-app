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

  const ride = await Ride.findOne({
    driver: driverId,
    status: { $in: ["accepted", "ongoing"] },
  }).sort({ acceptedAt: -1 });

  return NextResponse.json({ ride: ride ?? null });
}