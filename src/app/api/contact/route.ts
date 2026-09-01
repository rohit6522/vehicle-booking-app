import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(5, "Message is too short"),
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

    const { name, email, message } = parsed.data;
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;

    if (!receiver) {
      console.error("CONTACT_RECEIVER_EMAIL is not configured");
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    await resend.emails.send({
      from: "RYDEX Contact Form <onboarding@resend.dev>",
      to: receiver,
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}