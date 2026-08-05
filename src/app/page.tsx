import { cn } from "@/lib/utils";
import {
  ArrowRight,
  GitPullRequest,
  Box,
  Bot,
  Filter,
  FileText,
  Zap,
  MousePointer,
  Code,
  Plug,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { FAQAccordion } from "@/components/faq-accordion";
import { WaitlistForm } from "@/components/waitlist-form";
import { Reveal } from "@/components/reveal";
import { CounterStat } from "@/components/counter-stat";
import { DashboardPreviewAnimated } from "@/components/dashboard-preview-animated";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";

/* ─── Data ─── */

const WIRE_EVENTS = [
  { phase: "setup", agent: "pipeline", msg: "sandboxes provisioned", color: "text-amber" },
  { phase: "scan", agent: "code-review", msg: "logic + type-safety pass", color: "text-cyan" },
  { phase: "scan", agent: "runtime-attack", msg: "runtime weakness confirmed", color: "text-red" },
  { phase: "scan", agent: "interaction", msg: "interaction issue reproduced", color: "text-red" },
  { phase: "report", agent: "pipeline", msg: "proof bundle assembled", color: "text-lime" },
];

const MARQUEE_ITEMS = [
  "INJECTION", "AUTH ATTACKS", "API FUZZING", "SSRF", "CORS",
  "SESSION HIJACKING", "PROMPT INJECTION", "RATE LIMIT", "CRYPTO AUDIT",
  "FILE UPLOAD", "BIZ-LOGIC", "UI CRAWL", "XSS PAYLOADS", "AUTH FLOWS",
  "MULTI-TAB RACE",
];

const PIPELINE_STEPS = [
  { n: "01", tag: "TRIGGER", icon: GitPullRequest, h: "Open a PR or use the dashboard.", d: "Infiniview picks it up instantly. Trigger from a pull request, an @infiniview review comment, or the dashboard." },
  { n: "02", tag: "SANDBOX", icon: Box, h: "An isolated cloud environment spins up.", d: "Your repo is cloned, built, and deployed in a secure sandbox - fully isolated from production." },
  { n: "03", tag: "AGENTS", icon: Bot, h: "Code review, scanners, attackers, and interaction testers run in parallel.", d: "Specialized agents run simultaneously - reviewing code, testing interactions, and probing for vulnerabilities." },
  { n: "04", tag: "ENRICH", icon: Filter, h: "Results are deduplicated and correlated.", d: "Findings are linked through the code graph and enriched with fix suggestions before anything ships to your PR." },
  { n: "05", tag: "REPORT", icon: FileText, h: "Forensic findings land in the dashboard.", d: "Proof bundles you can replay, export, and compare across runs. Output also posts to the PR." },
];


const PRICING_TIERS = [
  {
    tag: "[01] / STARTER", name: "Starter", price: "Free", unit: "",
    scans: "Early access",
    desc: "For indie hackers and side projects that need basic code security coverage.",
    bullets: ["AI code review on PRs", "Static security scanners", "Basic vulnerability detection", "GitHub integration", "Community support"],
    cta: "Join Waitlist", href: "#waitlist", highlight: false,
  },
  {
    tag: "[02] / PRO", name: "Pro", price: "TBD", unit: "",
    scans: "Early access",
    desc: "Full-stack security for production teams shipping fast.",
    bullets: ["Everything in Starter", "Full scanner suite", "Runtime attack agents", "AI interaction testing", "Cloud sandbox environments", "Encrypted secrets management", "Priority findings & fix suggestions", "Email & in-app notifications"],
    cta: "Join Waitlist", href: "#waitlist", highlight: true,
  },
  {
    tag: "[03] / ENTERPRISE", name: "Enterprise", price: "Custom", unit: "",
    scans: "Contact us",
    desc: "Custom security infrastructure for teams that need full control.",
    bullets: ["Everything in Pro", "Custom agent configurations", "Compliance roadmap (SOC 2, ISO)", "Dedicated integration support"],
    cta: "Talk to Sales", href: "mailto:sales@infiniflop.com", highlight: false,
  },
];

const FAQS = [
  { q: "How is this different from Snyk or SonarQube?", a: "Snyk and SonarQube are static analysis tools - they scan code without running it. Infiniview deploys your app in a sandbox and tests it at runtime with AI agents that attempt real attacks, test interactions, and review code. You'd need 4-5 separate tools to get what one Infiniview scan covers." },
  { q: "Do I need to write any configuration or test cases?", a: "No. Connect your GitHub repo and Infiniview handles everything - it discovers your attack surface, generates test plans, and executes them autonomously. No OpenAPI specs, no test scripts, no YAML configs." },
  { q: "Is my code safe?", a: "Your code runs inside isolated cloud sandboxes that are torn down after every scan. We never store your source code. Only findings, proof bundles, and scan metadata persist so you can review results." },
  { q: "What languages and frameworks do you support?", a: "Infiniview supports any language or framework that can be built and deployed in a container. The static scanners cover JavaScript/TypeScript, Python, Go, Ruby, Java, PHP, and Rust. Runtime and interaction testing works with any web application." },
  { q: "How long does a scan take?", a: "Scan time depends on your app's size and complexity. Agents run in parallel with a 10-minute timeout per phase - you'll see real-time progress in the dashboard as each agent completes its work." },
  { q: "How do I get access?", a: "Join the waitlist and we'll invite you as spots open. Early members get priority access and free scans during the beta period." },
];

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
        <div className="font-mono text-sm text-text-secondary tracking-[0.08em] mb-6 hero-hook">
          <span className="text-lime">●</span>&nbsp;&nbsp;AI writes more than half your code now. Who&apos;s checking it?
        </div>
        <h1 className="text-[clamp(48px,12.5vw,196px)] font-bold leading-[0.86] tracking-[-0.05em]">
          code that ships<br />
          <span className="relative inline-block">
            <span className="hero-broken">broken.</span>
            <span className="hero-ready text-glow-lime">
              <span className="text-lime">battle-ready.</span>
            </span>
          </span>
        </h1>

        <div className="mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr_1fr] gap-8 md:gap-12">
          <div>
            <p className="text-lg md:text-xl leading-relaxed text-[#c5c7c1] max-w-[480px]">
              Connect your repo to get a full <span className="text-lime font-semibold">security</span> audit, code <span className="text-lime font-semibold">review</span>, and <span className="text-lime font-semibold">interaction</span> stress test on every PR and on demand.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-start">
            <WaitlistForm id="waitlist" />
          </div>

          <div>
            <div className="font-mono text-[10.5px] text-lime tracking-[0.18em]">
              SCAN PIPELINE //
            </div>
            <div className="mt-3.5 border border-[#1a1d24] bg-[#0c0e12]">
              {WIRE_EVENTS.map((evt, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[55px_1fr] sm:grid-cols-[70px_124px_1fr] gap-x-2 gap-y-0.5 font-mono text-[11.5px] px-3 py-[9px] pipeline-row",
                    i > 0 && "border-t border-[#1a1d24]",
                  )}
                  style={{ animationDelay: `${1.5 + i * 0.3}s` }}
                >
                  <span className="text-[#727682]">{evt.phase}</span>
                  <span className="text-[#7dd3fc] hidden sm:block">{evt.agent}</span>
                  <span className={evt.color === "text-lime" ? "text-[#d2fb5a]" : evt.color === "text-red" ? "text-[#ff4d4d]" : evt.color === "text-cyan" ? "text-[#7dd3fc]" : "text-[#facc15]"}>
                    <span className="sm:hidden text-[#7dd3fc]">{evt.agent} </span>▸ {evt.msg}
                  </span>
                </div>
              ))}
              <div
                className="font-mono text-[11px] text-[#727682] px-3 py-[9px] border-t border-[#1a1d24] pipeline-row"
                style={{ animationDelay: `${1.5 + WIRE_EVENTS.length * 0.3}s` }}
              >
                <span>posted to PR #247</span>
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

