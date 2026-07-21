import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const driver = await User.findById((session.user as any).id);
  if (!driver?.vehicle?.type) {
    return NextResponse.json(
      { error: "Add your vehicle details before viewing ride requests" },
      { status: 400 }
    );
  }

  const rides = await Ride.find({
    status: "requested",
    vehicleType: driver.vehicle.type,
  })
    .sort({ requestedAt: -1 })
    .limit(20)
    .populate("rider", "name phone rating");

  return NextResponse.json({ rides });
}