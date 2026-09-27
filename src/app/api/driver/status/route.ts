import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "driver") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { isOnline } = await req.json();
  await connectDB();
  await User.findByIdAndUpdate((session.user as any).id, { isOnline });
  return NextResponse.json({ isOnline });
}