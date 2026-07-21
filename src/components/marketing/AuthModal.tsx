"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

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
  initialMode?: Mode;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  if (!open) return null;

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

  // Note: real OTP verification (SMS/email) is a future-phase enhancement.
  // For now this creates the account directly and logs the user in, so the
  // rest of the flow (KYC, bookings) has something to build on.
  async function handleRegister(e: React.FormEvent) {
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
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8">
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

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">OR</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <h3 className="text-lg font-bold text-black mb-4">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h3>

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-3"
        >
          {mode === "register" && (
            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
              />
            </div>
          )}

          <div className="relative">
            <Mail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="email"
              required
              placeholder={mode === "login" ? "Email" : "Email address"}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-black"
            />
          </div>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-5">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="font-semibold text-black"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-semibold text-black"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}