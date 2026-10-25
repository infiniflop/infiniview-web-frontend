import { FAQS } from "@/components/site/content";
import { Hero } from "@/components/site/home/hero";
import { Ritual } from "@/components/site/home/ritual";
import { Guarantees } from "@/components/site/home/guarantees";
import { Arsenal } from "@/components/site/home/arsenal";
import { Proof } from "@/components/site/home/proof";
import { MergeGate } from "@/components/site/home/merge-gate";
import { DemoFrame } from "@/components/site/home/demo-frame";
import { Faq } from "@/components/site/home/faq";
import { Closing } from "@/components/site/home/closing";
import { SceneLayer } from "@/components/site/home/scene-layer";
import { SceneDirector } from "@/components/site/home/scene-director";

// The page follows one run of the product: the sandbox is sealed (hero),
// the run plays (how it works), the sandbox is destroyed (guarantees), and
// what it produced is laid out (arsenal, proof, merge gate, demo). It ends
// with the block sealed again, ready for the visitor's own run.
export default function HomePage() {
  return (
    <>
      <SceneLayer />
      <SceneDirector />
      <Hero />
      <Ritual />
      <Guarantees />
      <Arsenal />
      <Proof />
      <MergeGate />
      <DemoFrame />
      <Faq items={FAQS} />
      <Closing />
    </>
  );
}
