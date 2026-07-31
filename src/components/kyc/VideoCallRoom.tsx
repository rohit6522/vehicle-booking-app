"use client";

import { useEffect, useRef } from "react";

export function VideoCallRoom({
  roomId,
  userId,
  userName,
}: {
  roomId: string;
  userId: string;
  userName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let zp: any;

    async function joinCall() {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET_TEST_ONLY!;

      // NOTE: generateKitTokenForTest is for development only. For a real
      // production launch, generate this token on the server using
      // ZegoCloud's token04 algorithm instead of exposing the secret here.
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userId,
        userName
      );

      zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showScreenSharingButton: false,
        showPreJoinView: true,
      });
    }

    joinCall();

    return () => {
      zp?.destroy();
    };
  }, [roomId, userId, userName]);

  return <div ref={containerRef} className="w-full h-[600px] rounded-2xl overflow-hidden" />;
}