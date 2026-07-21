import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  vehicleType: z.enum(["bike", "auto", "car", "premium"]),
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  numberPlate: z.string().min(3, "Enter a valid number plate"),
  color: z.string().min(1, "Vehicle color is required"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = (session.user as any).id;
    const existing = await User.findById(userId);

    if (existing?.partnerStatus === "pending") {
      return NextResponse.json(
        { error: "Your application is already under review" },
        { status: 409 }
      );
    }
    if (existing?.role === "driver") {
      return NextResponse.json(
        { error: "You're already registered as a partner" },
        { status: 409 }
      );
    }

    // Role stays "rider" until an admin approves this application.
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        vehicle: parsed.data,
        partnerStatus: "pending",
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Application submitted — an admin will review it shortly",
      partnerStatus: updated?.partnerStatus,
    });
  } catch (err) {
    console.error("Partner apply error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}