import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  aadhaarUrl: z.string().url(),
  licenseUrl: z.string().url(),
  rcUrl: z.string().url(),
});

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
        { error: "Please upload all three documents" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = (session.user as any).id;
    await User.findByIdAndUpdate(userId, {
      documents: parsed.data,
      partnerStep: "documents",
    });

    return NextResponse.json({ message: "Documents saved" });
  } catch (err) {
    console.error("Partner documents step error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}