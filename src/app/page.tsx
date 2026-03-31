import { HeroSection }         from "@/components/sections/HeroSection";
import { DiscoverSection }    from "@/components/sections/DiscoverSection";
import { MatchSection }       from "@/components/sections/MatchSection";
import { ConnectSection }     from "@/components/sections/ConnectSection";
import { ShareSection }       from "@/components/sections/ShareSection";
import { CommunitySection }   from "@/components/sections/CommunitySection";
import { HowItWorksSection }  from "@/components/sections/HowItWorksSection";
import { StatsSection }       from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection }         from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#fff" }}>
      <HeroSection />
      <DiscoverSection />
      <MatchSection />
      <ConnectSection />
      <ShareSection />
      <CommunitySection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
