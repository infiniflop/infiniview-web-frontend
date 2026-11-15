import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Faq } from "@/components/site/faq";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { faqPage, jsonLd } from "@/lib/site/jsonld";
import { RouteTransition } from "@/components/site/route-transition";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Infiniview plans for indie hackers, startups, and enterprise. Join the waitlist to lock in launch pricing.",
  alternates: {
    canonical: "/pricing",
  },
  // a child's openGraph replaces the root's, so the page's own URL, title and description are stated
  openGraph: {
    type: "website",
    siteName: "Infiniview",
    locale: "en_US",
    url: "/pricing",
    title: "Pricing | Infiniview",
    description:
      "Infiniview plans for indie hackers, startups, and enterprise. Join the waitlist to lock in launch pricing.",
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
    cta: "Join waitlist",
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
    badge: "Recommended",
    desc: "Full-stack security for production teams shipping fast.",
    priceLabel: "Soon",
    scans: "Early access",
    highlighted: true,
    cta: "Join waitlist",
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
    badge: "White glove",
    desc: "Custom security infrastructure for teams that need full control.",
    priceLabel: "Custom",
    scans: "Contact us",
    highlighted: false,
    cta: "Talk to sales",
    ctaHref: "mailto:sales@infiniflop.com",
    features: [
      "Everything in Pro",
      "Custom agent configurations",
      "Compliance roadmap (SOC 2, ISO)",
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
    <RouteTransition>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPage(FAQS)) }} />
        {/* the first screen (headline and plans) is in the server's HTML and enters with CSS at first paint */}
        <section className="price-hero" aria-labelledby="price-title">
          <div className="wrap">
            <h1 id="price-title" className="t-display">
              Security that scales with you.
            </h1>
            <p className="t-lede">
              Join the waitlist to lock in launch pricing. Plans for indie hackers, startups, and enterprise.
            </p>
          </div>
        </section>

        <section className="wrap plans" aria-label="Plans">
          <div className="plans-grid">
            {PLANS.map((p) => (
              <article key={p.id} className={`plan pane${p.highlighted ? " plan--hi" : ""}`}>
                <header className="plan-top">
                  <h2 className="plan-name">{p.name}</h2>
                  {p.badge && <span className={`chip${p.highlighted ? " chip--ok" : ""}`}>{p.badge}</span>}
                </header>
                <p className="plan-desc">{p.desc}</p>
                <p className="plan-price">{p.priceLabel}</p>
                <p className="plan-scans t-label">{p.scans}</p>
                <a
                  href={p.ctaHref}
                  aria-label={`${p.cta}: ${p.name} plan`}
                  className={`btn ${p.highlighted ? "btn--lime" : "btn--line"}`}
                >
                  {p.cta}
                  <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
                </a>
                <ul className="plan-feats">
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

          <ul className="plan-notes">
            {PLAN_NOTES.map((n) => (
              <li key={n.label}>
                <span>
                  <b>{n.label}</b>: {n.value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Faq items={FAQS} id="pricing-faq" title="Questions? Answers." />

        <section className="wrap price-cta" aria-labelledby="price-cta-title">
          <div className="pane price-cta-pane" data-reveal>
            <h2 id="price-cta-title" className="t-h2">
              Ready to ship with confidence?
            </h2>
            <div className="price-cta-side">
              <WaitlistForm id="waitlist" />
              <p className="t-small price-cta-alt">
                Or <Link className="link" href="/preview" prefetch={false}>try the live demo</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </RouteTransition>
  );
}
