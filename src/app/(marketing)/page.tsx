import { LensHero } from "@/components/site/lens-hero";
import { ProofStory } from "@/components/site/proof-story";
import { Pipeline } from "@/components/site/pipeline";
import { Fleet } from "@/components/site/fleet";
import { Claims } from "@/components/site/claims";
import { FAQ } from "@/components/site/faq";
import { Closing } from "@/components/site/closing";
import { Reveal } from "@/components/site/reveal";

const FAQS = [
  {
    q: "How is this different from Snyk or SonarQube?",
    a: "Snyk and SonarQube are static analysis tools: they scan code without running it. Infiniview deploys your app in a sandbox and tests it at runtime with AI agents that attempt real attacks, test interactions, and review code. You would need four or five separate tools to get what one Infiniview run covers.",
  },
  {
    q: "Do I need to write any configuration or test cases?",
    a: "No. Connect your GitHub repo and Infiniview handles everything: it discovers your attack surface, generates test plans, and executes them autonomously. No OpenAPI specs, no test scripts, no YAML.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes that are torn down after every run. We never store your source code. Only findings, proof bundles, and run metadata persist so you can review results.",
  },
  {
    q: "What languages and frameworks do you support?",
    a: "Anything that can be built and deployed in a container. The static scanners cover JavaScript and TypeScript, Python, Go, Ruby, Java, PHP, and Rust. Runtime and interaction testing works with any web application.",
  },
  {
    q: "How long does a run take?",
    a: "It depends on the size and complexity of your app. Agents run in parallel with a ten-minute timeout per phase, and you see progress in the dashboard as each agent finishes.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we will invite you as spots open. Early members get priority access and free runs during the beta.",
  },
];

export default function LandingPage() {
  return (
    <main id="top">
      <LensHero />
      <Reveal as="div">
        <ProofStory />
      </Reveal>
      <Reveal as="div">
        <Pipeline />
      </Reveal>
      <Reveal as="div">
        <Fleet />
      </Reveal>
      <Reveal as="div">
        <Claims />
      </Reveal>
      <Reveal as="div">
        <FAQ faqs={FAQS} heading="Questions, answered." />
      </Reveal>
      <Reveal as="div">
        <Closing />
      </Reveal>
    </main>
  );
}
