import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { FAQ } from "@/components/site/faq";
import { Closing } from "@/components/site/closing";
import { SALES_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  alternates: { canonical: "/pricing" },
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    note: "Early access",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    features: [
      "AI code review on pull requests",
      "Static security scanners",
      "Basic vulnerability detection",
      "GitHub integration",
      "Community support",
    ],
    cta: { label: "Join the waitlist", href: "/#waitlist" },
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "To be announced",
    note: "Early access",
    desc: "Full-stack security for production teams shipping fast.",
    features: [
      "Everything in Starter",
      "Full scanner suite",
      "Runtime attack agents",
      "AI interaction testing",
      "Cloud sandbox environments",
      "Encrypted secrets management",
      "Priority findings and fix suggestions",
      "Email and in-app notifications",
    ],
    cta: { label: "Join the waitlist", href: "/#waitlist" },
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    note: "Talk to us",
    desc: "Custom security infrastructure for teams that need full control.",
    features: [
      "Everything in Pro",
      "Custom agent configurations",
      "Compliance roadmap (SOC 2, ISO 27001)",
      "Dedicated integration support",
    ],
    cta: { label: "Talk to sales", href: `mailto:${SALES_EMAIL}` },
    featured: false,
  },
];

const FAQS = [
  {
    q: "What counts as a run?",
    a: "A run starts each time Infiniview analyzes a pull request or you rerun a review from the dashboard. Each run includes code review, security analysis, and any enabled attack and interaction agents.",
  },
  {
    q: "How does billing work?",
    a: "Billing is handled through our payment provider. Plan details will be finalized before launch. Join the waitlist for updates.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we will invite you as spots open. Early waitlist members get priority access and launch pricing.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes. Sandbox files, logs, and processes are torn down after each run. Findings, proof bundles, and run metadata persist so you can review results in the dashboard.",
  },
];

export default function PricingPage() {
  return (
    <main>
      <Reveal as="section" className="bg-ground pt-[calc(var(--nav-h)+72px)] pb-24 md:pt-[calc(var(--nav-h)+120px)] md:pb-32">
        <div className="frame">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <h1 className="t-display col-span-12 max-w-[12ch] text-ink lg:col-span-8" data-reveal="lines">
              Plans, decided before launch.
            </h1>
            <p className="t-lead col-span-12 max-w-[30ch] self-end text-ink-2 lg:col-span-4" data-reveal>
              Pricing is finalized before we open the doors. Waitlist members get priority access and launch pricing.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-2 md:mt-28 lg:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.id}
                data-reveal
                className={cn(
                  "flex flex-col p-7 md:p-9",
                  p.featured ? "bg-ink text-ground" : "bg-surface text-ink",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[22px] font-medium tracking-[-0.015em]">{p.name}</h2>
                  <span className={cn("t-small", p.featured ? "text-ground/60" : "text-ink-3")}>{p.note}</span>
                </div>
                <p className={cn("t-body mt-3 max-w-[30ch]", p.featured ? "text-ground/70" : "text-ink-2")}>{p.desc}</p>
                <div className="mt-10 text-[clamp(2.25rem,3.4vw,3.25rem)] leading-none font-medium tracking-[-0.035em]">
                  {p.price}
                </div>
                <ul className={cn("mt-10 flex flex-col gap-3 text-[16px]", p.featured ? "text-ground/85" : "text-ink-2")}>
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span className={cn("mt-[9px] h-1.5 w-1.5 shrink-0", p.featured ? "bg-redline" : "bg-ink-3")} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex-1" />
                <a
                  href={p.cta.href}
                  className={cn("btn mt-12 w-full", p.featured ? "btn-red" : "btn-quiet")}
                >
                  {p.cta.label}
                </a>
              </article>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-2 md:grid-cols-3" data-reveal>
            {[
              ["Pull request triggers", "Automated on every PR"],
              ["Dashboard reviews", "On demand, any branch"],
              ["Sandboxes", "Isolated, destroyed after each run"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ground-2 px-6 py-5">
                <dt className="t-small text-ink-3">{k}</dt>
                <dd className="mt-1 text-[17px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <Reveal as="div">
        <FAQ faqs={FAQS} heading="About the plans." id="pricing-faq" />
      </Reveal>
      <Reveal as="div">
        <Closing />
      </Reveal>
    </main>
  );
}
