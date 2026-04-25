"use client";

import {
  Terminal,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  Building2,
  Sparkles,
  Bot,
  Lock,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";

const WAITLIST_HREF = "/#waitlist";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Free",
    unit: "",
    scans: "Early access",
    highlighted: false,
    cta: "Join Waitlist",
    ctaHref: WAITLIST_HREF,
    traits: [
      { icon: Shield, text: "Static security scanners" },
      { icon: Eye, text: "AI code review on PRs" },
      { icon: Bot, text: "GitHub integration" },
    ],
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
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "TBD",
    unit: "",
    scans: "Early access",
    highlighted: true,
    cta: "Join Waitlist",
    ctaHref: WAITLIST_HREF,
    traits: [
      { icon: Zap, text: "All 25 scanners" },
      { icon: Shield, text: "Runtime attack agents" },
      { icon: Eye, text: "AI interaction testing" },
    ],
    features: [
      "Everything in Starter",
      "All 25 scanners",
      "Runtime attack agents",
      "AI interaction testing",
      "Cloud sandbox environments",
      "Secrets management (AES-256)",
      "Priority findings & fix suggestions",
      "Email & in-app notifications",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "White Glove",
    desc: "Custom security infrastructure for teams that need full control.",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Custom",
    unit: "",
    scans: "Contact us",
    highlighted: false,
    cta: "Talk to Sales",
    ctaHref: "mailto:sales@infiniview.dev",
    traits: [
      { icon: Building2, text: "Custom agent configs" },
      { icon: Lock, text: "Compliance roadmap" },
      { icon: Headphones, text: "Dedicated engineer" },
    ],
    features: [
      "Everything in Pro",
      "Custom agent configurations",
      "Compliance roadmap (SOC 2, ISO)",
      "Dedicated integration support",
    ],
  },
];

const PLAN_NOTES = [
  { label: "PR triggers", value: "Automated", color: "bg-accent" },
  { label: "Dashboard scans", value: "On-demand", color: "bg-teal" },
  { label: "Pricing", value: "Finalized before launch", color: "bg-cyan" },
];

