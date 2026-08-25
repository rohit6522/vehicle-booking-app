import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();

  try {
    await connectDB();

    return NextResponse.json({
      status: "ok",
      uptime: process.uptime(),
      database: "connected",
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}