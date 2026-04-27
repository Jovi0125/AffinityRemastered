"use client";

import React, { useState, useEffect } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack
} from "agora-rtc-react";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface CallModalProps {
  isOpen: boolean;
  isIncoming: boolean;
  partnerName: string;
  partnerAvatar: string | null;
  channelName: string | null;
  token: string | null;
  appId: string | null;
  uid: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
}

export function CallModal(props: CallModalProps) {
  if (!props.isOpen) return null;

  return (
    <AgoraRTCProvider client={client}>
      <CallModalContent {...props} />
    </AgoraRTCProvider>
  );
}

function CallModalContent({
  isIncoming,
  partnerName,
  partnerAvatar,
  channelName,
  token,
  appId,
  uid,
  onAccept,
  onDecline,
  onEnd,
}: Omit<CallModalProps, "isOpen">) {
  const { theme } = useTheme();
  const dk = theme === "dark";

  // If we have a token, appId, channelName, and uid, and it's NOT an incoming call waiting to be accepted, we join.
  const isReadyToJoin = Boolean(channelName && token && appId && uid && !isIncoming);

  useJoin(
    { appid: appId || "", channel: channelName || "", token: token, uid: uid || "" },
    isReadyToJoin
  );

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Only request media if we are actively calling or have accepted the call.
  // This prevents mobile Safari from blocking the camera request because it lacked a user gesture.
  const shouldRequestMedia = !isIncoming;

  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(shouldRequestMedia && micOn);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(shouldRequestMedia && cameraOn);

  // Publish tracks if ready (safely filter out nulls)
  const tracksToPublish = [localMicrophoneTrack, localCameraTrack].filter(Boolean) as any[];
  usePublish(tracksToPublish);

  const remoteUsers = useRemoteUsers();

  const getInitials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // INCOMING CALL UI
  if (isIncoming) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          backgroundColor: dk ? "#16181c" : "#fff",
          padding: "2rem", borderRadius: "24px", textAlign: "center",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)", minWidth: "320px",
          border: `1px solid ${dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
        }}>
          {partnerAvatar ? (
            <img src={partnerAvatar} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", margin: "0 auto 1.5rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: "50%", margin: "0 auto 1.5rem",
              background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 600, color: "#7c3aed", boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
            }}>
              {getInitials(partnerName)}
            </div>
          )}
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: dk ? "#e7e9ea" : "#1a1a2e", marginBottom: "0.5rem" }}>
            {partnerName}
          </h2>
          <p style={{ fontSize: "1rem", color: "#a1a1aa", marginBottom: "2.5rem", animation: "pulse 2s infinite" }}>
            Incoming Video Call...
          </p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
            <button onClick={onDecline} style={{
              width: 64, height: 64, borderRadius: "50%", backgroundColor: "#ef4444",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)", transition: "transform 0.2s"
            }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <PhoneOff size={28} />
            </button>
            <button onClick={onAccept} style={{
              width: 64, height: 64, borderRadius: "50%", backgroundColor: "#22c55e",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)", transition: "transform 0.2s"
            }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <Phone size={28} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OUTGOING / IN-CALL UI
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "#000", zIndex: 9999, display: "flex", flexDirection: "column"
    }}>
      <div style={{ flex: 1, position: "relative", backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        {/* Remote Video Array */}
        {remoteUsers.length > 0 ? (
          <div style={{ width: "100%", height: "100%", display: "flex", flexWrap: "wrap" }}>
            {remoteUsers.map((user) => (
              <div key={user.uid} style={{ flex: 1, minWidth: "50%", height: "100%", position: "relative" }}>
                <RemoteUser user={user} playVideo={true} playAudio={true} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, backgroundColor: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: "12px", color: "#fff", fontSize: "0.875rem" }}>
                  {partnerName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%", margin: "0 auto 1.5rem",
              background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem", fontWeight: 600, color: "#7c3aed"
            }}>
              {getInitials(partnerName)}
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{partnerName}</h2>
            <p style={{ color: "#aaa" }}>{token ? `Waiting for them to join...` : "Calling..."}</p>
          </div>
        )}

        {/* Local Video Picture-in-Picture */}
        {cameraOn && localCameraTrack ? (
          <div style={{
            position: "absolute", bottom: 24, right: 24, width: 160, height: 240,
            borderRadius: "16px", overflow: "hidden", backgroundColor: "#222",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.1)"
          }}>
            <LocalVideoTrack track={localCameraTrack} play={true} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (cameraOn && camError) ? (
          <div style={{
            position: "absolute", bottom: 24, right: 24, width: 160, height: 240,
            borderRadius: "16px", overflow: "hidden", backgroundColor: "#222",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)", border: "2px solid #ef4444",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center"
          }}>
            <p style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 600 }}>Camera Blocked or Not Found</p>
          </div>
        ) : null}
      </div>

      {/* Call Controls Bar */}
      <div style={{
        padding: "1.5rem", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
        display: "flex", justifyContent: "center", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)"
      }}>
        <button onClick={() => setMicOn(!micOn)} style={{
          width: 56, height: 56, borderRadius: "50%",
          backgroundColor: micOn ? "rgba(255,255,255,0.1)" : "#ef4444",
          border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s"
        }}>
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button onClick={() => setCameraOn(!cameraOn)} style={{
          width: 56, height: 56, borderRadius: "50%",
          backgroundColor: cameraOn ? "rgba(255,255,255,0.1)" : "#ef4444",
          border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s"
        }}>
          {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button onClick={onEnd} style={{
          width: 56, height: 56, borderRadius: "50%", backgroundColor: "#ef4444",
          border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)", transition: "transform 0.2s"
        }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
