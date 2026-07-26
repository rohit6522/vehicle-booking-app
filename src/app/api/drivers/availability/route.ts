import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  const drivers = await User.find({
    role: "driver",
    kycStatus: "approved",
  }).select("vehicle.type");

  const counts: Record<string, number> = { bike: 0, car: 0, suv: 0, van: 0 };

  for (const d of drivers) {
    const type = d.vehicle?.type;
    if (type && type in counts) counts[type]++;
  }

  return NextResponse.json({ counts });
}