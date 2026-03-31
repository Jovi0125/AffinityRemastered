import { Users, Zap, MessageCircle } from "lucide-react";
import { RevealSection } from "@/components/ui/RevealSection";

const steps = [
  {
    number: "01",
    Icon: Users,
    title: "Create your profile",
    desc: "Tell us who you are through your interests — not your job title. Add what you love, and let that define you here.",
  },
  {
    number: "02",
    Icon: Zap,
    title: "Discover your matches",
    desc: "Our interest-first algorithm surfaces companions who share your specific passions — not just broad categories.",
  },
  {
    number: "03",
    Icon: MessageCircle,
    title: "Connect and share",
    desc: "Message, share photos, and build genuine relationships with people who truly get what you're about.",
  },
];

export function HowItWorksSection() {
  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#F8F8F8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealSection>
          <div className="text-center mb-16">
            <p
              style={{
                fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                color: "#bbb", textTransform: "uppercase", marginBottom: "1.25rem",
              }}
            >
              How it works
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em",
              }}
            >
              Three steps
              <br />
              <span style={{ fontStyle: "italic", color: "#999" }}>to belonging.</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <RevealSection key={step.number} delay={i * 120}>
              <div>
                <div className="flex items-start gap-5 mb-6">
                  <span
                    className="font-display"
                    style={{ fontSize: "4rem", fontWeight: 400, color: "#E8E8E8", lineHeight: 1, flexShrink: 0 }}
                  >
                    {step.number}
                  </span>
                  <div
                    style={{
                      width: 40, height: 40, border: "1px solid #D8D8D8", borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: "0.5rem",
                    }}
                  >
                    <step.Icon size={16} color="#555" />
                  </div>
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.875rem" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "#777", lineHeight: 1.7, fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
