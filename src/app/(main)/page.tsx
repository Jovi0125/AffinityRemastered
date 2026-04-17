import { HeroSection } from "@/components/sections/HeroSection";
import { PageTransition } from "@/components/ui/PageTransition";

export default function HomePage() {
  return (
    <PageTransition>
      <div style={{ backgroundColor: "#fff" }}>
        <HeroSection />
      </div>
    </PageTransition>
  );
}
