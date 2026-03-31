import Image from "next/image";
import { RevealSection } from "@/components/ui/RevealSection";
import { profiles } from "@/data/profiles";

const testimonials = [
  {
    quote: "I found three people in Kyoto who share my obsession with analog photography. We now have a monthly photo walk. None of this would have happened without Affinity.",
    name: "Maya Chen",
    location: "Tokyo, Japan",
    avatar: profiles[0].avatar,
  },
  {
    quote: "The interest matching is uncanny. The first person I connected with also designs typefaces and collects Coltrane records. Affinity doesn't do surface-level connections.",
    name: "Akira Tanaka",
    location: "Kyoto, Japan",
    avatar: profiles[4].avatar,
  },
  {
    quote: "I moved to London knowing no one. Within a week on Affinity, I had three conversations with people who love exactly the kind of jazz I curate at work.",
    name: "Elara Stone",
    location: "London, UK",
    avatar: profiles[5].avatar,
  },
];

export function TestimonialsSection() {
  return (
    <section id="community" style={{ padding: "8rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealSection>
          <div className="text-center mb-16">
            <p
              style={{
                fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                color: "#bbb", textTransform: "uppercase", marginBottom: "1.25rem",
              }}
            >
              What members say
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                color: "#0a0a0a", lineHeight: 1.18, letterSpacing: "-0.02em",
              }}
            >
              Real connections.
              <br />
              <span style={{ fontStyle: "italic", color: "#999" }}>Real words.</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <RevealSection key={t.name} delay={i * 100}>
              <div
                style={{
                  padding: "2rem", border: "1px solid #E8E8E8",
                  borderRadius: "4px", height: "100%",
                }}
              >
                <p
                  className="font-display"
                  style={{
                    fontSize: "0.9375rem", color: "#333", lineHeight: 1.75,
                    fontStyle: "italic", marginBottom: "1.75rem",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }}
                  />
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#0a0a0a" }}>{t.name}</p>
                    <p style={{ fontSize: "0.6875rem", color: "#aaa" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
