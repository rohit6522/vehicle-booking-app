import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const MAX_POINTS = 2000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    await connectDB();

    // Only the assigned driver, and only while the ride is ongoing.
    const result = await Ride.updateOne(
      { _id: id, driver: (session.user as any).id, status: "ongoing" },
      {
        $push: {
          trackedPath: {
            $each: [{ lat: parsed.data.lat, lng: parsed.data.lng }],
            $slice: -MAX_POINTS,
          },
        },
      }
    );

    return NextResponse.json({ recorded: result.modifiedCount > 0 });
  } catch (err) {
    console.error("Location save error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}