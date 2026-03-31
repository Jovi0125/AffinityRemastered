"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroCards, HeroMiniAvatars } from "@/components/ui/HeroCards";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left */}
          <div style={{ maxWidth: 640, flex: 1 }}>
            {/* Beta badge */}
            <div
              className="inline-flex items-center gap-2 mb-8"
              style={{
                padding: "0.375rem 0.875rem",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "2px",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: "#fff", display: "inline-block", opacity: 0.7,
                }}
              />
              <span
                style={{
                  fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}
              >
                Now in open beta
              </span>
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                fontWeight: 500,
                color: "#fff",
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                marginBottom: "1.75rem",
              }}
            >
              Find your people
              <br />
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>
                through shared interests.
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
                maxWidth: 480,
                marginBottom: "2.5rem",
                fontWeight: 300,
              }}
            >
              Affinity connects you with companions who share your passions — from
              film photography to minimalist architecture. No algorithms pushing
              engagement. Just real connection.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => router.push("/explore")}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
                style={{
                  fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.04em",
                  padding: "0.875rem 2rem", backgroundColor: "#fff", color: "#0a0a0a",
                  border: "none", borderRadius: "2px", cursor: "pointer",
                }}
              >
                GET STARTED <ArrowRight size={14} />
              </button>
              <button
                onClick={() => router.push("/explore")}
                className="transition-opacity hover:opacity-70"
                style={{
                  fontSize: "0.875rem", fontWeight: 400, letterSpacing: "0.04em",
                  padding: "0.875rem 2rem", backgroundColor: "transparent",
                  color: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", cursor: "pointer",
                }}
              >
                EXPLORE
              </button>
            </div>

            <HeroMiniAvatars />
          </div>

          <HeroCards />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "bounce-chevron 2s ease-in-out infinite" }}
      >
        <ChevronDown size={18} color="rgba(255,255,255,0.3)" />
      </div>
    </section>
  );
}
