import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SALES_EMAIL } from "@/components/site/content";
import { SplitHeading } from "@/components/site/motion/split-heading";
import { Faq } from "@/components/site/home/faq";

export const metadata: Metadata = {
  title: "Pricing",
  alternates: {
    canonical: "/pricing",
  },
};

const WAITLIST_HREF = "/#waitlist";

type PlanId = "starter" | "pro" | "enterprise";

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  note: string;
  desc: string;
  cta: string;
  href: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    note: "Early access",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    cta: "Join the waitlist",
    href: WAITLIST_HREF,
  },
  {
    id: "pro",
    name: "Pro",
    price: "TBD",
    note: "Early access",
    desc: "Full-stack security for production teams shipping fast.",
    cta: "Join the waitlist",
    href: WAITLIST_HREF,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    note: "Contact us",
    desc: "Custom security infrastructure for teams that need full control.",
    cta: "Talk to sales",
    href: `mailto:${SALES_EMAIL}`,
  },
];

// Each plan includes everything in the plan before it.
const FEATURES: { name: string; from: PlanId }[] = [
  { name: "AI code review on PRs", from: "starter" },
  { name: "Static security scanners", from: "starter" },
  { name: "Basic vulnerability detection", from: "starter" },
  { name: "GitHub integration", from: "starter" },
  { name: "Community support", from: "starter" },
  { name: "Full scanner suite", from: "pro" },
  { name: "Runtime attack agents", from: "pro" },
  { name: "AI interaction testing", from: "pro" },
  { name: "Cloud sandbox environments", from: "pro" },
  { name: "Encrypted secrets management", from: "pro" },
  { name: "Priority findings & fix suggestions", from: "pro" },
  { name: "Email & in-app notifications", from: "pro" },
  { name: "Custom agent configurations", from: "enterprise" },
  { name: "Compliance roadmap (SOC 2, ISO)", from: "enterprise" },
  { name: "Dedicated integration support", from: "enterprise" },
];

const ORDER: PlanId[] = ["starter", "pro", "enterprise"];
const includes = (plan: PlanId, from: PlanId) => ORDER.indexOf(plan) >= ORDER.indexOf(from);

const NOTES = [
  { label: "PR triggers", value: "Automated" },
  { label: "Dashboard reviews", value: "On demand" },
  { label: "Pricing", value: "Finalized before launch" },
];

const FAQS = [
  {
    q: "What counts as a scan?",
    a: "A scan run is triggered each time Infiniview analyzes a pull request or reruns a dashboard review. Each scan run includes code review, security analysis, and any enabled testing agents.",
  },
  {
    q: "How does billing work?",
    a: "Billing is handled through our payment provider. Plan details will be finalized before launch. Join the waitlist for updates.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we'll invite you as spots open. Early waitlist members get priority access and launch pricing.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes. Sandbox-local files, logs, and processes are torn down after each scan. Findings, proof bundles, and scan metadata persist so you can review results in the dashboard.",
  },
];

