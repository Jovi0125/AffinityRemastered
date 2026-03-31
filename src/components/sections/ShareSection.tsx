import { RevealSection } from "@/components/ui/RevealSection";
import { PostGridItem } from "@/components/ui/PostGridItem";

const postImages = [
  { src: "https://images.unsplash.com/photo-1557735567-d1b80e463789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "Maya Chen", caption: "Morning ritual." },
  { src: "https://images.unsplash.com/photo-1628703601609-40524e7c986a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "Lucas Park", caption: "Concrete and light." },
  { src: "https://images.unsplash.com/photo-1769103638505-7efc41b3b1d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "Lucas Park", caption: "The city at 6am." },
  { src: "https://images.unsplash.com/photo-1728413704912-55beeee843ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "James Webb", caption: "3,200m. Still going." },
  { src: "https://images.unsplash.com/photo-1544788643-f385285b3275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "Maya Chen", caption: "Side A. Always." },
  { src: "https://images.unsplash.com/photo-1764922168474-8048361bc764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", author: "Elara Stone", caption: "Empty rooms hold weight." },
];

export function ShareSection() {
  return (
    <section style={{ padding: "8rem 0", backgroundColor: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <p
                style={{
                  fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "1.25rem",
                }}
              >
                04 — Share
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 3.25rem)", fontWeight: 500,
                  color: "#fff", lineHeight: 1.18, letterSpacing: "-0.02em",
                }}
              >
                Share your world.
                <br />
                <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>Find your people.</span>
              </h2>
            </div>
            <p
              style={{
                fontSize: "0.9375rem", color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7, maxWidth: 360, fontWeight: 300,
              }}
            >
              Share moments that define you. Not curated highlight reels —
              real glimpses into the things you care about.
            </p>
          </div>
        </RevealSection>

        <RevealSection delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {postImages.map((post, i) => (
              <PostGridItem key={i} post={post} />
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
