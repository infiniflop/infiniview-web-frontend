import { Hero } from "@/components/site/hero";
import { ThreatMarquee } from "@/components/site/threat-marquee";
import { Statement } from "@/components/site/statement";
import { Pipeline } from "@/components/site/pipeline";
import { FindingsExplorer } from "@/components/site/findings-explorer";
import { Coverage } from "@/components/site/coverage";
import { After } from "@/components/site/after";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { RouteTransition } from "@/components/site/route-transition";
import { FAQS } from "@/lib/site/content";
import { faqPage, jsonLd } from "@/lib/site/jsonld";
import "./home.css";

export default function LandingPage() {
  return (
    <RouteTransition>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPage(FAQS)) }} />
        <Hero />
        <ThreatMarquee />
        <Statement />
        <Pipeline />
        <FindingsExplorer />
        <Coverage />
        <After />
        <Faq />
        <FinalCta />
      </main>
    </RouteTransition>
  );
}
