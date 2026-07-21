import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";
import { distanceKm, estimateFare } from "@/lib/fare";

const createSchema = z.object({
  vehicleType: z.enum(["bike", "car", "suv", "van"]),
  pickup: z.object({
    address: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
  drop: z.object({
    address: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { vehicleType, pickup, drop } = parsed.data;
    const km = distanceKm(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: drop.lat, lng: drop.lng }
    );
    const fare = estimateFare(km, vehicleType);

    await connectDB();

    const ride = await Ride.create({
      rider: (session.user as any).id,
      vehicleType,
      pickup: {
        address: pickup.address,
        coordinates: [pickup.lng, pickup.lat],
      },
      drop: {
        address: drop.address,
        coordinates: [drop.lng, drop.lat],
      },
      distanceKm: Math.round(km * 10) / 10,
      fare: { estimated: fare },
      status: "requested",
    });

    return NextResponse.json({ ride }, { status: 201 });
  } catch (err) {
    console.error("Create ride error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const filter = role === "driver" ? { driver: userId } : { rider: userId };

  const rides = await Ride.find(filter).sort({ requestedAt: -1 }).limit(50);

  return NextResponse.json({ rides });
}