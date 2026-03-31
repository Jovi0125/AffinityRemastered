import { RevealSection } from "@/components/ui/RevealSection";

const stats = [
  { value: "200K+", label: "Members worldwide" },
  { value: "50+",   label: "Interest categories" },
  { value: "1M+",   label: "Connections made" },
  { value: "98%",   label: "Satisfaction rate" },
];

export function StatsSection() {
  return (
    <section style={{ padding: "6rem 0", backgroundColor: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <RevealSection key={stat.label} delay={i * 80}>
              <div className="text-center">
                <p
                  className="font-display"
                  style={{
                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 500,
                    color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "0.75rem",
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>
                  {stat.label}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
