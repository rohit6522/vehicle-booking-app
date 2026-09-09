import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-white font-black text-6xl mb-4">404</h1>
      <p className="text-neutral-400 mb-8">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}