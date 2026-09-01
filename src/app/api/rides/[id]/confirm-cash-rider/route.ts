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

  const ride = await Ride.findOne({
    _id: id,
    rider: userId,
    status: "completed",
    paymentMethod: "cash",
  });

  if (!ride) {
    return NextResponse.json(
      { error: "Ride not found or not a cash payment" },
      { status: 404 }
    );
  }

  ride.cashConfirmedByRider = true;

  // Both sides confirmed → mark as paid. Only one side confirmed and the
  // other side is explicitly false (not just "not yet") would be a
  // mismatch, but we can't know that until both have acted — so we only
  // flag a dispute if the driver already said "received" and this
  // confirmation contradicts nothing (there's no explicit "I didn't pay"
  // button, so disputes here would come from a future "I didn't pay"
  // action if added).
  if (ride.cashConfirmedByDriver) {
    ride.paymentStatus = "paid";
  }

  await ride.save();

  getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

  return NextResponse.json({ ride });
}