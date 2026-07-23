import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  vehicleType: z.enum(["bike", "auto", "car", "premium"]),
  numberPlate: z.string().min(3, "Enter a valid vehicle number"),
  model: z.string().min(1, "Vehicle model is required"),
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
    await User.findByIdAndUpdate(userId, {
      vehicle: {
        type: parsed.data.vehicleType,
        model: parsed.data.model,
        numberPlate: parsed.data.numberPlate,
      },
      partnerStep: "vehicle",
    });

    return NextResponse.json({ message: "Vehicle details saved" });
  } catch (err) {
    console.error("Partner vehicle step error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}