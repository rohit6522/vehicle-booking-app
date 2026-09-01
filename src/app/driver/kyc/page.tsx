"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page used to let drivers self-start a Video KYC call without any
// admin involvement. That flow was replaced by an admin-initiated call
// (Admin Dashboard → Video KYC tab → Start Call), which then shows a
// "Join Call" prompt on the driver's /become-a-partner page. Keeping this
// route around as a redirect so old links/bookmarks don't 404.
export default function DriverKycRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/become-a-partner");
  }, [router]);

  return null;
}