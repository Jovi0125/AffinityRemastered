"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseProfile } from "@/data/profiles";

function useRealProfiles(count = 3) {
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests");

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setProfiles(shuffled.slice(0, count) as SupabaseProfile[]);
      }
    };

    fetchProfiles();
  }, [count]);

  return profiles;
}

export function HeroImage() {
  const profiles = useRealProfiles(2);

  // Use first 2 profiles to show real faces
  const avatars = profiles.map((p) => p.avatar_url).filter(Boolean);

  return (
    <div
      className="relative hidden lg:block"
      style={{ width: 420, height: 460, flexShrink: 0 }}
    >
      {/* Main hero container with rounded corners */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        {avatars.length > 0 ? (
          <img
            src={avatars[0]!}
            alt="Companion"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 50%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "3rem", opacity: 0.3 }}>✦</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Small floating card */}
      {profiles.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: -30,
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "0.875rem 1.125rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "float2 7s ease-in-out infinite",
          }}
        >
          {profiles[1].avatar_url ? (
            <img
              src={profiles[1].avatar_url}
              alt={profiles[1].full_name || ""}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.875rem", fontWeight: 600, color: "#fff",
            }}>
              {(profiles[1].full_name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1a1a2e" }}>
              {profiles[1].full_name || "User"}
            </p>
            <p style={{ fontSize: "0.6875rem", color: "#7c3aed", fontWeight: 500 }}>
              {profiles[1].interests?.[0] || "Companion"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroMiniAvatars() {
  const profiles = useRealProfiles(4);

  if (profiles.length === 0) return null;

  return (
    <div className="flex items-center gap-4 mt-10">
      <div className="flex" style={{ marginRight: "0.5rem" }}>
        {profiles.map((p, i) =>
          p.avatar_url ? (
            <img
              key={p.id}
              src={p.avatar_url}
              alt={p.full_name || "User"}
              width={32}
              height={32}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #fff",
                marginLeft: i === 0 ? 0 : -10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <div
              key={p.id}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6875rem", fontWeight: 600, color: "#fff",
                border: "2px solid #fff",
                marginLeft: i === 0 ? 0 : -10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {(p.full_name || "U").charAt(0).toUpperCase()}
            </div>
          )
        )}
      </div>
      <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
        Join <span style={{ fontWeight: 600, color: "#7c3aed" }}>200,000+</span> members who found their people
      </p>
    </div>
  );
}

// Keep re-export for backward compatibility
export { HeroImage as HeroCards };