function Mark({ on, pro }: { on: boolean; pro?: boolean }) {
  return on ? (
    <Check size={18} strokeWidth={2.4} className={pro ? "text-flare" : "text-ink"} aria-label="Included" />
  ) : (
    <Minus size={16} className="text-ink-3/60" aria-label="Not included" />
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="relative" aria-labelledby="pricing-title">
        <div className="frame grid grid-cols-1 gap-y-8 pb-[clamp(56px,7vw,110px)] pt-[clamp(140px,18vw,240px)] lg:grid-cols-12">
          <SplitHeading as="h1" id="pricing-title" immediate delay={0.15} className="t-display lg:col-span-12">
            Pricing that scales with you.
          </SplitHeading>
          <p data-reveal className="t-lead max-w-[36ch] lg:col-span-6">
            Plans for indie hackers, startups and enterprise. Pricing is finalized before launch, and waitlist members
            get priority access and launch pricing.
          </p>
          <div data-reveal className="flex flex-wrap gap-3 lg:col-span-6 lg:col-start-7 lg:items-end lg:justify-end">
            <a href={WAITLIST_HREF} className="btn btn-flare">
              Join the waitlist
            </a>
            <a href={`mailto:${SALES_EMAIL}`} className="btn btn-glass">
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* Plans, side by side as one table on wide screens */}
      <section aria-label="Plans" className="relative">
        <div className="frame">
          <div className="hidden lg:block" data-reveal>
            <table className="w-full table-fixed border-separate border-spacing-x-1.5 border-spacing-y-0">
              <caption className="sr-only">Plan comparison</caption>
              <colgroup>
                <col className="w-[28%]" />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="align-bottom pb-8 text-left font-normal">
                    <span className="sr-only">Feature</span>
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className={cn(
                        "rounded-t-[4px] p-8 pb-10 text-left align-top font-normal",
                        p.id === "pro" ? "bg-void-3 shadow-[inset_0_3px_0_var(--color-flare)]" : "bg-void-2",
                      )}
                    >
                      <span className="block text-[1.25rem] font-[650] [font-variation-settings:'wdth'_112]">{p.name}</span>
                      <span className="mt-6 block text-[clamp(3rem,4.4vw,4.5rem)] font-[720] leading-none tracking-[-0.045em] [font-variation-settings:'wdth'_120]">
                        {p.price}
                      </span>
                      <span className="mt-2 block text-[1.0625rem] text-ink-3">{p.note}</span>
                      <span className="mt-6 block min-h-[3.2em] text-ink-2">{p.desc}</span>
                      <a href={p.href} className={cn("btn mt-8 w-full", p.id === "pro" ? "btn-flare" : "btn-glass")}>
                        {p.cta}
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.name} className="group">
                    <th scope="row" className="py-3.5 pr-6 text-left font-normal text-ink-2 transition-colors group-hover:text-ink">
                      {f.name}
                    </th>
                    {PLANS.map((p) => (
                      <td
                        key={p.id}
                        className={cn(
                          "px-8 py-3.5",
                          p.id === "pro" ? "bg-void-3" : "bg-void-2",
                          i === FEATURES.length - 1 && "rounded-b-[4px] pb-8",
                        )}
                      >
                        <Mark on={includes(p.id, f.from)} pro={p.id === "pro"} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Small screens: one plan after another */}
          <div className="flex flex-col gap-3 lg:hidden">
            {PLANS.map((p) => (
              <div
                key={p.id}
                data-reveal
                className={cn(
                  "rounded-[4px] p-6",
                  p.id === "pro" ? "bg-void-3 shadow-[inset_0_3px_0_var(--color-flare)]" : "bg-void-2",
                )}
              >
                <h2 className="text-[1.25rem] font-[650] [font-variation-settings:'wdth'_112]">{p.name}</h2>
                <p className="mt-4 text-[3rem] font-[720] leading-none tracking-[-0.045em] [font-variation-settings:'wdth'_120]">
                  {p.price}
                </p>
                <p className="mt-2 text-[1.0625rem] text-ink-3">{p.note}</p>
                <p className="mt-4 text-ink-2">{p.desc}</p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {FEATURES.filter((f) => includes(p.id, f.from)).map((f) => (
                    <li key={f.name} className="flex items-start gap-3">
                      <Check size={18} strokeWidth={2.4} className={cn("mt-0.5 shrink-0", p.id === "pro" ? "text-flare" : "text-ink")} aria-hidden />
                      {f.name}
                    </li>
                  ))}
                </ul>
                <a href={p.href} className={cn("btn mt-7 w-full", p.id === "pro" ? "btn-flare" : "btn-glass")}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4" data-reveal>
            {NOTES.map((n) => (
              <div key={n.label} className="flex gap-2">
                <dt className="text-ink-3">{n.label}</dt>
                <dd className="text-ink">{n.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Faq items={FAQS} id="pricing-faq" />

      <section className="relative bg-flare text-graphite" aria-labelledby="pricing-cta">
        <div className="frame grid grid-cols-1 items-end gap-y-10 py-[clamp(90px,11vw,170px)] lg:grid-cols-12">
          <SplitHeading id="pricing-cta" className="t-h2 lg:col-span-8">
            Ready to ship with confidence?
          </SplitHeading>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <a href={WAITLIST_HREF} className="btn btn-graphite">
              Join the waitlist
            </a>
            <a href={`mailto:${SALES_EMAIL}`} className="btn bg-transparent text-graphite shadow-[inset_0_0_0_1.5px_var(--color-graphite)] hover:bg-graphite/10">
              Talk to sales
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
