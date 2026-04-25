"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Nav } from "@/components/nav";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─── Data ─── */

const WIRE_EVENTS = [
  { phase: "phase A", agent: "orchestrator", msg: "sandboxes provisioned", color: "text-amber" },
  { phase: "phase B", agent: "code-review", msg: "logic + type-safety pass", color: "text-cyan" },
  { phase: "phase B", agent: "runtime-attack", msg: "SSRF probe → metadata reached", color: "text-red" },
  { phase: "phase B", agent: "interaction", msg: "form fuzzed · stored XSS", color: "text-red" },
  { phase: "phase C", agent: "orchestrator", msg: "proof bundle assembled", color: "text-lime" },
];

const MARQUEE_ITEMS = [
  "INJECTION", "AUTH ATTACKS", "API FUZZING", "SSRF", "CORS",
  "SESSION HIJACKING", "PROMPT INJECTION", "RATE LIMIT", "CRYPTO AUDIT",
  "FILE UPLOAD", "BIZ-LOGIC", "UI CRAWL", "XSS PAYLOADS", "AUTH FLOWS",
  "MULTI-TAB RACE", "PAYMENT FLOWS", "NETWORK RESILIENCE", "ACCESSIBILITY",
];

const PIPELINE_STEPS = [
  { n: "01", tag: "TRIGGER", h: "Run the CLI or click the dashboard.", d: "Infiniview picks it up instantly. Trigger from a pull request, a GitHub comment, the dashboard, or the CLI." },
  { n: "02", tag: "SANDBOX", h: "A Daytona cloud environment spins up.", d: "Your repo is cloned, built, and deployed in isolation. Two sandboxes per scan — one for setup and interaction, one for security verification." },
  { n: "03", tag: "AGENTS", h: "Code review, scanners, attackers, and interaction testers run in parallel.", d: "The orchestrator dispatches specialized agents simultaneously. Each has its own model, tools, and objectives." },
  { n: "04", tag: "ENRICH", h: "Results are deduplicated and correlated.", d: "Findings are linked through the code graph and enriched with fix suggestions before anything ships to your PR." },
  { n: "05", tag: "REPORT", h: "Forensic findings land in the dashboard.", d: "Proof bundles you can replay, export, and compare across runs. Output also posts to the PR." },
];

const AGENTS = [
  { tag: "01 / ORCHESTRATOR", model: "Claude Opus 4.6", h: "Orchestrator", d: "Coordinates the entire pipeline, dispatches specialized agents, synthesizes final reports, and decides when deeper investigation is needed." },
  { tag: "02 / CODE REVIEW", model: "GPT 5.4", h: "Code Review Agents", d: "Parallel agents analyze code changes for logic bugs, performance issues, type safety violations, and style problems." },
  { tag: "03 / INTERACTION", model: "GPT 5.4", h: "Interaction Testing", d: "Uses computer vision to interact with your running app — fills forms, clicks buttons, injects payloads, discovers broken flows, and tests every user path." },
  { tag: "04 / RUNTIME ATTACK", model: "Multiple Agents", h: "Runtime Attack Agents", d: "AI-driven agents for injection testing, auth attacks, API fuzzing, SSRF probing, session hijacking, prompt injection, and more." },
];

const SCANNER_GROUPS = [
  { label: "Static Analysis", items: ["Semgrep", "ESLint Security", "Bandit", "gosec", "Brakeman", "SpotBugs", "PHPStan", "Bearer", "njsscan", "CodeQL", "SonarQube", "Snyk Code"] },
  { label: "Dependency Audit", items: ["npm audit", "pip-audit", "cargo-audit", "OSV Scanner", "Safety", "Grype", "Retire.js", "Snyk Open Source"] },
  { label: "Secrets Detection", items: ["Gitleaks", "detect-secrets", "TruffleHog"] },
  { label: "Configuration & IaC", items: ["Trivy", "Checkov", "tfsec", "Hadolint", "kube-linter"] },
  { label: "License Compliance", items: ["FOSSA", "license-checker", "cargo-deny"] },
];

