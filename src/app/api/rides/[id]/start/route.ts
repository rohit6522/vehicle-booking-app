import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import { getIO } from "@/lib/socketServer";

const schema = z.object({
  otp: z.string().length(4),
});

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

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid 4-digit OTP" }, { status: 400 });
    }

    await connectDB();

    const ride = await Ride.findOne({
      _id: id,
      driver: driverId,
      status: "accepted",
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.startOtp !== parsed.data.otp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    ride.status = "ongoing";
    await ride.save();

    getIO()?.to(`ride:${id}`).emit("ride:update", { ride });

    return NextResponse.json({ message: "Ride started", ride });
  } catch (err) {
    console.error("Start ride error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}