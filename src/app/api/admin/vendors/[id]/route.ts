import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const vendor = await User.findById(id).select(
    "name email phone vehicle documents bankDetails partnerStatus kycStatus rejectionReason"
  );

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}

const reviewSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(3, "Please enter a rejection reason"),
  }),
]);

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
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const vendor = await User.findById(id);
    if (!vendor || vendor.partnerStatus !== "pending") {
      return NextResponse.json(
        { error: "Application not found or already reviewed" },
        { status: 404 }
      );
    }

    if (parsed.data.action === "approve") {
      // Role stays "rider" for now — it only becomes "driver" once
      // Video KYC is also approved (see /api/admin/kyc/[id]).
      vendor.partnerStatus = "approved";
      vendor.rejectionReason = undefined;
    } else {
      vendor.partnerStatus = "rejected";
      vendor.rejectionReason = parsed.data.reason;
    }

    await vendor.save();

    return NextResponse.json({
      message: `Vendor ${parsed.data.action}d`,
      partnerStatus: vendor.partnerStatus,
    });
  } catch (err) {
    console.error("Vendor review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}