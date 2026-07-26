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
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  await connectDB();

  const ride = await Ride.findOne({ _id: id, rider: userId, status: "completed" });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  if (ride.paymentStatus === "paid") {
    return NextResponse.json({ error: "This ride is already paid" }, { status: 409 });
  }

  ride.paymentMethod = "cash";
  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ message: "Cash payment selected", ride });
}