/* ─── Trust Bar ─── */

const TRUST_STATS = [
  { value: "26", label: "scanners & security tools" },
  { value: "0", label: "test cases to write" },
  { value: "0", label: "production access required" },
  { value: "100%", label: "sandboxed & deleted after scan" },
];

function TrustBar() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {TRUST_STATS.map((s, i) => (
            <Reveal key={i} scale delay={i * 100}>
              <div className="bg-bg py-10 px-6 md:px-8 text-center">
                <div className="text-[clamp(36px,5vw,56px)] font-bold tracking-[-0.04em] leading-none text-lime">
                  {s.value}
                </div>
                <div className="font-mono text-[11px] text-text-muted tracking-[0.06em] mt-3">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <div className="font-mono text-xs text-text-muted text-center py-5 border-t border-border">
        Your code runs in isolated sandboxes and is deleted after every scan. We never store your source code.
      </div>
    </section>
  );
}

/* ─── Position Statement ─── */

function PositionStatement() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-20">
        <Reveal>
          <p className="text-[clamp(28px,4.5vw,48px)] font-bold tracking-[-0.035em] leading-[1.1] text-center max-w-[900px] mx-auto">
            The only security review you need{" "}
            <span className="text-lime">before production.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                HOW IT WORKS
              </div>
              <h2 className="text-[clamp(48px,7vw,104px)] font-bold leading-[0.94] tracking-[-0.045em] mt-[18px]">
                from PR to{" "}
                <span className="text-lime whitespace-nowrap">battle-tested</span>
                <br />in seconds.
              </h2>
            </div>
            <div className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Code review, security testing, interaction testing - fully automated, fully sandboxed.
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
          {PIPELINE_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={i} delay={i * 120}>
                <div className="bg-bg p-6 lg:py-[30px] lg:px-[22px] min-h-[260px] lg:min-h-[300px] flex flex-col">
                  <div className="font-mono flex justify-between items-center text-[10.5px] text-text-muted tracking-[0.14em]">
                    <span className="text-lime">[{s.n}]</span>
                    <span className="flex items-center gap-1.5">
                      <Icon size={14} className="text-text-muted" />
                      {s.tag}
                    </span>
                  </div>
                  <div className="text-[20px] lg:text-[22px] font-bold leading-[1.1] tracking-[-0.025em] mt-8">
                    {s.h}
                  </div>
                  <p className="text-[13px] leading-[1.55] text-text-secondary mt-3.5">{s.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard Preview ─── */

function DashboardPreview() {
  return (
    <section className="py-16 md:py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                WHAT YOU GET
              </div>
              <h2 className="text-[clamp(48px,7vw,104px)] font-bold leading-[0.94] tracking-[-0.045em] mt-[18px]">
                forensic findings,<br />
                <span className="text-lime">not just alerts.</span>
              </h2>
            </div>
            <div className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Every vulnerability comes with root-cause evidence, affected code paths, and a suggested fix.
            </div>
          </div>
        </Reveal>

        <DashboardPreviewAnimated />
      </div>
    </section>
  );
}

/* ─── Arsenal (condensed) ─── */

const ARSENAL_STATS = [
  { value: 26, suffix: "", label: "static scanners", sub: "SAST, dependencies, secrets, IaC" },
  { value: 12, suffix: "", label: "runtime attack agents", sub: "injection, auth, SSRF, session, more" },
  { value: 7, suffix: "", label: "interaction test types", sub: "forms, auth flows, XSS, race conditions" },
  { value: 4, suffix: "", label: "parallel code review agents", sub: "logic, performance, types, style" },
];

const ARSENAL_HIGHLIGHTS = [
  {
    tag: "RUNTIME ATTACKS",
    icon: Zap,
    h: "Real exploits, not guesses",
    d: "AI agents deploy your app in a sandbox and attempt real attacks - SQL injection, auth bypass, SSRF, session hijacking. If there's a crack, they find it and prove it.",
  },
  {
    tag: "INTERACTION TESTING",
    icon: MousePointer,
    h: "Tests every user path automatically",
    d: "Computer-vision agents interact with your running app like real users. They fill forms, click buttons, test auth flows, and discover broken states no static tool can find.",
  },
  {
    tag: "CODE REVIEW",
    icon: Code,
    h: "Four agents review every change",
    d: "Parallel AI agents analyze your code for logic bugs, performance issues, type safety violations, and style problems - simultaneously, on every PR.",
  },
  {
    tag: "ZERO CONFIG",
    icon: Plug,
    h: "Connect your repo. That's it.",
    d: "No test cases to write. No OpenAPI specs to provide. No scanners to configure. Infiniview discovers your attack surface and generates test plans autonomously.",
  },
];

function Arsenal() {
  return (
    <section id="arsenal" className="py-16 md:py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                THE ARSENAL
              </div>
              <h2 className="text-[clamp(48px,7vw,104px)] font-bold leading-[0.94] tracking-[-0.045em] mt-[18px]">
                every layer,<br />
                <span className="text-lime">covered.</span>
              </h2>
            </div>
            <div className="font-mono text-[13px] text-text-muted max-w-[340px] leading-relaxed">
              Static analysis, runtime attacks, interaction testing, and AI code review - combined into one scan.
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {ARSENAL_STATS.map((s, i) => (
            <div key={i} className="bg-bg py-8 px-5 md:px-6">
              <div className="text-[clamp(40px,6vw,64px)] font-bold tracking-[-0.04em] leading-none">
                <CounterStat target={s.value} suffix={s.suffix} delay={i * 100} />
              </div>
              <div className="text-[14px] font-semibold mt-3">{s.label}</div>
              <div className="font-mono text-[10.5px] text-text-muted mt-1.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border mt-12">
          {ARSENAL_HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            return (
              <Reveal key={i} delay={i * 150}>
                <div className="bg-bg p-6 md:px-[30px] md:py-[34px]">
                  <div className="font-mono text-[10.5px] text-lime tracking-[0.14em] flex items-center gap-1.5">
                    <Icon size={14} />
                    {h.tag}
                  </div>
                  <div className="text-2xl md:text-[28px] font-bold tracking-[-0.03em] mt-5">
                    {h.h}
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary mt-3">{h.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Why Infiniview (Features) ─── */

const KEY_FEATURES = [
  {
    title: "Forensic Findings",
    desc: "Every vulnerability comes with proof - screenshots, HTTP traces, console logs, affected code paths, and a fix suggestion. Show your team exactly what's wrong and how to fix it.",
    hero: true,
  },
  {
    title: "Cloud Sandboxes",
    desc: "Your code runs in isolated environments. Nothing shared. Deleted after every scan.",
  },
  {
    title: "Attack Path Analysis",
    desc: "Discovers multi-step vulnerability chains that single-point scanners miss.",
  },
  {
    title: "Self-Learning",
    desc: "Gets smarter with every scan. Learns your codebase patterns to reduce noise and improve evidence quality.",
  },
  {
    title: "Compliance Reports",
    desc: "Generate security compliance reports for SOC 2, ISO 27001, and internal audit requirements.",
  },
];

function WhyInfiniview() {
  const heroFeature = KEY_FEATURES.find((f) => f.hero);
  const restFeatures = KEY_FEATURES.filter((f) => !f.hero);

  return (
    <section id="features" className="py-16 md:py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                WHY INFINIVIEW
              </div>
              <h2 className="text-[clamp(48px,7vw,104px)] font-bold leading-[0.94] tracking-[-0.045em] mt-[18px]">
                proof,<br />
                <span className="text-lime">not alerts.</span>
              </h2>
            </div>
          </div>
        </Reveal>

        {heroFeature && (
          <Reveal>
            <div className="border-l-2 border-l-lime bg-bg-elevated/50 p-8 md:p-10 mb-px border-animate">
              <div className="text-[28px] md:text-[36px] font-bold tracking-[-0.03em]">
                {heroFeature.title}
              </div>
              <p className="text-[15px] leading-relaxed text-text-secondary mt-4 max-w-[640px]">
                {heroFeature.desc}
              </p>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {restFeatures.map((f, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="bg-bg py-[30px] px-[26px] min-h-[180px]">
                <div className="text-[22px] font-bold tracking-[-0.025em]">{f.title}</div>
                <div className="text-[13.5px] text-text-secondary mt-2.5 leading-relaxed">{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing (kept for possible re-enable; live pricing lives at /pricing) ─── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally unused while section is commented out below
function Pricing() {
  return (
    <section id="pricing" className="py-[120px] border-b border-border relative overflow-hidden">
      <div className="adv-grid-bg absolute inset-0 opacity-[0.16]" />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
        <div>
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-12 gap-6 lg:gap-10">
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                [05] / PRICING
              </div>
              <h2 className="text-[clamp(48px,7vw,96px)] font-bold leading-none tracking-[-0.045em] mt-4">
                security that <span className="text-lime">scales with you.</span>
              </h2>
            </div>
            <div className="font-mono text-[13px] text-text-muted max-w-[320px] leading-relaxed">
              Join the waitlist to lock in launch pricing. Plans for indie hackers, startups, and enterprise.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {PRICING_TIERS.map((t, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col pt-[34px] px-[28px] pb-[30px] min-h-[520px] lg:min-h-[580px]",
                t.highlight ? "bg-bg-elevated border-t-2 border-t-lime" : "bg-bg",
              )}
            >
              <div className="font-mono flex justify-between text-[10.5px] tracking-[0.14em]">
                <span className={t.highlight ? "text-lime" : "text-text-muted"}>{t.tag}</span>
                {t.highlight ? (
                  <span className="text-lime">◆ early access</span>
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
            </div>
          ))}
        </div>

        <div className="font-mono mt-[18px] text-[11px] text-text-muted flex gap-[22px] flex-wrap">
          <span>▸ Plan details finalized before launch</span>
          <span>▸ Waitlist members get priority access</span>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-[120px] border-b border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12">
          <Reveal>
            <div>
              <div className="font-mono text-[11px] text-lime tracking-[0.18em]">
                QUESTIONS
              </div>
              <h2 className="text-[clamp(48px,6vw,84px)] font-bold tracking-[-0.045em] leading-[1.02] mt-4">
                questions?<br />
                <span className="text-lime">answers.</span>
              </h2>
              <div className="font-mono text-xs text-text-muted mt-6 leading-[1.7] max-w-[280px]">
                hello@infiniflop.com gets a human, usually same day.
              </div>
            </div>
          </Reveal>
          <FAQAccordion faqs={FAQS} />
        </div>
      </div>
    </section>
  );
}

/* ─── Challenge CTA ─── */

function ChallengeCTA() {
  return (
    <section id="challenge" className="relative overflow-hidden bg-lime text-[#07080b]">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(#07080b 1px, transparent 1px), linear-gradient(90deg, #07080b 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-[120px]">
        <Reveal>
          <div className="font-mono text-[11px] text-[#07080b] tracking-[0.18em] opacity-70">
            CHALLENGE MODE
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-[60px] items-end mt-5">
            <h2 className="text-[clamp(40px,11vw,160px)] font-bold tracking-[-0.055em] leading-[0.86] m-0">
              think your<br />app is <span className="italic">unbreakable?</span>
            </h2>
            <div>
              <p className="text-[18.5px] leading-[1.55] m-0 max-w-[480px]">
                Put it to the test. Our AI agents will throw everything they have at your application. If there is a crack, they will find it.
              </p>
              <div className="mt-7 flex gap-2.5 flex-wrap">
                <a
                  href="#waitlist"
                  className="font-mono bg-[#07080b] text-[#d2fb5a] font-bold text-sm px-6 py-[18px] tracking-[0.02em] inline-flex items-center gap-1.5 whitespace-nowrap pulse-cta"
                >
                  GET EARLY ACCESS <ArrowRight size={15} strokeWidth={2.5} />
                </a>
                <a
                  href={DOCS_URL}
                  className="font-mono bg-transparent text-[#07080b] border-2 border-[#07080b] font-bold text-sm px-[22px] py-4 tracking-[0.02em]"
                >
                  read the docs
                </a>
              </div>
            </div>
          </div>
        </Reveal>
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
            <div className="absolute inset-1 border-[1.5px] border-[#07080b]" />
          </div>
          <span className="text-[13px] font-bold">infiniview</span>
        </div>
        <div className="font-mono text-xs text-text-muted">
          © {new Date().getFullYear()} Infiniview · Built by Infiniflop Labs
        </div>
        <div className="flex gap-5">
          <a href={DOCS_URL} className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Docs
          </a>
          <a href="mailto:hello@infiniflop.com" className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Contact
          </a>
          <a href="/privacy" className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Privacy
          </a>
          <a href="/terms" className="font-mono text-xs text-text-secondary transition-colors hover:text-lime">
            Terms
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
      <Nav docsUrl={DOCS_URL} />
      <main>
        <Hero />
        <Marquee />
        <TrustBar />
        <PositionStatement />
        <HowItWorks />
        <DashboardPreview />
        <Arsenal />
        <WhyInfiniview />
        {/* <Pricing /> */}
        <FAQ />
        <ChallengeCTA />
      </main>
      <Footer />
    </div>
  );
}
