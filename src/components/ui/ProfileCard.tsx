"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
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

function getSubtitle(p: ProfileInput): string {
  const interests = p.interests || [];
  if (interests.length >= 2) return `${interests[0]} & ${interests[1]}`;
  if (interests.length === 1) return interests[0];
  return p.location || "Companion";
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
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.35,
            fontWeight: 600,
            color: "#7c3aed",
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

function RatingBadge({ score }: { score: number }) {
  // Convert affinity score (0-100) to a 4.0-5.0 star rating
  const rating = Math.min(5.0, Math.max(4.0, 4.0 + (score / 100))).toFixed(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "3px",
        padding: "0.25rem 0.5rem",
        borderRadius: "12px",
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Star size={11} fill="#facc15" color="#facc15" />
      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#fff" }}>{rating}</span>
    </div>
  );
}

export function ProfileCard({ profile, variant = "default" }: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const { profile: myProfile, user } = useAuth();
  const name = getName(profile);
  const interests = profile.interests || [];
  const lastSeenAt = getLastSeen(profile);
  const subtitle = getSubtitle(profile);

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
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "16px",
            transition: "all 0.2s ease",
            backgroundColor: hovered ? "#f5f3ff" : "#fff",
            boxShadow: hovered ? "0 4px 16px rgba(124,58,237,0.08)" : "var(--shadow-sm)",
          }}
        >
          <Avatar src={getAvatar(profile)} name={name} size={42} lastSeenAt={lastSeenAt} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1a1a2e", marginBottom: "0.1rem" }}>
              {name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {interests.slice(0, 2).join(" · ")}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer overflow-hidden"
        style={{
          borderRadius: "20px",
          transition: "all 0.3s ease",
          backgroundColor: "#fff",
          boxShadow: hovered ? "0 8px 32px rgba(124,58,237,0.12)" : "var(--shadow-card)",
          transform: hovered ? "translateY(-4px)" : "none",
          overflow: "hidden",
        }}
      >
        {/* Image container */}
        <div style={{ position: "relative", overflow: "hidden", paddingBottom: "80%" }}>
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
                transform: hovered ? "scale(1.05)" : "scale(1)",
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
                background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 50%, #a78bfa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                fontWeight: 600,
                color: "#7c3aed",
              }}
            >
              {(name || "?").charAt(0).toUpperCase()}
            </div>
          )}

          {/* Rating badge */}
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <RatingBadge score={affinityScore} />
          </div>

          {/* Online indicator */}
          {lastSeenAt && isUserOnline(lastSeenAt) && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
              <span style={{ fontSize: "0.625rem", color: "#fff", fontWeight: 500 }}>Online</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
          {/* Category tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {interests.slice(0, 2).map((interest) => (
              <InterestTag
                key={interest}
                label={interest}
                size="sm"
                filled={myInterests.includes(interest)}
              />
            ))}
          </div>

          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "0.15rem" }}>
            {name}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#7c3aed", marginBottom: "0.625rem", fontWeight: 500 }}>
            {subtitle}
          </p>

          {profile.bio && (
            <p style={{
              fontSize: "0.8125rem",
              color: "#71717a",
              lineHeight: 1.5,
              marginBottom: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
            }}>
              {profile.bio}
            </p>
          )}

          <Link
            href={`/profile/${profile.id}`}
            style={{ textDecoration: "none" }}
          >
            <button
              className="w-full transition-all duration-200"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                padding: "0.6rem",
                backgroundColor: "transparent",
                color: "#7c3aed",
                border: "1.5px solid #7c3aed",
                borderRadius: "12px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#7c3aed";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#7c3aed";
              }}
            >
              View Profile
            </button>
          </Link>
        </div>
      </div>
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
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: "20px",
          padding: "1.5rem",
          transition: "all 0.2s ease",
          backgroundColor: "#fff",
          boxShadow: hovered ? "0 8px 32px rgba(124,58,237,0.1)" : "var(--shadow-sm)",
        }}
      >
        <div className="flex items-start gap-4">
          <Avatar src={getAvatar(profile)} name={name} size={56} lastSeenAt={lastSeenAt} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "0.125rem" }}>
              {name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#7c3aed", marginBottom: "0.75rem", fontWeight: 500 }}>
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
            style={{ fontSize: "0.8125rem", color: "#71717a", lineHeight: 1.65, borderTop: "1px solid rgba(0,0,0,0.04)" }}
          >
            {profile.bio}
          </p>
        )}
      </div>
    </Link>
  );
}
