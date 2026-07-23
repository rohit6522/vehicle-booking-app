import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import { getIO } from "@/lib/socketServer";

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
  ride.fare.final = ride.fare.estimated; // Phase 6 (Razorpay) will settle real payment
  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ ride });
}