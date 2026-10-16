import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rateLimit";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(5, "Message is too short"),
});

export async function POST(req: Request) {

  const rl = rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000);
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
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;

    if (!receiver) {
      console.error("CONTACT_RECEIVER_EMAIL is not configured");
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    await resend.emails.send({
      from: "RYDEX Contact Form <onboarding@resend.dev>",
      to: receiver,
      replyTo: email,
      subject: `New contact message from ${name.replace(/[\r\n]+/g, " ")}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}