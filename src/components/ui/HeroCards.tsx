import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { profiles } from "@/data/profiles";

function HeroFloatingCard({
  profile,
  style,
  animationName,
}: {
  profile: (typeof profiles)[0];
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
        <Image
          src={profile.avatar}
          alt={profile.name}
          width={36}
          height={36}
          style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }}
        />
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#fff" }}>
            {profile.name}
          </p>
          <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)" }}>
            {profile.location}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {profile.interests.slice(0, 2).map((interest) => (
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

export function HeroCards() {
  return (
    <div
      className="relative hidden lg:block"
      style={{ width: 380, height: 440, flexShrink: 0 }}
    >
      <HeroFloatingCard
        profile={profiles[0]}
        animationName="float1"
        style={{ top: 0, left: 40, width: 200 }}
      />
      <HeroFloatingCard
        profile={profiles[1]}
        animationName="float2"
        style={{ top: 120, right: 0, width: 210 }}
      />
      <HeroFloatingCard
        profile={profiles[2]}
        animationName="float3"
        style={{ bottom: 20, left: 20, width: 195 }}
      />
      {/* Connection dot */}
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
  return (
    <div className="flex items-center gap-4 mt-10">
      <div className="flex" style={{ marginRight: "0.5rem" }}>
        {profiles.slice(0, 4).map((p, i) => (
          <Image
            key={p.id}
            src={p.avatar}
            alt={p.name}
            width={28}
            height={28}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              filter: "grayscale(100%)",
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
