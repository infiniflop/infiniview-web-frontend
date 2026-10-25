import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Faq } from "@/components/site/faq";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { faqPage, jsonLd } from "@/lib/site/jsonld";

export const metadata: Metadata = {
  title: "Pricing",
  alternates: {
    canonical: "/pricing",
  },
};

/* -------------------------------------------------------------------------- */
/*  Data (unchanged from the previous site)                                   */
/* -------------------------------------------------------------------------- */

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    priceLabel: "Free",
    scans: "Early access",
    highlighted: false,
    cta: "Join Waitlist",
    ctaHref: "#waitlist",
    features: [
      "AI code review on PRs",
      "Static security scanners",
      "Basic vulnerability detection",
      "GitHub integration",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    desc: "Full-stack security for production teams shipping fast.",
    priceLabel: "TBD",
    scans: "Early access",
    highlighted: true,
    cta: "Join Waitlist",
    ctaHref: "#waitlist",
    features: [
      "Everything in Starter",
      "Full scanner suite",
      "Runtime attack agents",
      "AI interaction testing",
      "Cloud sandbox environments",
      "Encrypted secrets management",
      "Priority findings & fix suggestions",
      "Email & in-app notifications",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "White Glove",
    desc: "Custom security infrastructure for teams that need full control.",
    priceLabel: "Custom",
    scans: "Contact us",
    highlighted: false,
    cta: "Talk to Sales",
    ctaHref: "mailto:sales@infiniflop.com",
    features: [
      "Everything in Pro",
      "Custom agent configurations",
      "Compliance roadmap (SOC 2, ISO)",
      "Dedicated integration support",
    ],
  },
];

const PLAN_NOTES = [
  { label: "PR triggers", value: "Automated" },
  { label: "Dashboard reviews", value: "On-demand" },
  { label: "Pricing", value: "Finalized before launch" },
];

const FAQS = [
  {
    q: "What counts as a scan?",
    a: "A scan run is triggered each time Infiniview analyzes a pull request or reruns a dashboard review. Each scan run includes code review, security analysis, and any enabled testing agents.",
  },
  {
    q: "How does billing work?",
    a: "Billing is handled through our payment provider. Plan details will be finalized before launch: join the waitlist for updates.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we’ll invite you as spots open. Early waitlist members get priority access and launch pricing.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes. Sandbox-local files, logs, and processes are torn down after each scan. Findings, proof bundles, and scan metadata persist so you can review results in the dashboard.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPage(FAQS)) }} />
      <section className="price-hero" aria-labelledby="price-title">
        <div className="wrap">
          <p className="kicker" data-intro-soft data-reveal>
            Early access pricing
          </p>
          <h1 id="price-title" className="t-display price-title" data-split>
            Security that scales with you.
          </h1>
          <p className="t-lede price-lede" data-reveal>
            Join the waitlist to lock in launch pricing. Plans for indie hackers, startups, and enterprise.
          </p>
        </div>
      </section>

      <section className="wrap plans-wrap" aria-label="Plans">
        <div className="plans">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={`plan glass${p.highlighted ? " glass--lime plan--hi" : ""}`}
              data-reveal
            >
              <header className="plan-head">
                <h2 className="t-h3 plan-name">{p.name}</h2>
                {p.badge && <span className={`chip${p.highlighted ? " chip--ok" : ""}`}>{p.badge}</span>}
              </header>
              <p className="t-body plan-desc">{p.desc}</p>
              <div className="plan-price">
                <span className="plan-amount">{p.priceLabel}</span>
                <span className="t-small">{p.scans}</span>
              </div>
              <a
                href={p.ctaHref}
                className={`btn ${p.highlighted ? "btn--lime" : "btn--glass"} plan-cta`}
              >
                {p.cta}
                <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
              </a>
              <ul className="plan-list">
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={16} strokeWidth={3} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <ul className="plan-notes glass glass--thin" data-reveal style={{ ["--r" as string]: "999px" }}>
          {PLAN_NOTES.map((n) => (
            <li key={n.label}>
              <i aria-hidden />
              <span>
                <b>{n.label}</b>: {n.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Faq items={FAQS} id="pricing-faq" title="Questions? Answers." />

      <section className="wrap price-cta" aria-labelledby="price-cta-title">
        <div className="glass glass--deep price-cta-card" data-reveal>
          <h2 id="price-cta-title" className="t-h2">
            Ready to ship with confidence?
          </h2>
          <WaitlistForm id="waitlist" />
          <p className="t-small">
            Or <Link className="link" href="/preview" prefetch={false}>try the live demo</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
