import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const driver = await User.findById(id);
  if (!driver || driver.partnerStatus !== "approved") {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  driver.kycCallStarted = true;
  driver.kycStatus = "pending";
  await driver.save();

  return NextResponse.json({ message: "Call started" });
}