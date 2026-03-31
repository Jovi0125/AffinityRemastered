"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { RevealSection } from "@/components/ui/RevealSection";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { profiles } from "@/data/profiles";

export function DiscoverSection() {
  const router = useRouter();

  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <RevealSection>
            <p
              style={{
                fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem",
              }}
            >
              01 — Discover
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "1.5rem",
              }}
            >
              Discover people
              <br />
              <span style={{ fontStyle: "italic", color: "#888" }}>who get you.</span>
            </h2>
            <p
              style={{
                fontSize: "1rem", color: "#666", lineHeight: 1.75,
                maxWidth: 420, fontWeight: 300, marginBottom: "2.5rem",
              }}
            >
              Browse profiles built around passions, not personas.
              Every person on Affinity is here to connect through what they genuinely love.
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.06em",
                color: "#0a0a0a", background: "none", border: "none",
                padding: 0, cursor: "pointer", textTransform: "uppercase",
              }}
            >
              Browse profiles <ArrowRight size={13} />
            </button>
          </RevealSection>

          <RevealSection delay={150} className="flex flex-col gap-4">
            {profiles.slice(0, 3).map((p) => (
              <ProfileCard key={p.id} profile={p} variant="default" />
            ))}
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