const FAQS = [
  {
    q: "What counts as a scan?",
    a: "A scan is triggered each time Infiniview analyzes a pull request or runs on-demand from the dashboard. Each scan includes code review, security analysis, and any enabled testing agents.",
  },
  {
    q: "How does billing work?",
    a: "Billing is handled through our payment provider. Plan details will be finalized before launch — join the waitlist for updates.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we'll invite you as spots open. Early waitlist members get priority access and launch pricing.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated Daytona cloud sandboxes. Sandbox-local files, logs, and processes are torn down after each scan. Findings, proof bundles, and scan metadata persist so you can review results in the dashboard.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {

  return (
    <>
      <Nav activePath="/pricing" />
      <main className="relative min-h-screen overflow-hidden">
        {/* Ambient background blurs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-accent/[0.06] blur-[180px]" />
          <div className="absolute top-[30%] right-[10%] h-[400px] w-[400px] rounded-full bg-teal/[0.04] blur-[150px]" />
          <div className="absolute bottom-[10%] left-[40%] h-[300px] w-[300px] rounded-full bg-cyan/[0.03] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-24">
          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] backdrop-blur-sm px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              <Sparkles size={10} className="text-accent" />
              Simple pricing
            </span>

            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Security that
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">
                scales with you
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-text-muted">
              Join the waitlist to lock in launch pricing. Plans for indie hackers, startups, and enterprise.
            </p>
          </motion.div>

          {/* ── Early Access Note ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex items-center justify-center"
          >
            <span className="text-[13px] font-medium text-text-muted">
              Pricing finalized before launch — waitlist members get priority access
            </span>
          </motion.div>

          {/* ── Pricing Container (glassmorphic) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-12 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl p-3 sm:p-4"
          >
            {/* Launch offer pill */}
            <div className="flex justify-center -mt-8 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/[0.75] backdrop-blur-md px-5 py-2 text-[12px] text-white/80 shadow-lg">
                <Zap size={11} className="text-accent" />
                <span className="font-semibold text-white">Early Access</span>
                <span className="text-white/50">-</span>
                <span>Waitlist members get priority access & launch pricing</span>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {PLANS.map((plan, i) => {
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                    className={cn(
                      "relative flex flex-col rounded-[24px] p-6 sm:p-7 transition-all duration-300",
                      plan.highlighted
                        ? "bg-white/[0.06] ring-1 ring-white/[0.08]"
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[18px] font-semibold text-white">{plan.name}</h3>
                      {plan.badge && (
                        <span className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          plan.highlighted
                            ? "bg-white/[0.15] text-white"
                            : "bg-white/[0.08] text-white/60"
                        )}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] leading-relaxed text-white/40 mb-5">
                      {plan.desc}
                    </p>

                    {/* Price */}
                    <div className="mb-5">
                      <span className="text-[42px] font-extrabold tracking-tight text-white leading-none">
                        {plan.priceLabel}
                      </span>
                      <p className="mt-1 text-[12px] font-medium text-white/30">{plan.scans}</p>
                    </div>

                    {/* Traits (icon row) */}
                    <div className="flex flex-col gap-2.5 mb-6">
                      {plan.traits.map((trait) => (
                        <div key={trait.text} className="flex items-center gap-2.5">
                          <trait.icon size={13} className={plan.highlighted ? "text-accent" : "text-white/25"} />
                          <span className="text-[13px] text-white/50">{trait.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA button */}
                    <a
                      href={plan.ctaHref}
                      className={cn(
                        "mt-auto flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-all duration-200",
                        plan.highlighted
                          ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                          : "bg-white/[0.07] text-white/80 hover:bg-white/[0.12] hover:text-white"
                      )}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight size={14} />
                    </a>
                  </motion.div>
                );
              })}
            </div>

            {/* Plan notes bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full bg-white/[0.03] px-6 py-3">
              {PLAN_NOTES.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full", c.color)} />
                  <span className="text-[12px] text-white/50">
                    <strong className="text-white/70 font-medium">{c.label}</strong>: {c.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Features Breakdown ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              What&apos;s in each plan
            </h2>
            <p className="text-center text-white/40 text-[15px] mb-10">
              Everything you need, nothing you don&apos;t.
            </p>

            <div className="grid gap-3 lg:grid-cols-3">
              {PLANS.map((plan, pi) => (
                <motion.div
                  key={plan.id + "-features"}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: pi * 0.1, duration: 0.5 }}
                  className={cn(
                    "rounded-[24px] p-6 sm:p-7",
                    plan.highlighted
                      ? "bg-white/[0.04] ring-1 ring-white/[0.06]"
                      : "bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      plan.highlighted ? "bg-accent/15" : "bg-white/[0.06]"
                    )}>
                      {plan.id === "starter" && <Zap size={14} className={plan.highlighted ? "text-accent" : "text-white/40"} />}
                      {plan.id === "pro" && <Shield size={14} className="text-accent" />}
                      {plan.id === "enterprise" && <Building2 size={14} className="text-white/40" />}
                    </div>
                    <h3 className="text-[16px] font-semibold text-white">{plan.name}</h3>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className={cn(
                          "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.highlighted ? "bg-accent/15" : "bg-white/[0.06]"
                        )}>
                          <Check
                            size={9}
                            className={plan.highlighted ? "text-accent" : "text-white/40"}
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-[13px] leading-snug text-white/50">{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── FAQ ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mt-24"
          >
            <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight mb-10">
              Questions? <span className="text-white/30">Answers.</span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-[20px] bg-white/[0.03] p-6 transition hover:bg-white/[0.05]"
                >
                  <h4 className="text-[14px] font-semibold text-white mb-2">{faq.q}</h4>
                  <p className="text-[13px] leading-relaxed text-white/40">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Bottom CTA ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 text-center"
          >
            <p className="text-white/30 text-[14px] mb-4">Ready to ship with confidence?</p>
            <a
              href={WAITLIST_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[14px] font-semibold transition hover:bg-white/90 shadow-lg shadow-white/10"
            >
              Join the Waitlist
              <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
              <Terminal size={11} className="text-accent" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-white/30">infiniview</span>
          </div>
          <p className="text-[12px] text-white/20">
            &copy; {new Date().getFullYear()} Infiniview. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://docs.infiniview.dev" className="text-[12px] text-white/30 transition hover:text-white/60">Docs</a>
            <a href="mailto:hello@infiniview.dev" className="text-[12px] text-white/30 transition hover:text-white/60">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
