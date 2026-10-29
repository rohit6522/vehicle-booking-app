"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Password strength calculation for sign up
  const getPasswordStrength = () => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength();

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
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back!");
    onClose();
    router.refresh();
  }

  async function handleRegisterDirect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "rider" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Account created — please log in.");
        setMode("login");
        return;
      }

      toast.success("Account created successfully!");
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
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
        toast.error(data.error ?? "Invalid OTP");
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

      toast.success("Account created successfully!");
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer border-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px] bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-2xl p-7 sm:p-8 overflow-hidden text-neutral-900 dark:text-neutral-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center tracking-tighter">
                  RDX
                </span>
                <span className="font-extrabold text-xl tracking-tight font-heading">
                  RYDEX
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {mode === "login"
                  ? "Welcome back — log in to continue"
                  : mode === "register"
                  ? "Join RYDEX in seconds for on-demand rides"
                  : "Email verification required"}
              </p>
            </div>

            {/* Tabs for Login vs Register */}
            {mode !== "verify-otp" && (
              <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Google OAuth Button */}
            {mode !== "verify-otp" && (
              <>
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
              </>
            )}

            <AnimatePresence mode="wait">
              {/* LOGIN FORM */}
              {mode === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
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
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email: e.target.value.trim().toLowerCase(),
                          })
                        }
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
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/80 focus:bg-white dark:focus:bg-neutral-900 transition-all font-mono"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Inline Error */}
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

                  <div className="text-center text-xs text-neutral-500 mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-1.5">
                    <span>Protected by 256-bit encryption</span>
                    <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                </motion.div>
              )}

              {/* REGISTER FORM */}
              {mode === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleRegisterDirect} className="space-y-3.5">
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
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
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value.trim().toLowerCase() })
                        }
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
                        placeholder="Create password (min 8 characters)"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/80 focus:bg-white dark:focus:bg-neutral-900 transition-all font-mono"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {form.password.length > 0 && (
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

                    {/* Inline Error */}
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

                  <p className="text-center text-[11px] text-neutral-400 mt-4 leading-relaxed">
                    By signing up, you agree to RYDEX Terms of Service and Privacy Policy.
                  </p>
                </motion.div>
              )}

              {/* OTP VERIFICATION */}
              {mode === "verify-otp" && (
                <motion.div
                  key="verify-otp"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} className="text-black dark:text-white" />
                    <h3 className="text-base font-bold text-black dark:text-white font-heading">
                      Verify your email
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">
                    Enter the 6-digit verification code sent to{" "}
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {form.email}
                    </span>
                  </p>
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 text-center tracking-[0.4em] font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />

                    {error && (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </motion.button>
                  </form>
                  <p className="text-center text-xs text-neutral-500 mt-4">
                    Wrong email address?{" "}
                    <button
                      onClick={() => {
                        setOtp("");
                        switchMode("register");
                      }}
                      className="font-bold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Change email
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
