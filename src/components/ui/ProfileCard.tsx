"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InterestTag } from "@/components/ui/InterestTag";
import type { Profile } from "@/data/profiles";

interface ProfileCardProps {
  profile: Profile;
  variant?: "default" | "featured" | "compact";
}

export function ProfileCard({ profile, variant = "default" }: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);

  if (variant === "compact") {
    return (
      <Link href={`/profile/${profile.id}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex items-center gap-3 cursor-pointer"
          style={{
            padding: "0.875rem 1rem",
            border: "1px solid",
            borderColor: hovered ? "#0a0a0a" : "#E8E8E8",
            borderRadius: "4px",
            transition: "all 0.2s ease",
            backgroundColor: hovered ? "#FAFAFA" : "#fff",
          }}
        >
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.1rem" }}>
              {profile.name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.interests.slice(0, 2).join(" · ")}
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
            border: "1px solid",
            borderColor: hovered ? "#0a0a0a" : "#E8E8E8",
            borderRadius: "4px",
            transition: "all 0.3s ease",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ position: "relative", overflow: "hidden", paddingBottom: "75%" }}>
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{
                objectFit: "cover",
                filter: "grayscale(100%)",
                transform: hovered ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}
            />
            {profile.mutuals !== undefined && (
              <div
                style={{
                  position: "absolute",
                  top: "0.75rem",
                  right: "0.75rem",
                  backgroundColor: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(6px)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "2px",
                  fontSize: "0.6875rem",
                  color: "#0a0a0a",
                  fontWeight: 500,
                }}
              >
                {profile.mutuals} mutual
              </div>
            )}
          </div>
          <div style={{ padding: "1.125rem" }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.2rem" }}>
              {profile.name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.875rem", fontWeight: 400 }}>
              {profile.location}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 3).map((interest) => (
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
          border: "1px solid",
          borderColor: hovered ? "#0a0a0a" : "#E8E8E8",
          borderRadius: "4px",
          padding: "1.5rem",
          transition: "all 0.2s ease",
          backgroundColor: "#fff",
        }}
      >
        <div className="flex items-start gap-4">
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={56}
            height={56}
            style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)", flexShrink: 0 }}
          />
          <div>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.125rem" }}>
              {profile.name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.75rem" }}>
              {profile.location}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 3).map((interest) => (
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
