"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { RevealSection } from "@/components/ui/RevealSection";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { demoProfiles } from "@/data/profiles";

export function CommunitySection() {
  const router = useRouter();

  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <p
                style={{
                  fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                  color: "#bbb", textTransform: "uppercase", marginBottom: "1.25rem",
                }}
              >
                Community
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                  color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em",
                }}
              >
                Meet people
                <br />
                <span style={{ fontStyle: "italic", color: "#999" }}>on Affinity.</span>
              </h2>
            </div>
            <button
              onClick={() => router.push("/explore")}
              className="flex items-center gap-2 transition-opacity hover:opacity-60 self-start md:self-end"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.06em",
                color: "#0a0a0a", background: "none", border: "none",
                padding: 0, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap",
              }}
            >
              View all profiles <ArrowRight size={13} />
            </button>
          </div>
        </RevealSection>

        <RevealSection delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoProfiles.map((p) => (
              <ProfileCard key={p.id} profile={p} variant="featured" />
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
