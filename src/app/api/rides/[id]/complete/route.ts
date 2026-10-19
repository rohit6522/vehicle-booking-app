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
    // Count movement only once we are 20 m from the last counted point,
    // so GPS jitter while stopped doesn't accumulate as distance.
    const MIN_STEP_KM = 0.02;
    let travelledKm = 0;
    let anchor = path[0];
    for (let i = 1; i < path.length; i++) {
      const step = distanceKm(anchor, path[i]);
      if (step >= MIN_STEP_KM) {
        travelledKm += step;
        anchor = path[i];
      }
    }

    // Never below the quoted route, never above 1.5x it (upfront-price
    // style cap). Tune MAX_OVERAGE to taste.
    const MAX_OVERAGE = 1.5;
    const finalDistanceKm = Math.min(
      Math.max(travelledKm, ride.distanceKm),
      ride.distanceKm * MAX_OVERAGE
    );
    ride.fare.final = estimateFare(finalDistanceKm, ride.vehicleType);
  } else {
    ride.fare.final = ride.fare.estimated;
  }

  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ ride });
}