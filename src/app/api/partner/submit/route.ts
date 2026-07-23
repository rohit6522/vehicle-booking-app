import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = (session.user as any).id;
  const user = await User.findById(userId);

  if (!user?.vehicle || !user?.documents || !user?.bankDetails) {
    return NextResponse.json(
      { error: "Please complete all steps before submitting" },
      { status: 400 }
    );
  }

  if (user.partnerStatus === "pending") {
    return NextResponse.json(
      { error: "Your application is already under review" },
      { status: 409 }
    );
  }
  if (user.role === "driver") {
    return NextResponse.json(
      { error: "You're already a partner" },
      { status: 409 }
    );
  }

  user.partnerStep = "submitted";
  user.partnerStatus = "pending";
  await user.save();

  return NextResponse.json({ message: "Application submitted for review" });
}