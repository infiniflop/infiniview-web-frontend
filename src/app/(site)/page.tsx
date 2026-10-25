import { Hero } from "@/components/site/hero";
import { ThreatMarquee } from "@/components/site/threat-marquee";
import { Statement } from "@/components/site/statement";
import { Pipeline } from "@/components/site/pipeline";
import { FindingsExplorer } from "@/components/site/findings-explorer";
import { Arsenal } from "@/components/site/arsenal";
import { Features } from "@/components/site/features";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";

export default function LandingPage() {
  return (
    <main id="main">
      <Hero />
      <ThreatMarquee />
      <Statement />
      <Pipeline />
      <FindingsExplorer />
      <Arsenal />
      <Features />
      <Faq />
      <FinalCta />
    </main>
  );
}
