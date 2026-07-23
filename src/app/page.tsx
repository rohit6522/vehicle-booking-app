"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { FleetSection } from "@/components/marketing/FleetSection";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = (session?.user as any)?.role;

    if (role === "driver") router.replace("/driver/dashboard");
    else if (role === "admin") router.replace("/admin/dashboard");
    // riders stay right here on the marketing page
  }, [status, session, router]);

  // Riders (and logged-out visitors) see the normal landing page.
  // Drivers/admins briefly see this while the redirect above kicks in.
  return (
    <>
      <Navbar />
      <Hero />
      <FleetSection />
      <Footer />
    </>
  );
}