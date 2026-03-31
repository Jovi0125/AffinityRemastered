"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { RevealSection } from "@/components/ui/RevealSection";
import { ChatPreview } from "@/components/ui/ChatPreview";

export function ConnectSection() {
  const router = useRouter();

  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <RevealSection delay={100}>
            <ChatPreview />
          </RevealSection>

          <RevealSection>
            <p
              style={{
                fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem",
              }}
            >
              03 — Connect
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "1.5rem",
              }}
            >
              Conversations
              <br />
              <span style={{ fontStyle: "italic", color: "#888" }}>worth having.</span>
            </h2>
            <p
              style={{
                fontSize: "1rem", color: "#666", lineHeight: 1.75,
                maxWidth: 420, fontWeight: 300, marginBottom: "2.5rem",
              }}
            >
              No notification pressure. No vanity metrics. Just direct, genuine conversations
              with people who share your world. Message when you want to. Say something that matters.
            </p>
            <button
              onClick={() => router.push("/messages")}
              className="flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.06em",
                color: "#0a0a0a", background: "none", border: "none",
                padding: 0, cursor: "pointer", textTransform: "uppercase",
              }}
            >
              Start messaging <ArrowRight size={13} />
            </button>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
