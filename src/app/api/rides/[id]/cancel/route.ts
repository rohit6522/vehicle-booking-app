import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  await connectDB();

  const ride = await Ride.findById(id);
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const isRider = ride.rider.toString() === userId;
  const isDriver = ride.driver?.toString() === userId;

  if (!isRider && !isDriver) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (ride.status === "completed" || ride.status === "cancelled") {
    return NextResponse.json(
      { error: `Ride is already ${ride.status}` },
      { status: 400 }
    );
  }

  ride.status = "cancelled";
  ride.cancelledAt = new Date();
  ride.cancelledBy = isRider ? "rider" : "driver";
  await ride.save();

  return NextResponse.json({ ride });
}