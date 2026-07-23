import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = (session.user as any).id;
  const user = await User.findById(userId).select(
    "role vehicle documents bankDetails partnerStep partnerStatus kycStatus"
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    role: user.role,
    partnerStep: user.partnerStep ?? null,
    partnerStatus: user.partnerStatus ?? "not_applied",
    kycStatus: user.kycStatus ?? "not_submitted",
    hasVehicle: !!user.vehicle,
    hasDocuments: !!user.documents,
    hasBank: !!user.bankDetails,
  });
}