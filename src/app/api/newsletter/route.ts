import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function POST(req: Request) {
  const rl = rateLimit(`newsletter:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Subscriber.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ message: "You're already subscribed!" });
    }

    await Subscriber.create({ email: parsed.data.email });

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}