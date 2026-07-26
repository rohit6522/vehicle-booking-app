import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import User from "@/models/User";

const schema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().max(300).optional(),
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

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    await connectDB();

    const ride = await Ride.findOne({ _id: id, rider: userId, status: "completed" });
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.rating?.score) {
      return NextResponse.json({ error: "You've already rated this ride" }, { status: 409 });
    }

    ride.rating = parsed.data;
    await ride.save();

    // Recalculate the driver's overall average rating across all their
    // rated completed rides.
    if (ride.driver) {
      const ratedRides = await Ride.find({
        driver: ride.driver,
        "rating.score": { $exists: true },
      }).select("rating");

      const avg =
        ratedRides.reduce((sum, r) => sum + (r.rating?.score ?? 0), 0) / ratedRides.length;

      await User.findByIdAndUpdate(ride.driver, {
        rating: Math.round(avg * 10) / 10,
      });
    }

    return NextResponse.json({ message: "Thanks for your feedback!" });
  } catch (err) {
    console.error("Rate ride error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}