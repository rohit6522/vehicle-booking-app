"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
    router.refresh();
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-32 sm:py-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-7 sm:p-8 shadow-xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center tracking-tighter">
                RDX
              </span>
              <span className="font-extrabold text-xl tracking-tight font-heading">
                RYDEX
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white font-heading mt-2">
              Welcome back
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Sign in to manage your rides and bookings
            </p>
          </div>

          {/* Google Button */}
          <motion.button
            onClick={handleGoogle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700/80 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all cursor-pointer shadow-xs"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </motion.button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              OR EMAIL
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/80 focus:bg-white dark:focus:bg-neutral-900 transition-all"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/80 focus:bg-white dark:focus:bg-neutral-900 transition-all font-mono"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold tracking-tight hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </p>

          <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-3 flex items-center justify-center gap-1.5">
            <span>256-bit encrypted security</span>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

