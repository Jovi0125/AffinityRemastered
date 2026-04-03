import { RevealSection } from "@/components/ui/RevealSection";
import { InterestTag } from "@/components/ui/InterestTag";
import { demoProfiles, allInterests } from "@/data/profiles";

const featuredInterests = allInterests.slice(0, 24);
const filledIndices = new Set([2, 5, 8, 11, 15, 19]);

export function MatchSection() {
  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#F8F8F8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <RevealSection>
          <div className="text-center mb-16">
            <p
              style={{
                fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                color: "#bbb", textTransform: "uppercase", marginBottom: "1.25rem",
              }}
            >
              02 — Match
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "1.25rem",
              }}
            >
              Your interests.
              <br />
              <span style={{ fontStyle: "italic", color: "#888" }}>Their interests.</span>
            </h2>
            <p
              style={{
                fontSize: "1rem", color: "#777", lineHeight: 1.7,
                maxWidth: 480, margin: "0 auto", fontWeight: 300,
              }}
            >
              The overlap is where real connection happens. Affinity surfaces companions based on the
              specifics — not just &ldquo;art&rdquo; but analog photography, not just &ldquo;music&rdquo; but 1970s ECM Records.
            </p>
          </div>
        </RevealSection>

        {/* Tag cloud */}
        <RevealSection delay={100}>
          <div className="flex flex-wrap justify-center gap-2.5" style={{ maxWidth: 720, margin: "0 auto" }}>
            {featuredInterests.map((interest, i) => (
              <InterestTag key={interest} label={interest} filled={filledIndices.has(i)} size="md" />
            ))}
          </div>
        </RevealSection>

        {/* Venn diagram */}
        <RevealSection delay={200}>
          <div className="flex items-center justify-center mt-16">
            {/* Left circle — You */}
            <div
              style={{
                width: 200, height: 200, borderRadius: "50%", border: "1px solid #D0D0D0",
                backgroundColor: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column", gap: 4,
                position: "relative", zIndex: 2,
              }}
            >
              <img src={demoProfiles[0].avatar} alt="" width={44} height={44}
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#0a0a0a" }}>You</span>
              <span style={{ fontSize: "0.625rem", color: "#aaa" }}>Film · Tea · Travel</span>
            </div>

            {/* Overlap */}
            <div
              style={{
                width: 80, height: 200, marginLeft: -40, marginRight: -40,
                backgroundColor: "rgba(0,0,0,0.05)", display: "flex",
                alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 3,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span style={{ fontSize: "0.6rem", color: "#555", fontWeight: 500, letterSpacing: "0.04em" }}>FILM</span>
                <span style={{ fontSize: "0.6rem", color: "#555", fontWeight: 500, letterSpacing: "0.04em" }}>TRAVEL</span>
              </div>
            </div>

            {/* Right circle — Akira */}
            <div
              style={{
                width: 200, height: 200, borderRadius: "50%", border: "1px solid #D0D0D0",
                backgroundColor: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column", gap: 4,
                position: "relative", zIndex: 2,
              }}
            >
              <img src={demoProfiles[4].avatar} alt="" width={44} height={44}
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#0a0a0a" }}>Akira</span>
              <span style={{ fontSize: "0.625rem", color: "#aaa" }}>Typography · Film · Travel</span>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
