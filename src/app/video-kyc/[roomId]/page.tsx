"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Video, VideoOff, Mic, MicOff, Check, X, PhoneOff } from "lucide-react";

export default function VideoKycRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const roomId = params.roomId as string;
  const driverId = roomId.replace(/^kyc-/, "");

  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  const [joined, setJoined] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);

  // Live camera/mic preview before joining the call.
  useEffect(() => {
    if (joined) return;

    let cancelled = false;

    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        previewStreamRef.current = stream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Could not access camera/mic:", err);
        setError("Camera/microphone permission denied.");
      }
    }

    startPreview();

    return () => {
      cancelled = true;
      previewStreamRef.current?.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
    };
  }, [joined]);

  // Reflect toggle state onto the actual preview tracks.
  useEffect(() => {
    const stream = previewStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = camOn));
    stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [camOn, micOn]);

  useEffect(() => {
    if (!joined || !session?.user) return;

    // Preview stream's job is done — the call widget manages its own stream.
    previewStreamRef.current?.getTracks().forEach((t) => t.stop());
    previewStreamRef.current = null;

    let cancelled = false;

    async function joinCall() {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET_TEST_ONLY!;
      const userId = (session!.user as any).id;
      const userName = session!.user!.name ?? "User";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      if (cancelled) return;
      zpRef.current = zp;

      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showScreenSharingButton: false,
        showPreJoinView: false,
        turnOnCameraWhenJoining: camOn,
        turnOnMicrophoneWhenJoining: micOn,
      });
    }

    joinCall();

    return () => {
      cancelled = true;
      zpRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, session, roomId]);


  // Partner side: poll status and leave automatically once admin has
  // acted (approved/rejected), even if this tab is stuck on the pre-join
  // screen due to a camera/mic permission issue.
  useEffect(() => {
    if (isAdmin || !session?.user) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/partner/status");
      if (!res.ok) return;
      const data = await res.json();

      if (data.kycStatus === "approved" || data.kycStatus === "rejected") {
        zpRef.current?.destroy();
        router.push("/become-a-partner");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAdmin, session, router]);
  
  function handleEndCall() {
    zpRef.current?.destroy();
    router.push(isAdmin ? "/admin/dashboard" : "/become-a-partner");
  }

  async function handleDecision(action: "approve" | "reject") {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/kyc/${driverId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      zpRef.current?.destroy();
      router.push("/admin/dashboard");
    } finally {
      setProcessing(false);
    }
  }

  // Custom branded pre-join screen with a REAL live preview.
  if (!joined) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-8">
        <div>
          <h1 className="text-lg font-black tracking-tight">RYDEX</h1>
          <p className="text-sm text-neutral-400">
            {isAdmin ? "Admin Verification" : "Vendor Video KYC"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 mt-16 max-w-4xl mx-auto">
          <div className="w-full lg:w-1/2 aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative flex items-center justify-center">
            <video
              ref={previewVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover -scale-x-100 ${camOn ? "" : "hidden"}`}
            />
            {!camOn && (
              <span className="text-neutral-500 text-sm">Camera is off</span>
            )}
          </div>

          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-black mb-6">Secure Video KYC</h2>

            {error && (
              <p className="text-sm text-red-400 mb-4">{error}</p>
            )}

            <div className="flex items-center gap-3 mb-8">

              <button
                onClick={() => setCamOn((v) => !v)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
                  camOn
                    ? "border-white/20 hover:bg-white/10"
                    : "bg-red-500 border-red-500"
                }`}
                title={camOn ? "Turn camera off" : "Turn camera on"}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button
                onClick={() => setMicOn((v) => !v)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
                  micOn
                    ? "border-white/20 hover:bg-white/10"
                    : "bg-red-500 border-red-500"
                }`}
                title={micOn ? "Mute microphone" : "Unmute microphone"}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
            </div>

            <button
              onClick={() => setJoined(true)}
              className="w-full py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
            >
              Join Secure Call
            </button>

          </div>
        </div>
      </main>
    );
  }

  // In-call view: Zego widget + our branded header/controls overlaid
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-black z-10">
        <div>
          <h1 className="text-white font-black text-sm tracking-tight">RYDEX</h1>
          <p className="text-xs text-neutral-400">
            {isAdmin ? "Admin Verification" : "Vendor Video KYC"}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {error && (
            <span className="text-xs text-red-400 whitespace-nowrap flex-shrink-0">
              {error}
            </span>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => handleDecision("approve")}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-emerald-500 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 flex-shrink-0"
              >
                <Check size={14} /> Approve
              </button>
              <button
                onClick={() => handleDecision("reject")}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-red-500 text-white text-xs sm:text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex-shrink-0"
              >
                <X size={14} /> Reject
              </button>
            </>
          )}
          <button
            onClick={handleEndCall}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-neutral-700 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-600 flex-shrink-0"
          >
            <PhoneOff size={14} /> End Call
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1" />
    </div>
  );
}