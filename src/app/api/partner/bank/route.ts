import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({
  accountHolderName: z.string().min(2, "Enter account holder name"),
  accountNumber: z.string().min(6, "Enter a valid account number"),
  ifsc: z.string().min(4, "Enter a valid IFSC code"),
  mobile: z.string().length(10, "Enter a valid 10-digit mobile number"),
  upi: z.string().optional(),
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
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = (session.user as any).id;
    await User.findByIdAndUpdate(userId, {
      bankDetails: parsed.data,
      partnerStep: "bank",
    });

    return NextResponse.json({ message: "Bank details saved" });
  } catch (err) {
    console.error("Partner bank step error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}