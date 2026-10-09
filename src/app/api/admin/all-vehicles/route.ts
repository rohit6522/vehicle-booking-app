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

  const drivers = await User.find({ role: "driver" })
    .select("name email phone vehicle pricing isOnline rating createdAt")
    .sort({ createdAt: -1 });

  return NextResponse.json({ drivers });
}