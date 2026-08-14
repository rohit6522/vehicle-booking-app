import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId } = await params;
  const userId = (session.user as any).id;

  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.savedAddresses = (user.savedAddresses ?? []).filter(
    (a: any) => a._id?.toString() !== addressId
  );
  await user.save();

  return NextResponse.json({ addresses: user.savedAddresses });
}