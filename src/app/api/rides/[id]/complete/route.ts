import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import { getIO } from "@/lib/socketServer";
import { distanceKm, estimateFare } from "@/lib/fare";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const driverId = (session.user as any).id;

  await connectDB();

  const ride = await Ride.findOne({
    _id: id,
    driver: driverId,
    status: { $in: ["accepted", "ongoing"] },
  });

  if (!ride) {
    return NextResponse.json(
      { error: "Ride not found or not in progress" },
      { status: 404 }
    );
  }

  ride.status = "completed";
  ride.completedAt = new Date();

  // Compute the real fare from the driver's tracked GPS path (sum of
  // consecutive segment distances) when we have enough data points.
  // Falls back to the original estimate for older/short rides where
  // tracking didn't produce a usable path.
  const path = ride.trackedPath ?? [];
  if (path.length >= 2) {
    let travelledKm = 0;
    for (let i = 1; i < path.length; i++) {
      travelledKm += distanceKm(path[i - 1], path[i]);
    }
    // Guard against GPS noise producing an unrealistically small distance
    // (e.g. driver barely moved) — never charge less than the estimate's
    // straight-line distance.
    const finalDistanceKm = Math.max(travelledKm, ride.distanceKm);
    ride.fare.final = estimateFare(finalDistanceKm, ride.vehicleType);
  } else {
    ride.fare.final = ride.fare.estimated;
  }

  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ ride });
}