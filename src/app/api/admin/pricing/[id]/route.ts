import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

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
    "name email vehicle pricing pricingStatus"
  );
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}

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
    if (!user || user.pricingStatus !== "pending") {
      return NextResponse.json(
        { error: "Pricing submission not found or already reviewed" },
        { status: 404 }
      );
    }

    if (parsed.data.action === "approve") {
      user.pricingStatus = "approved";
      user.role = "driver"; // officially live now
    } else {
      user.pricingStatus = "rejected";
    }
    await user.save();

    return NextResponse.json({
      message: `Pricing ${parsed.data.action}d`,
      pricingStatus: user.pricingStatus,
    });
  } catch (err) {
    console.error("Pricing review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}