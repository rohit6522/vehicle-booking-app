"use client";
import { useEffect } from "react";
import { toast } from "sonner";
export function NetworkStatus() {
  useEffect(() => {
    function offline() { toast.error("You're offline"); }
    function online() { toast.success("Back online"); }
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => { window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, []);
  return null;
}