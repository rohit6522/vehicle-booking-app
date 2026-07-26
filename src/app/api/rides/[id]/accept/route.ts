import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import User from "@/models/User";
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

  const driver = await User.findById(driverId);
  if (driver?.kycStatus !== "approved") {
    return NextResponse.json(
      { error: "Complete KYC verification before accepting rides" },
      { status: 403 }
    );
  }

  const startOtp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit

  const ride = await Ride.findOneAndUpdate(
    { _id: id, status: "requested", driver: { $exists: false } },
    { driver: driverId, status: "accepted", acceptedAt: new Date(), startOtp },
    { new: true }
  ).populate("driver", "name phone vehicle rating");

  if (!ride) {
    return NextResponse.json(
      { error: "This ride is no longer available" },
      { status: 409 }
    );
  }

  // Notify the rider (and anyone else in this ride's room) instantly.
  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ ride });
}