const RUNTIME_AGENTS: [string, string][] = [
  ["Injection Tester", "SQL / NoSQL / OS injection"],
  ["Auth Attacker", "LLM-guided auth attacks"],
  ["API Fuzzer", "Endpoint fuzzing & discovery"],
  ["SSRF Prober", "Server-side request forgery"],
  ["CORS Tester", "Cross-origin policy testing"],
  ["Session Tester", "Session hijacking & fixation"],
  ["Prompt Injection", "AI endpoint attacks"],
  ["Rate Limit Tester", "Brute-force protection"],
  ["Crypto Auditor", "Cryptographic weakness review"],
  ["File Upload Tester", "Upload path traversal & RCE"],
  ["Biz Logic Prober", "Business logic flaws"],
  ["UI Crawler", "Automated surface discovery"],
];

const INTERACTION_TESTS: [string, string][] = [
  ["Form & Input Fuzzing", "AI fills every form field with edge cases, unicode, overflows, and malicious payloads to find validation gaps."],
  ["Click-Through Exploration", "Navigates every button, link, and interactive element to discover broken flows, dead ends, and unexpected states."],
  ["XSS Payload Injection", "Injects cross-site scripting payloads through the UI to test frontend sanitization and escaping."],
  ["Auth Flow Testing", "Tests login, signup, password reset, and session flows for broken auth, privilege escalation, and token leaks."],
  ["Deep Link & Navigation", "Tests direct URL access, back-button behavior, deep links, and route guards to find auth bypass paths."],
  ["Multi-Tab Concurrency", "Opens multiple tabs with the same session to find race conditions, stale state, and synchronization bugs."],
  ["Payment & Transaction Flows", "Tests checkout, payment, and financial flows for double-charge, amount manipulation, and step-skipping."],
  ["Network Resilience", "Simulates slow connections, timeouts, and disconnects to find error handling failures and data loss."],
  ["Accessibility Probing", "Verifies keyboard navigation, screen reader compatibility, focus traps, and ARIA correctness across all views."],
];

const FEATURES: [string, string][] = [
  ["Forensic Findings", "Every finding includes root-cause evidence, affected code paths, and suggested fixes — all browsable in a dedicated viewer."],
  ["Cloud Sandboxes", "Every scan runs in an isolated Daytona cloud environment. Deployed, tested, and torn down automatically."],
  ["Scan Activity Timeline", "Live timeline of every agent action, finding, and decision — searchable and replayable after each run."],
  ["Command Palette", "Cmd+K search across reviews, security findings, settings, security configuration, and scan history."],
  ["Secrets Management", "Per-repo encrypted secrets stored with AES-256-GCM. Injected into sandboxes at runtime."],
  ["LLM Reasoning Engine", "AI-augmented vulnerability chain detection. LLMs analyze the code graph to discover multi-step attack paths."],
  ["Self-Learning", "Learned patterns now feed prioritization, runtime planning, and finding evidence on future scans."],
  ["Configurable Scans", "Toggle scanners and agents per-repo. Set auto-review, PR filters, and notifications."],
  ["Compliance Reports", "Generate security compliance reports for SOC 2, ISO 27001, and internal audit requirements."],
];

const PRICING_TIERS = [
  {
    tag: "[01] / STARTER", name: "Starter", price: "$0", unit: "/month",
    scans: "50 scans/mo · 1 seat",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    bullets: ["AI code review on every PR", "3 static security scanners", "Basic vulnerability detection", "GitHub integration", "Community support"],
    cta: "Join Waitlist", href: "#waitlist", highlight: false,
  },
  {
    tag: "[02] / PRO", name: "Pro", price: "$59", unit: "/seat/month, billed annual",
    scans: "Unlimited scans · up to 25 seats",
    desc: "Full-stack security for production teams shipping fast.",
    bullets: ["Everything in Starter", "All 30+ static scanners", "Runtime attack agents", "AI interaction testing", "Cloud sandbox environments", "Secrets management (AES-256)", "Priority findings & fix suggestions", "Email & in-app notifications"],
    cta: "Join Waitlist", href: "#waitlist", highlight: true,
  },
  {
    tag: "[03] / ENTERPRISE", name: "Enterprise", price: "Custom", unit: "volume-based",
    scans: "Unlimited seats",
    desc: "Custom security infrastructure for teams that need full control.",
    bullets: ["Everything in Pro", "Unlimited seats", "Custom agent configurations", "Compliance roadmap (SOC 2, ISO)", "Priority uptime SLA", "Private cloud deployment", "Team roles & permissions", "Dedicated integration support"],
    cta: "Talk to Sales", href: "mailto:sales@infiniview.dev", highlight: false,
  },
];

