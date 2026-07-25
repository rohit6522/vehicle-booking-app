"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { VideoCallRoom } from "@/components/kyc/VideoCallRoom";
import { Video, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function DriverKycPage() {
  const { data: session } = useSession();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/status")
      .then((res) => res.json())
      .then((data) => setKycStatus(data.kycStatus))
      .finally(() => setLoading(false));
  }, []);

  const userId = (session?.user as any)?.id;
  const userName = session?.user?.name ?? "Driver";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black mb-1">Video KYC</h1>
          <p className="text-neutral-500 mb-8">
            Verify your identity with a live video call before going live.
          </p>

          {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : inCall && userId ? (
            <VideoCallRoom
              roomId={`kyc-${userId}`}
              userId={userId}
              userName={userName}
            />
          ) : kycStatus === "approved" ? (
            <StatusCard
              icon={CheckCircle2}
              iconBg="bg-emerald-100 text-emerald-600"
              title="KYC Approved"
              desc="You're verified! You can now accept ride requests."
            />
          ) : kycStatus === "pending" ? (
            <StatusCard
              icon={Clock}
              iconBg="bg-amber-100 text-amber-600"
              title="Under review"
              desc="Your video call has been recorded. An admin will review it shortly."
            />
          ) : kycStatus === "rejected" ? (
            <>
              <StatusCard
                icon={XCircle}
                iconBg="bg-red-100 text-red-500"
                title="KYC Rejected"
                desc="Please try the video verification again."
              />
              <button
                onClick={() => setInCall(true)}
                className="w-full mt-4 py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Video size={16} />
                Retry Video KYC
              </button>
            </>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Video size={22} />
              </div>
              <h2 className="font-bold mb-1">Ready for verification?</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Keep your Aadhaar/ID card handy. Our team will join the call
                to verify your identity live.
              </p>
              <button
                onClick={() => setInCall(true)}
                className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors"
              >
                Start Video KYC
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatusCard({
  icon: Icon,
  iconBg,
  title,
  desc,
}: {
  icon: any;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}