"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseProfile } from "@/data/profiles";

function HeroFloatingCard({
  name,
  location,
  avatar,
  interests,
  style,
  animationName,
}: {
  name: string;
  location: string;
  avatar: string;
  interests: string[];
  style: React.CSSProperties;
  animationName: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "6px",
        backgroundColor: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
        padding: "1.125rem",
        animation: `${animationName} ${animationName === "float1" ? "6s" : animationName === "float2" ? "7s" : "8s"} ease-in-out infinite`,
        ...style,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={avatar}
          alt={name}
          width={36}
          height={36}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#fff" }}>
            {name}
          </p>
          <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)" }}>
            {location}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {interests.slice(0, 2).map((interest) => (
          <span
            key={interest}
            style={{
              fontSize: "0.625rem",
              padding: "0.15rem 0.45rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "2px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}

const cardPositions = [
  { animationName: "float1", style: { top: 0, left: 40, width: 200 } },
  { animationName: "float2", style: { top: 120, right: 0, width: 210 } },
  { animationName: "float3", style: { bottom: 20, left: 20, width: 195 } },
] as const;

function useRealProfiles() {
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfiles = async () => {
      // Fetch all profiles, then randomly pick up to 3 client-side
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests");

      if (data && data.length > 0) {
        // Shuffle and take up to 3
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setProfiles(shuffled.slice(0, 3) as SupabaseProfile[]);
      }
    };

    fetchProfiles();
  }, []);

  return profiles;
}

export function HeroCards() {
  const profiles = useRealProfiles();

  if (profiles.length === 0) return null;

  return (
    <div
      className="relative hidden lg:block"
      style={{ width: 380, height: 440, flexShrink: 0 }}
    >
      {profiles.map((p, i) => (
        <HeroFloatingCard
          key={p.id}
          name={p.full_name || "Anonymous"}
          location={p.location || "Unknown"}
          avatar={p.avatar_url || ""}
          interests={p.interests || []}
          animationName={cardPositions[i].animationName}
          style={cardPositions[i].style as React.CSSProperties}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.4)",
          animation: "pulse-dot 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function HeroMiniAvatars() {
  const profiles = useRealProfiles();

  if (profiles.length === 0) return null;

  return (
    <div className="flex items-center gap-4 mt-10">
      <div className="flex" style={{ marginRight: "0.5rem" }}>
        {profiles.map((p, i) => (
          <img
            key={p.id}
            src={p.avatar_url || ""}
            alt={p.full_name || "User"}
            width={28}
            height={28}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #0a0a0a",
              marginLeft: i === 0 ? 0 : -8,
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)" }}>
        Join 200,000+ members who found their people
      </p>
    </div>
  );
}
