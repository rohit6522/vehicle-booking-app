"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <span className="inline-block text-xs tracking-[0.3em] text-amber-500 uppercase mb-2">
            Get moving
          </span>
          <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6 bg-[#15181F] p-1 rounded-xl border border-white/5">
          {(["rider", "driver"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                role === r
                  ? "bg-amber-500 text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {r === "rider" ? "I need a ride" : "I drive"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#15181F] border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Jordan Lee"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#15181F] border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#15181F] border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-500 hover:text-amber-400">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
