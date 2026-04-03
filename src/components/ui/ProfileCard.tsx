"use client";

import { useState } from "react";
import Link from "next/link";
import { InterestTag } from "@/components/ui/InterestTag";
import { OnlineIndicator, isUserOnline } from "@/components/ui/OnlineIndicator";
import { useAuth } from "@/components/providers/AuthProvider";
import { calculateAffinityScore } from "@/hooks/useAffinityScore";
import type { SupabaseProfile, DemoProfile } from "@/data/profiles";

type ProfileInput = SupabaseProfile | DemoProfile;

function getName(p: ProfileInput): string {
  return ("full_name" in p ? p.full_name : p.name) || "Anonymous";
}

function getAvatar(p: ProfileInput): string | null {
  return "avatar_url" in p ? p.avatar_url : p.avatar || null;
}

function getLastSeen(p: ProfileInput): string | null {
  return "last_seen_at" in p ? (p as SupabaseProfile & { last_seen_at?: string }).last_seen_at || null : null;
}

interface ProfileCardProps {
  profile: ProfileInput;
  variant?: "default" | "featured" | "compact";
}

function Avatar({ src, name, size, lastSeenAt }: { src: string | null; name: string; size: number; lastSeenAt?: string | null }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            filter: "none",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.35,
            fontWeight: 600,
            color: "#555",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}
      {lastSeenAt && isUserOnline(lastSeenAt) && (
        <span
          style={{
            position: "absolute",
            bottom: size > 44 ? 2 : 0,
            right: size > 44 ? 2 : 0,
            width: size > 44 ? 12 : 10,
            height: size > 44 ? 12 : 10,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            border: "2px solid #fff",
          }}
        />
      )}
    </div>
  );
}

function AffinityBadge({ score }: { score: number }) {
  if (score <= 0) return null;

  const getColor = (s: number) => {
    if (s >= 60) return { bg: "rgba(34,197,94,0.1)", text: "#16a34a", border: "rgba(34,197,94,0.2)" };
    if (s >= 30) return { bg: "rgba(234,179,8,0.1)", text: "#ca8a04", border: "rgba(234,179,8,0.2)" };
    return { bg: "rgba(156,163,175,0.1)", text: "#6b7280", border: "rgba(156,163,175,0.2)" };
  };

  const colors = getColor(score);

  return (
    <span
      style={{
        fontSize: "0.6875rem",
        fontWeight: 600,
        padding: "0.2rem 0.5rem",
        borderRadius: "10px",
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: "0.01em",
      }}
    >
      {score}% match
    </span>
  );
}

export function ProfileCard({ profile, variant = "default" }: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const { profile: myProfile, user } = useAuth();
  const name = getName(profile);
  const interests = profile.interests || [];
  const lastSeenAt = getLastSeen(profile);

  // Calculate affinity score (only for supabase profiles, not demos)
  const myInterests = myProfile?.interests || [];
  const affinityScore = user && "full_name" in profile
    ? calculateAffinityScore(myInterests, interests)
    : 0;

  if (variant === "compact") {
    return (
      <Link href={`/profile/${profile.id}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex items-center gap-3 cursor-pointer"
          style={{
            padding: "0.875rem 1rem",
            border: "1px solid #EFEFEF",
            borderRadius: "12px",
            transition: "all 0.2s ease",
            backgroundColor: hovered ? "#FAFAFA" : "#fff",
            boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
          }}
        >
          <Avatar src={getAvatar(profile)} name={name} size={40} lastSeenAt={lastSeenAt} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.1rem" }}>
              {name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {interests.slice(0, 2).join(" · ")}
            </p>
          </div>
          {affinityScore > 0 && <AffinityBadge score={affinityScore} />}
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/profile/${profile.id}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="cursor-pointer overflow-hidden"
          style={{
            border: "1px solid #EFEFEF",
            borderRadius: "14px",
            transition: "all 0.3s ease",
            backgroundColor: "#fff",
            boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", overflow: "hidden", paddingBottom: "75%" }}>
            {getAvatar(profile) ? (
              <img
                src={getAvatar(profile)!}
                alt={name}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "none",
                  transform: hovered ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.5s ease",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#E8E8E8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: 600,
                  color: "#999",
                }}
              >
                {(name || "?").charAt(0).toUpperCase()}
              </div>
            )}

            {/* Affinity badge overlay */}
            {affinityScore > 0 && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <AffinityBadge score={affinityScore} />
              </div>
            )}

            {/* Online indicator overlay */}
            {lastSeenAt && isUserOnline(lastSeenAt) && (
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.2rem 0.5rem",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
                <span style={{ fontSize: "0.625rem", color: "#fff", fontWeight: 500 }}>Online</span>
              </div>
            )}
          </div>
          <div style={{ padding: "1.125rem" }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.2rem" }}>
              {name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.875rem", fontWeight: 400 }}>
              {profile.location || "Unknown"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.slice(0, 3).map((interest) => (
                <InterestTag
                  key={interest}
                  label={interest}
                  size="sm"
                  filled={myInterests.includes(interest)}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/profile/${profile.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer"
        style={{
          border: "1px solid #EFEFEF",
          borderRadius: "14px",
          padding: "1.5rem",
          transition: "all 0.2s ease",
          backgroundColor: "#fff",
          boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-start gap-4">
          <Avatar src={getAvatar(profile)} name={name} size={56} lastSeenAt={lastSeenAt} />
          <div style={{ flex: 1 }}>
            <div className="flex items-center justify-between">
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.125rem" }}>
                {name}
              </p>
              {affinityScore > 0 && <AffinityBadge score={affinityScore} />}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.75rem" }}>
              {profile.location || "Unknown"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.slice(0, 3).map((interest) => (
                <InterestTag
                  key={interest}
                  label={interest}
                  size="sm"
                  filled={myInterests.includes(interest)}
                />
              ))}
            </div>
          </div>
        </div>
        {profile.bio && (
          <p
            className="mt-4 pt-4"
            style={{ fontSize: "0.8125rem", color: "#666", lineHeight: 1.65, borderTop: "1px solid #F0F0F0" }}
          >
            {profile.bio}
          </p>
        )}
      </div>
    </Link>
  );
}
