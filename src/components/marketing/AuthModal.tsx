"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

type Mode = "login" | "register" | "verify-otp";

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

export function AuthModal({
  open,
  initialMode = "login",
  onClose,
}: {
  open: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    onClose();
    router.refresh();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setMode("verify-otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid OTP");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created — please log in.");
        setMode("login");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setError("");
    setMode(next);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.button
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black tracking-tight text-black">RYDEX</h2>
              <p className="text-sm text-neutral-500 mt-1">Premium Vehicle Booking</p>
            </div>

            {mode !== "verify-otp" && (
              <>
                <motion.button
                  onClick={handleGoogle}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>

                <div className="flex items-center gap-3 my-6">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-xs text-neutral-400">OR</span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <h3 className="text-lg font-bold text-black mb-4">Welcome back</h3>
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 overflow-hidden"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Please wait..." : "Login"}
                    </motion.button>
                  </form>
                  <p className="text-center text-sm text-neutral-500 mt-5">
                    Don&apos;t have an account?{" "}
                    <button onClick={() => switchMode("register")} className="font-semibold text-black">
                      Sign up
                    </button>
                  </p>
                </motion.div>
              )}

              {mode === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <h3 className="text-lg font-bold text-black mb-4">Create account</h3>
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 overflow-hidden"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </motion.button>
                  </form>
                  <p className="text-center text-sm text-neutral-500 mt-5">
                    Already have an account?{" "}
                    <button onClick={() => switchMode("login")} className="font-semibold text-black">
                      Login
                    </button>
                  </p>
                </motion.div>
              )}

              {mode === "verify-otp" && (
                <motion.div
                  key="verify-otp"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} className="text-black" />
                    <h3 className="text-lg font-bold text-black">Verify your email</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mb-5">
                    We sent a 6-digit code to <span className="font-medium text-black">{form.email}</span>
                  </p>
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <motion.input
                      key={otp.length}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1.03, 1] }}
                      transition={{ duration: 0.15 }}
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 rounded-full border border-neutral-200 text-sm text-center tracking-[0.4em] font-semibold placeholder:text-neutral-400 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-black"
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 overflow-hidden"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify & Create Account"}
                    </motion.button>
                  </form>
                  <p className="text-center text-sm text-neutral-500 mt-5">
                    Wrong email?{" "}
                    <button
                      onClick={() => {
                        setOtp("");
                        switchMode("register");
                      }}
                      className="font-semibold text-black"
                    >
                      Go back
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}