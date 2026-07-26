import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

  const ride = await Ride.findById(id);
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  if (ride.rider.toString() !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (ride.status !== "completed") {
    return NextResponse.json(
      { error: "Ride must be completed before payment" },
      { status: 400 }
    );
  }

  if (ride.paymentStatus === "paid") {
    return NextResponse.json({ error: "This ride is already paid" }, { status: 409 });
  }

  const amountInPaise = Math.round((ride.fare.final ?? ride.fare.estimated) * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `ride_${ride._id}`,
    notes: { rideId: ride._id.toString() },
  });

  ride.razorpayOrderId = order.id;
  await ride.save();

  return NextResponse.json({
    orderId: order.id,
    amount: amountInPaise,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}