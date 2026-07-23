import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [total, approved, pending, rejected] = await Promise.all([
    User.countDocuments({ partnerStatus: { $ne: "not_applied" } }),
    User.countDocuments({ partnerStatus: "approved" }),
    User.countDocuments({ partnerStatus: "pending" }),
    User.countDocuments({ partnerStatus: "rejected" }),
  ]);

  return NextResponse.json({ total, approved, pending, rejected });
}