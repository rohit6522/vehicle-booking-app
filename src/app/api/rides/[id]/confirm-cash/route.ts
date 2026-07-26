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
    status: "completed",
    paymentMethod: "cash",
  });

  if (!ride) {
    return NextResponse.json(
      { error: "Ride not found or not a cash payment" },
      { status: 404 }
    );
  }

  ride.paymentStatus = "paid";
  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ message: "Cash payment confirmed", ride });
}