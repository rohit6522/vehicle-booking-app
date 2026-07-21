import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    await connectDB();

    const record = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json(
        { error: "OTP expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteMany({ email });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    await User.create({
      name: record.name,
      email,
      password: record.hashedPassword,
      role: "rider",
    });

    await Otp.deleteMany({ email });

    return NextResponse.json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}