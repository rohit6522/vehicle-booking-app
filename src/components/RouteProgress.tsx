"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);
  if (!loading) return null;
  return <div className="fixed top-0 left-0 right-0 h-0.5 bg-black z-[100] animate-pulse" />;
}