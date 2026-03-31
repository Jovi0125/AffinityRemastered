"use client";

import { useRouter } from "next/navigation";
import { RevealSection } from "@/components/ui/RevealSection";

export function CtaSection() {
  const router = useRouter();

  return (
    <section
      style={{
        padding: "10rem 0", backgroundColor: "#0a0a0a",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      <RevealSection>
        <div style={{ position: "relative" }}>
          <p
            className="font-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 5rem)", fontWeight: 500,
              color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.5rem",
            }}
          >
            Your people
            <br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>
              are already here.
            </span>
          </p>
          <p
            style={{
              fontSize: "1rem", color: "rgba(255,255,255,0.35)",
              marginBottom: "3rem", fontWeight: 300,
            }}
          >
            Join 200,000 members who found their people through shared interests.
          </p>
          <button
            onClick={() => router.push("/explore")}
            className="transition-opacity hover:opacity-80"
            style={{
              fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.06em",
              padding: "1rem 2.75rem", backgroundColor: "#fff", color: "#0a0a0a",
              border: "none", borderRadius: "2px", cursor: "pointer",
            }}
          >
            GET STARTED — IT&apos;S FREE
          </button>
        </div>
      </RevealSection>
    </section>
  );
}
