import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import { getIO } from "@/lib/socketServer";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
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

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // Verify the signature ourselves — never trust the client's word that
    // payment succeeded without this check.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await connectDB();

    const ride = await Ride.findById(id);
    if (!ride || ride.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Ride/order mismatch" }, { status: 400 });
    }

    ride.paymentStatus = "paid";
    ride.razorpayPaymentId = razorpay_payment_id;
    await ride.save();

    getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

    return NextResponse.json({ message: "Payment verified", ride });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}