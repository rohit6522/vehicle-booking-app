import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  label: z.string().min(1).max(30),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById((session.user as any).id).select("savedAddresses");
  return NextResponse.json({ addresses: user?.savedAddresses ?? [] });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if ((user?.savedAddresses?.length ?? 0) >= 10) {
      return NextResponse.json(
        { error: "You can save up to 10 addresses" },
        { status: 400 }
      );
    }

    user!.savedAddresses = [...(user!.savedAddresses ?? []), parsed.data];
    await user!.save();

    return NextResponse.json({ addresses: user!.savedAddresses });
  } catch (err) {
    console.error("Save address error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}