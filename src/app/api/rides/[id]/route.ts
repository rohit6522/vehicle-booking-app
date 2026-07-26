import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const ride = await Ride.findById(id).populate("driver", "name phone vehicle rating");
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const isRider = ride.rider.toString() === userId;
  const isDriver = ride.driver?._id?.toString() === userId;

  if (!isRider && !isDriver && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only the rider ever sees the start OTP — never expose it to the
  // driver or anyone else, or the "driver confirms with rider" check
  // becomes meaningless.
  const rideObj = ride.toObject();
  const { startOtp, ...safeRide } = rideObj;

  return NextResponse.json({
    ride: {
      ...safeRide,
      otpForRider: isRider ? startOtp : undefined,
    },
  });
}