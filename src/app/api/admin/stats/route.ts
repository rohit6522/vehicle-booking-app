import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Ride from "@/models/Ride";

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

  const revenueAgg = await Ride.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$fare.final" } } },
  ]);

  const avgApprovalAgg = await User.aggregate([
    { $match: { partnerStatus: "approved", updatedAt: { $exists: true } } },
    { $project: { diff: { $subtract: ["$updatedAt", "$createdAt"] } } },
    { $group: { _id: null, avg: { $avg: "$diff" } } },
  ]);
  const avgApprovalHours = avgApprovalAgg[0] ? Math.round(avgApprovalAgg[0].avg / 3600000) : 0;

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  return NextResponse.json({ total, approved, pending, rejected, totalRevenue, avgApprovalHours, });
}