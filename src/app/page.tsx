import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs tracking-[0.3em] text-amber-500 uppercase mb-4">
        Phase 1 — Foundation
      </span>
      <h1 className="text-4xl sm:text-5xl font-semibold mb-4">RideFlow</h1>
      <p className="text-neutral-400 max-w-md mb-8">
        Auth is wired up. Next phases add the booking flow, live tracking,
        driver KYC, and payments.
      </p>

      {session ? (
        <p className="text-neutral-300">
          Logged in as <span className="text-amber-500">{session.user?.email}</span> (
          {(session.user as any)?.role})
        </p>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-lg border border-white/15 text-white hover:bg-white/5 transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
