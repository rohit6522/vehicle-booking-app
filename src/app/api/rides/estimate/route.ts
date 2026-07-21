import { NextResponse } from "next/server";
import { z } from "zod";
import { distanceKm, estimateFare } from "@/lib/fare";

const schema = z.object({
  pickup: z.object({ lat: z.number(), lng: z.number() }),
  drop: z.object({ lat: z.number(), lng: z.number() }),
  vehicleType: z.enum(["bike", "car", "suv", "van"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { pickup, drop, vehicleType } = parsed.data;
    const km = distanceKm(pickup, drop);
    const fare = estimateFare(km, vehicleType);

    return NextResponse.json({
      distanceKm: Math.round(km * 10) / 10,
      fare,
    });
  } catch (err) {
    console.error("Estimate error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}