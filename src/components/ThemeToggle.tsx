"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ dark = true }: { dark?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
        dark
          ? "border-white/15 text-white hover:bg-white/10"
          : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}