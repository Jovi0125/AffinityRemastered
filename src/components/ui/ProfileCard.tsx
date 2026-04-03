"use client";

import { useState } from "react";
import Link from "next/link";
import { InterestTag } from "@/components/ui/InterestTag";
import type { SupabaseProfile, DemoProfile } from "@/data/profiles";

type ProfileInput = SupabaseProfile | DemoProfile;

function getName(p: ProfileInput): string {
  return ("full_name" in p ? p.full_name : p.name) || "Anonymous";
}

function getAvatar(p: ProfileInput): string | null {
  return "avatar_url" in p ? p.avatar_url : p.avatar || null;
}

interface ProfileCardProps {
  profile: ProfileInput;
  variant?: "default" | "featured" | "compact";
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
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
    );
  }

  return (
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
  );
}

export function ProfileCard({ profile, variant = "default" }: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const name = getName(profile);
  const interests = profile.interests || [];

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
          <Avatar src={getAvatar(profile)} name={name} size={40} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.1rem" }}>
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
                <InterestTag key={interest} label={interest} size="sm" />
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
          <Avatar src={getAvatar(profile)} name={name} size={56} />
          <div>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.125rem" }}>
              {name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.75rem" }}>
              {profile.location || "Unknown"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.slice(0, 3).map((interest) => (
                <InterestTag key={interest} label={interest} size="sm" />
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
