import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user || user.partnerStatus !== "approved") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

   if (parsed.data.action === "approve") {
      // Role becomes "driver" only after Pricing is also set (see
      // /api/admin/pricing/[id]) — KYC alone isn't enough yet.
      user.kycStatus = "approved";
    } else {
      user.kycStatus = "rejected";
    }
    await user.save();

    return NextResponse.json({
      message: `KYC ${parsed.data.action}d`,
      kycStatus: user.kycStatus,
    });
  } catch (err) {
    console.error("KYC review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}