const FAQS = [
  { q: "What counts as a scan?", a: "A scan is triggered each time Infiniview analyzes a pull request or runs on-demand from the CLI. Each scan includes code review, security analysis, and any enabled testing agents." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade, downgrade, or cancel anytime. When upgrading, you get prorated credit for the remainder of your billing cycle." },
  { q: "How do I get access?", a: "Join the waitlist and we'll invite you as spots open. Early waitlist members get priority access and launch pricing." },
  { q: "Is my code safe?", a: "All code is analyzed inside isolated cloud sandboxes and never stored after the scan completes. Sandboxes are destroyed immediately after each run." },
];

/* ─── Waitlist Form ─── */

function WaitlistForm({ id, className }: { id?: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div id={id} className={cn("font-mono text-[15px] text-lime py-4", className)}>
        you're on the list. we'll be in touch.
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
      }}
      className={cn("flex gap-2 items-stretch flex-wrap sm:flex-nowrap", className)}
    >
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="font-mono text-sm bg-bg-elevated border border-border px-4 py-4 text-text placeholder:text-text-muted focus:outline-none focus:border-lime w-full sm:w-[260px]"
      />
      <button type="submit" className="btn-lime text-[15px] px-5 py-4 tracking-[-0.015em] whitespace-nowrap">
        JOIN WAITLIST →
      </button>
    </form>
  );
}

/* ─── Hero ─── */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="adv-grid-bg absolute inset-0 opacity-[0.32]" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(1000px 520px at 82% 12%, rgba(210,251,90,0.10), transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 pt-20 pb-[72px]">
        <h1 className="text-[clamp(48px,12.5vw,196px)] font-bold leading-[0.86] tracking-[-0.05em]">
          code that ships<br />
          <span className="relative inline-block">
            <span className="hero-broken">broken.</span>
            <span className="hero-ready text-glow-lime">
              <span className="text-lime">battle-ready.</span>
            </span>
          </span>
        </h1>

        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr_1fr] gap-8 md:gap-12">
          <div>
            <p className="text-lg md:text-xl leading-relaxed text-[#c5c7c1] max-w-[480px]">
              Infiniview deploys AI agents that scan, attack, and stress-test your code inside cloud sandboxes — then delivers forensic findings, proof bundles, and a readiness score so you ship with confidence.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-start">
            <WaitlistForm id="waitlist" />
            <a href={DOCS_URL} className="btn-ghost px-5 py-[15px]">
              read the docs
            </a>
            <div className="font-mono text-[11.5px] text-text-muted mt-2.5">
              join the waitlist for early access
            </div>
            <div className="font-mono text-[11px] text-text-secondary mt-1 flex gap-3.5 flex-wrap">
              <span><span className="text-lime">●</span> indie</span>
              <span><span className="text-lime">●</span> startup</span>
              <span><span className="text-lime">●</span> enterprise</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10.5px] text-lime tracking-[0.18em]">
              SCAN PIPELINE //
            </div>
            <div className="mt-3.5 border border-border bg-bg-elevated/70">
              {WIRE_EVENTS.map((evt, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[70px_124px_1fr] gap-2 font-mono text-[11.5px] px-3 py-[9px]",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="text-text-muted">{evt.phase}</span>
                  <span className="text-cyan">{evt.agent}</span>
                  <span className={evt.color}>▸ {evt.msg}</span>
                </div>
              ))}
              <div className="font-mono text-[11px] text-text-muted px-3 py-[9px] border-t border-border flex justify-between">
                <span>posted to PR #247</span>
                <span>→ dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee ─── */

