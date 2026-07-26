import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

 const filter =
    role === "driver"
      ? { driver: userId, status: { $in: ["accepted", "ongoing"] } }
      : {
          rider: userId,
          $or: [
            { status: { $in: ["requested", "accepted", "ongoing"] } },
            { status: "completed", paymentStatus: { $ne: "paid" } },
          ],
        };

  const ride = await Ride.findOne(filter)
    .sort({ requestedAt: -1 })
    .populate("driver", "name phone vehicle rating");

  if (!ride) {
    return NextResponse.json({ ride: null });
  }

  // Same OTP-hiding rule as the single-ride GET route.
  const isRider = ride.rider.toString() === userId;
  const rideObj = ride.toObject();
  const { startOtp, ...safeRide } = rideObj;

  return NextResponse.json({
    ride: { ...safeRide, otpForRider: isRider ? startOtp : undefined },
  });
}