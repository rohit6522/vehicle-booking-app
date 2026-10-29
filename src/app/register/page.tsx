"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "rider" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        toast.error(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Account created — please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Create an account
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Join thousands of riders booking vehicles in seconds
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
            <span>Sign up with Google</span>
          </motion.button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              OR EMAIL
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/80 focus:bg-white dark:focus:bg-neutral-900 transition-all"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Create password (min 8 chars)"
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="space-y-1 pt-0.5">
                <div className="flex justify-between items-center text-[10px] text-neutral-500 font-medium">
                  <span>Security Strength</span>
                  <span className={pwStrength >= 3 ? "text-emerald-500 font-semibold" : "text-amber-500"}>
                    {pwStrength <= 1 ? "Weak" : pwStrength <= 3 ? "Medium" : "Strong"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-colors ${
                        pwStrength >= step
                          ? pwStrength >= 3
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                          : "bg-neutral-200 dark:bg-neutral-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </p>

          <p className="text-center text-[11px] text-neutral-400 mt-3 leading-relaxed">
            By signing up, you agree to RYDEX Terms and Privacy Policy.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