function Marquee() {
  return (
    <div className="py-5 border-b border-border bg-bg-elevated overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-[120px] bg-gradient-to-r from-bg-elevated to-transparent z-[2]" />
      <div className="absolute right-0 top-0 bottom-0 w-[120px] bg-gradient-to-l from-bg-elevated to-transparent z-[2]" />
      <div className="flex">
        <div className="flex gap-10 font-mono text-xs whitespace-nowrap animate-ticker">
          {[0, 1].flatMap((n) =>
            MARQUEE_ITEMS.map((item, i) => (
              <span
                key={`${n}-${i}`}
                className={i % 4 === 0 ? "text-lime" : "text-text-secondary"}
              >
                <span className="text-lime">●</span>&nbsp;&nbsp;{item}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── How It Works ─── */

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [01] / HOW IT WORKS
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-[clamp(48px,7vw,104px)] font-bold leading-[0.94] tracking-[-0.045em] mt-[18px]"
              >
                from PR to <span className="text-lime">battle-tested</span>
                <br />in seconds.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2} className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Code review, security testing, interaction testing — fully automated, fully sandboxed.
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border"
        >
          {PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="bg-bg p-6 lg:py-[30px] lg:px-[22px] min-h-[260px] lg:min-h-[300px] flex flex-col"
            >
              <div className="font-mono flex justify-between text-[10.5px] text-text-muted tracking-[0.14em]">
                <span className="text-lime">[{s.n}]</span>
                <span>{s.tag}</span>
              </div>
              <div className="text-[20px] lg:text-[22px] font-bold leading-[1.1] tracking-[-0.025em] mt-8">
                {s.h}
              </div>
              <p className="text-[13px] leading-[1.55] text-text-secondary mt-3.5">{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Multi-Agent System ─── */

function AgentSystem() {
  return (
    <section id="agents" className="py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [02] / MULTI-AGENT AI
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-[clamp(48px,7vw,100px)] font-bold leading-[0.96] tracking-[-0.045em] mt-[18px]"
              >
                specialized agents,<br />
                <span className="text-lime">working in parallel.</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2} className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Each agent has distinct models, tools, and objectives — reviewing, attacking, and stress-testing your code simultaneously.
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border"
        >
          {AGENTS.map((a, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="bg-bg p-6 md:px-[30px] md:py-[34px] min-h-[220px] md:min-h-[240px]"
            >
              <div className="font-mono flex justify-between text-[10.5px] text-text-muted tracking-[0.14em]">
                <span className="text-lime">{a.tag}</span>
                <span className="bg-bg-elevated border border-border px-2.5 py-[3px] text-text-secondary">
                  {a.model}
                </span>
              </div>
              <div className="text-2xl md:text-[32px] font-bold tracking-[-0.03em] mt-7 md:mt-[30px]">
                {a.h}
              </div>
              <p className="text-sm leading-relaxed text-text-secondary mt-3">{a.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Security & Testing Arsenal ─── */

function Arsenal() {
  return (
    <section id="security-testing" className="py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [03] / SECURITY &amp; TESTING ARSENAL
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-[clamp(44px,6.5vw,92px)] font-bold leading-[0.98] tracking-[-0.045em] mt-[18px]"
              >
                scanners. agents. interaction tests.
                <br />
                <span className="text-lime">zero blind spots.</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2} className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Static analysis, runtime attacks, and AI-driven interaction testing — combined into one comprehensive pipeline.
            </motion.div>
          </div>
        </motion.div>

        {/* Static Scanners */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em] mb-3.5">
            // STATIC SCANNERS
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border mb-12">
            {SCANNER_GROUPS.map((g, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="bg-bg py-[22px] px-[18px]">
                <div className="flex justify-between items-center mb-3.5">
                  <span className="text-[13px] font-semibold">{g.label}</span>
                  <span className="font-mono text-[10.5px] text-lime bg-lime-glow px-2 py-[2px] rounded-full">
                    {g.items.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="font-mono text-[10.5px] text-text-secondary bg-bg-elevated border border-border px-[7px] py-[2px] rounded"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Runtime Attack Agents */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em] mb-3.5">
            // RUNTIME ATTACK AGENTS
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-12">
            {RUNTIME_AGENTS.map(([name, desc], i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="bg-bg px-[18px] py-[18px] flex gap-3 items-start">
                <div className="w-2 h-2 bg-red mt-1.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-medium">{name}</div>
                  <div className="font-mono text-[10.5px] text-text-muted mt-[3px]">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interaction Testing */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em] mb-2">
            // INTERACTION TESTING
          </motion.div>
          <motion.p variants={fadeUp} custom={0} className="text-sm text-text-secondary mt-0 mb-[18px] max-w-[640px]">
            AI agents run in a real browser inside the sandbox, interacting with your app like real users — catching bugs that static analysis never could.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {INTERACTION_TESTS.map(([name, desc], i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="bg-bg py-6 px-[22px]">
                <div className="font-mono text-[10px] text-text-muted tracking-[0.14em]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-[18px] font-bold tracking-[-0.02em] mt-2.5">{name}</div>
                <div className="text-[13px] text-text-secondary mt-2 leading-[1.55]">{desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features ─── */

function Features() {
  return (
    <section id="features" className="py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="flex items-baseline justify-between mb-12 gap-10">
            <div>
              <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [04] / FEATURES
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-[clamp(48px,7vw,96px)] font-bold leading-[0.98] tracking-[-0.045em] mt-[18px]"
              >
                everything you need to
                <br />
                <span className="text-lime">secure your codebase.</span>
              </motion.h2>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
        >
          {FEATURES.map(([title, desc], i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="bg-bg py-[30px] px-[26px] min-h-[200px]">
              <div className="font-mono text-[10.5px] text-text-muted tracking-[0.14em]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-[22px] font-bold tracking-[-0.025em] mt-3.5">{title}</div>
              <div className="text-[13.5px] text-text-secondary mt-2.5 leading-relaxed">{desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */

function Pricing() {
  return (
    <section id="pricing" className="py-[120px] border-b border-border relative overflow-hidden">
      <div className="adv-grid-bg absolute inset-0 opacity-[0.16]" />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <motion.div variants={fadeUp} custom={0} className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [05] / PRICING
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-[clamp(48px,7vw,96px)] font-bold leading-none tracking-[-0.045em] mt-4"
              >
                security that <span className="text-lime">scales with you.</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2} className="font-mono text-[13px] text-text-muted max-w-[320px] leading-relaxed">
              Join the waitlist to lock in launch pricing. Plans for indie hackers, startups, and enterprise.
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
        >
          {PRICING_TIERS.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className={cn(
                "flex flex-col pt-[34px] px-[28px] pb-[30px] min-h-[520px] lg:min-h-[580px]",
                t.highlight ? "bg-bg-elevated border-t-2 border-t-lime" : "bg-bg",
              )}
            >
              <div className="font-mono flex justify-between text-[10.5px] tracking-[0.14em]">
                <span className={t.highlight ? "text-lime" : "text-text-muted"}>{t.tag}</span>
                {t.highlight ? (
                  <span className="text-lime">◆ save 25%</span>
                ) : (
                  <span className="text-text-muted">·</span>
                )}
              </div>
              <div className="text-[26px] font-bold tracking-[-0.03em] mt-6">{t.name}</div>
              <p className="text-[13px] text-text-secondary mt-2 leading-[1.5]">{t.desc}</p>
              <div className="flex items-baseline gap-2.5 mt-[18px]">
                <div className="text-[60px] font-bold tracking-[-0.045em] leading-none">{t.price}</div>
                <div className="font-mono text-[11px] text-text-muted">{t.unit}</div>
              </div>
              <div className="font-mono text-[11px] text-text-muted mt-1.5">{t.scans}</div>
              <div className="flex-1" />
              <div className="border-t border-border mt-6 pt-[18px]">
                <ul className="flex flex-col gap-[9px] list-none p-0 m-0">
                  {t.bullets.map((b, j) => (
                    <li key={j} className="text-[13px] flex gap-2.5">
                      <span className="text-lime">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={t.href}
                  className={cn(
                    "mt-[22px] w-full text-center block",
                    t.highlight ? "btn-lime py-4" : "btn-ghost py-[15px]",
                  )}
                >
                  {t.cta} →
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="font-mono mt-[18px] text-[11px] text-text-muted flex gap-[22px] flex-wrap">
          <span>▸ PR Scan = 1 credit</span>
          <span>▸ Full Security Audit = 3 credits</span>
          <span>▸ CLI On-Demand = 1 credit</span>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12">
          <div>
            <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
              [06] / QUESTIONS
            </div>
            <h2 className="text-[clamp(48px,6vw,84px)] font-bold tracking-[-0.045em] leading-[1.02] mt-4">
              questions?<br />
              <span className="text-lime">answers.</span>
            </h2>
            <div className="font-mono text-xs text-text-muted mt-6 leading-[1.7] max-w-[280px]">
              hello@infiniview.dev gets a human, usually same day.
            </div>
          </div>
          <div className="border-t border-border">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="border-b border-border">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full bg-transparent border-0 text-text text-left py-[22px] px-1 cursor-pointer flex items-center gap-4"
                  >
                    <span className="font-mono text-[11px] text-text-muted w-[34px] shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[22px] font-bold tracking-[-0.025em] flex-1">{f.q}</span>
                    <span
                      className={cn(
                        "font-mono text-[18px] w-5 text-right",
                        isOpen ? "text-lime" : "text-text-muted",
                      )}
                    >
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-1 pb-6 pl-[54px] text-[15px] leading-[1.65] text-text-secondary max-w-[720px]">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Challenge CTA ─── */

function ChallengeCTA() {
  return (
    <section id="challenge" className="relative overflow-hidden bg-lime text-bg">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(var(--color-bg) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 py-[120px]">
        <div className="font-mono text-[11px] text-bg tracking-[0.18em] opacity-70">
          [07] / CHALLENGE MODE
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-[60px] items-end mt-5">
          <h2 className="text-[clamp(64px,11vw,160px)] font-bold tracking-[-0.055em] leading-[0.86] m-0">
            think your<br />app is <span className="italic">unbreakable?</span>
          </h2>
          <div>
            <p className="text-[18.5px] leading-[1.55] m-0 max-w-[480px]">
              Put it to the test. Our AI agents will throw everything they have at your application. If there is a crack, they will find it.
            </p>
            <div className="mt-7 flex gap-2.5 flex-wrap">
              <a
                href="#waitlist"
                className="font-mono bg-bg text-lime font-bold text-sm px-6 py-[18px] tracking-[0.02em]"
              >
                JOIN THE WAITLIST →
              </a>
              <a
                href={DOCS_URL}
                className="font-mono bg-transparent text-bg border-2 border-bg font-bold text-sm px-[22px] py-4 tracking-[0.02em]"
              >
                read the docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="bg-bg border-t border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="relative h-[22px] w-[22px] bg-lime">
            <div className="absolute inset-1 border-[1.5px] border-bg" />
          </div>
          <span className="text-[13px] font-bold">infiniview</span>
        </div>
        <div className="font-mono text-xs text-text-muted">
          © {new Date().getFullYear()} Infiniview. All rights reserved.
        </div>
        <div className="flex gap-5">
          <a href={DOCS_URL} className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Docs
          </a>
          <a href="mailto:hello@infiniview.dev" className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */

export default function LandingPage() {
  return (
    <div id="top">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <AgentSystem />
        <Arsenal />
        <Features />
        {/* <Pricing /> */}
        <FAQ />
        <ChallengeCTA />
      </main>
      <Footer />
    </div>
  );
}
