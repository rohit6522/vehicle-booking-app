import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  baseFare: z.number().min(0),
  perKm: z.number().min(0),
  waitingCharge: z.number().min(0),
  vehicleImageUrl: z.string().url(),
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
    const user = await User.findById(userId);

    if (user?.kycStatus !== "approved") {
      return NextResponse.json(
        { error: "Complete Video KYC before submitting pricing" },
        { status: 403 }
      );
    }

    user.pricing = parsed.data;
    user.pricingStatus = "pending";
    await user.save();

    return NextResponse.json({ message: "Pricing submitted for review" });
  } catch (err) {
    console.error("Pricing submit error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}