import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ride from "@/models/Ride";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const ride = await Ride.findById(id).populate("driver", "name phone vehicle rating");
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const isOwner =
    ride.rider.toString() === userId ||
    ride.driver?.toString() === userId ||
    role === "admin";

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ride });
}