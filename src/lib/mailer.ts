import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"RYDEX" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your RYDEX verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: auto;">
        <h2 style="letter-spacing: -0.5px;">RYDEX</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 900; letter-spacing: 6px;">${otp}</p>
        <p style="color: #666; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}