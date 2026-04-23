"use client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.infiniview.dev";
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";
const CLI_DOCS_URL = "https://docs.infiniview.dev/cli";

import {
  Terminal,
  Shield,
  GitBranch,
  Cpu,
  Search,
  Zap,
  Globe,
  Lock,
  Eye,
  Bot,
  ArrowRight,
  ChevronDown,
  Scan,
  Network,
  Bug,
  Command,
  Layers,
  FileCode,
  Activity,
  Code,
  Box,
  MousePointerClick,
  CreditCard,
  Wifi,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { AgentBattleNetwork } from "@/components/agent-battle-network";
import { PipelineTrack } from "@/components/circuit-pipeline";
import { Nav } from "@/components/nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[9px] min-[360px]:text-[11px] font-medium tracking-wide uppercase text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} custom={0}>
      <Badge>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {children}
      </Badge>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating Challenge Badge (always visible)                                 */
/* -------------------------------------------------------------------------- */

function ChallengeBadge() {
  return (
    <a
      href="#challenge"
      className="fixed bottom-6 right-6 z-50 hidden min-[360px]:flex items-center gap-2 rounded-full border border-red/40 bg-bg-elevated/90 backdrop-blur-md px-4 py-2.5 text-[12px] font-bold text-red shadow-lg animate-pulse-glow transition-colors hover:border-red/60 hover:bg-red/10"
    >
      <Bug size={14} />
      Challenge On
    </a>
  );
}

/* Nav is now imported from @/components/nav */

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function MarkerStrikethrough({ delay = 1.5 }: { delay?: number }) {
  return (
    <svg
      className="absolute left-0 top-[55%] w-full h-[0.18em] overflow-visible"
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      fill="none"
    >
      <motion.path
        d="M0 4 Q 10 1, 25 5 Q 40 8, 55 3 Q 70 0, 90 5 Q 110 9, 130 3 Q 150 0, 170 5 Q 185 8, 200 4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="butt"
        className="text-accent"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay, duration: 0.6, ease: "easeOut" },
          opacity: { delay, duration: 0.01 },
        }}
      />
    </svg>
  );
}

function Hero() {
  const ANIM_DELAY = 1.5;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <Badge className="border-accent/30 bg-accent-glow text-accent-light">
            <Zap size={10} />
            AI-Powered Security &amp; Code Analysis
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.08]"
        >
          <span className="block">Code that ships</span>
          <span className="relative mt-4 inline-block pt-[0.6em]">
            <motion.span
              className="absolute -top-[0.15em] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6em] font-extrabold text-accent"
              style={{ fontStyle: "italic" }}
              initial={{ opacity: 0, y: 8, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{
                delay: ANIM_DELAY + 0.35,
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              battle-ready.
            </motion.span>

            <span className="relative inline-block">
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: ANIM_DELAY + 0.3, duration: 0.4 }}
              >
                broken.
              </motion.span>
              <MarkerStrikethrough delay={ANIM_DELAY} />
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-7 max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed"
        >
          Infiniview deploys AI agents that scan, attack, and stress-test your
          code inside cloud sandboxes - then delivers forensic findings, proof
          bundles, and a readiness score so you ship with confidence.
        </motion.p>

        <motion.div variants={fadeUp} custom={3} className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <a
            href={APP_URL}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-7 bg-accent text-white font-semibold shadow-lg shadow-accent/25 hover:bg-accent-light hover:shadow-accent/35 transition-all"
            )}
          >
            Get Started
            <ArrowRight size={15} />
          </a>
          <a
            href={DOCS_URL}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 gap-2 px-7 border-border text-text-secondary hover:border-accent/30 hover:text-text transition-all"
            )}
          >
            Read the Docs
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={20} className="text-text-muted animate-bounce" />
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How It Works - Pipeline                                                   */
/* -------------------------------------------------------------------------- */

const PIPELINE_STEPS = [
  {
    num: "01",
    title: "Trigger",
    desc: "Run the CLI or click the dashboard. Infiniview picks it up instantly.",
    icon: GitBranch,
  },
  {
    num: "02",
    title: "Sandbox",
    desc: "A Daytona cloud environment spins up. Your repo is cloned, built, and deployed in isolation.",
    icon: Box,
  },
  {
    num: "03",
    title: "Agents Dispatched",
    desc: "Code review, static scanners, runtime attackers, and interaction testers run in parallel.",
    icon: Bot,
  },
  {
    num: "04",
    title: "Findings Enriched",
    desc: "Results are deduplicated, correlated through the code graph, and enriched with fix suggestions.",
    icon: Search,
  },
  {
    num: "05",
    title: "Report Delivered",
    desc: "Forensic findings land in the dashboard with proof bundles you can replay, export, and compare across runs.",
    icon: FileCode,
  },
];

function Pipeline() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>How It Works</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            From PR to <span className="text-accent">battle-tested</span> in seconds
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Code review, security testing, interaction testing - fully automated, fully sandboxed.
          </motion.p>
        </motion.div>

        <div className="relative">
          <PipelineTrack stepCount={PIPELINE_STEPS.length} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="relative z-[2] grid gap-4 md:grid-cols-5 md:pt-14"
          >
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="group relative rounded-xl border border-border bg-bg-card p-6 transition hover:border-accent/30 hover:bg-bg-card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] font-bold text-accent">{step.num}</span>
                  <div className="h-px flex-1 bg-border group-hover:bg-accent/20 transition" />
                </div>
                <step.icon size={20} className="text-text-muted mb-3 group-hover:text-accent transition" />
                <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>


      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Multi-Agent System                                                        */
/* -------------------------------------------------------------------------- */

const AGENTS = [
  {
    title: "Orchestrator",
    model: "Claude Opus 4.6",
    desc: "Coordinates the entire pipeline, dispatches specialized agents, synthesizes final reports, and decides when deeper investigation is needed.",
    icon: Cpu,
    color: "accent",
  },
  {
    title: "Code Review Agents",
    model: "GPT 5.4",
    desc: "Parallel agents analyze code changes for logic bugs, performance issues, type safety violations, and style problems.",
    icon: Code,
    color: "cyan",
  },
  {
    title: "Interaction Testing",
    model: "GPT 5.4",
    desc: "Uses computer vision to interact with your running app - fills forms, clicks buttons, injects payloads, discovers broken flows, and tests every user path.",
    icon: Eye,
    color: "teal",
  },
  {
    title: "Runtime Attack Agents",
    model: "Multiple Agents",
    desc: "AI-driven agents for injection testing, auth attacks, API fuzzing, SSRF probing, session hijacking, prompt injection, and more.",
    icon: Bug,
    color: "red",
  },
];

const COLOR_MAP: Record<string, string> = {
  accent: "border-accent/20 hover:border-accent/40",
  cyan: "border-cyan/20 hover:border-cyan/40",
  teal: "border-teal/20 hover:border-teal/40",
  red: "border-red/20 hover:border-red/40",
};

const ICON_COLOR_MAP: Record<string, string> = {
  accent: "text-accent",
  cyan: "text-cyan",
  teal: "text-teal",
  red: "text-red",
};

const GLOW_MAP: Record<string, string> = {
  accent: "bg-accent-glow",
  cyan: "bg-cyan-glow",
  teal: "bg-teal-glow",
  red: "bg-red-glow",
};

function AgentSystem() {
  return (
    <section id="agents" className="relative px-6 py-32">
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Multi-Agent AI</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Specialized agents,<br />
            <span className="text-accent">working in parallel</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Each agent has distinct models, tools, and objectives - reviewing, attacking, and stress-testing your code simultaneously.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-5 sm:grid-cols-2"
        >
          {AGENTS.map((agent, i) => (
            <motion.div key={agent.title} variants={fadeUp} custom={i}>
              <Card
                className={cn(
                  "group bg-bg-card ring-0 border transition hover:bg-bg-card-hover",
                  COLOR_MAP[agent.color]
                )}
              >
                <CardHeader className="flex-row items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", GLOW_MAP[agent.color])}>
                    <agent.icon size={18} className={ICON_COLOR_MAP[agent.color]} />
                  </div>
                  <span className="rounded-full border border-border bg-bg-elevated px-2.5 py-0.5 text-[10px] font-mono font-medium text-text-muted">
                    {agent.model}
                  </span>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{agent.title}</CardTitle>
                  <CardDescription className="text-[13px] leading-relaxed text-text-muted">{agent.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Security & Testing Arsenal (merged)                                       */
/* -------------------------------------------------------------------------- */

const SCANNER_GROUPS = [
  {
    label: "Static Analysis",
    items: ["Semgrep", "ESLint Security", "Bandit", "gosec", "Brakeman", "SpotBugs", "PHPStan", "Bearer", "njsscan", "CodeQL", "SonarQube", "Snyk Code"],
  },
  {
    label: "Dependency Audit",
    items: ["npm audit", "pip-audit", "cargo-audit", "OSV Scanner", "Safety", "Grype", "Retire.js", "Snyk Open Source"],
  },
  {
    label: "Secrets Detection",
    items: ["Gitleaks", "detect-secrets", "TruffleHog"],
  },
  {
    label: "Configuration & IaC",
    items: ["Trivy", "Checkov", "tfsec", "Hadolint", "kube-linter"],
  },
  {
    label: "License Compliance",
    items: ["FOSSA", "license-checker", "cargo-deny"],
  },
];

const RUNTIME_AGENTS = [
  { name: "Injection Tester", desc: "SQL / NoSQL / OS injection" },
  { name: "Auth Attacker", desc: "LLM-guided auth attacks" },
  { name: "API Fuzzer", desc: "Endpoint fuzzing & discovery" },
  { name: "SSRF Prober", desc: "Server-side request forgery" },
  { name: "CORS Tester", desc: "Cross-origin policy testing" },
  { name: "Session Tester", desc: "Session hijacking & fixation" },
  { name: "Prompt Injection", desc: "AI endpoint attacks" },
  { name: "Rate Limit Tester", desc: "Brute-force protection" },
  { name: "Crypto Auditor", desc: "Cryptographic weakness review" },
  { name: "File Upload Tester", desc: "Upload path traversal & RCE" },
  { name: "Biz Logic Prober", desc: "Business logic flaws" },
  { name: "UI Crawler", desc: "Automated surface discovery" },
];

const INTERACTION_TESTS = [
  {
    title: "Form & Input Fuzzing",
    desc: "AI fills every form field with edge cases, unicode, overflows, and malicious payloads to find validation gaps.",
    icon: FileCode,
  },
  {
    title: "Click-Through Exploration",
    desc: "Navigates every button, link, and interactive element to discover broken flows, dead ends, and unexpected states.",
    icon: MousePointerClick,
  },
  {
    title: "XSS Payload Injection",
    desc: "Injects cross-site scripting payloads through the UI to test frontend sanitization and escaping.",
    icon: Bug,
  },
  {
    title: "Auth Flow Testing",
    desc: "Tests login, signup, password reset, and session flows for broken auth, privilege escalation, and token leaks.",
    icon: Lock,
  },
  {
    title: "Deep Link & Navigation",
    desc: "Tests direct URL access, back-button behavior, deep links, and route guards to find auth bypass paths.",
    icon: Globe,
  },
  {
    title: "Multi-Tab Concurrency",
    desc: "Opens multiple tabs with the same session to find race conditions, stale state, and synchronization bugs.",
    icon: Layers,
  },
  {
    title: "Payment & Transaction Flows",
    desc: "Tests checkout, payment, and financial flows for double-charge, amount manipulation, and step-skipping.",
    icon: CreditCard,
  },
  {
    title: "Network Resilience",
    desc: "Simulates slow connections, timeouts, and disconnects to find error handling failures and data loss.",
    icon: Wifi,
  },

  {
    title: "Accessibility Probing",
    desc: "Verifies keyboard navigation, screen reader compatibility, focus traps, and ARIA correctness across all views.",
    icon: Eye,
  },
];

/* -------------------------------------------------------------------------- */
/*  Before / After Split                                                      */
/* -------------------------------------------------------------------------- */

const CODE_LINES_LEFT = [
  { ln: "14", parts: [{ text: "import", cls: "kw" }, { text: " { ", cls: "" }, { text: "fetch", cls: "var" }, { text: " } ", cls: "" }, { text: "from", cls: "kw" }, { text: " ", cls: "" }, { text: "'node-fetch'", cls: "str" }, { text: ";", cls: "" }] },
  { ln: "15", parts: [] },
  { ln: "16", parts: [{ text: "export async function", cls: "kw" }, { text: " ", cls: "" }, { text: "validateWebhook", cls: "fn" }, { text: "(", cls: "" }] },
  { ln: "17", parts: [{ text: "  req", cls: "var" }, { text: ": ", cls: "" }, { text: "Request", cls: "type" }] },
  { ln: "18", parts: [{ text: ") {", cls: "" }] },
  { ln: "19", parts: [{ text: "  const", cls: "kw" }, { text: " { ", cls: "" }, { text: "url", cls: "var" }, { text: " } = ", cls: "" }, { text: "await", cls: "kw" }, { text: " req.", cls: "" }, { text: "json", cls: "fn" }, { text: "();", cls: "" }] },
  { ln: "20", parts: [] },
  { ln: "21", parts: [{ text: "  // Validate the webhook endpoint", cls: "cm" }] },
  { ln: "22", parts: [{ text: "  const", cls: "kw" }, { text: " response = ", cls: "" }, { text: "await", cls: "kw" }, { text: " ", cls: "" }, { text: "fetch", cls: "fn" }, { text: "(url, {", cls: "" }] },
  { ln: "23", parts: [{ text: "    method: ", cls: "" }, { text: "'HEAD'", cls: "str" }, { text: ",", cls: "" }] },
  { ln: "24", parts: [{ text: "    timeout: 5000,", cls: "" }] },
  { ln: "25", parts: [{ text: "  });", cls: "" }] },
  { ln: "26", parts: [] },
  { ln: "27", parts: [{ text: "  return", cls: "kw" }, { text: " Response.", cls: "" }, { text: "json", cls: "fn" }, { text: "({", cls: "" }] },
  { ln: "28", parts: [{ text: "    valid: response.ok,", cls: "" }] },
  { ln: "29", parts: [{ text: "    status: response.status,", cls: "" }] },
  { ln: "30", parts: [{ text: "  });", cls: "" }] },
  { ln: "31", parts: [{ text: "}", cls: "" }] },
  { ln: "32", parts: [] },
  { ln: "33", parts: [{ text: "// Looks clean. LGTM? 👍", cls: "cm" }] },
];

const CODE_LINES_RIGHT: { ln: string; parts: { text: string; cls: string }[]; vuln?: boolean; finding?: { severity: string; sevColor: string; title: string; desc: string; evidence?: string } }[] = [
  { ln: "14", parts: [{ text: "import", cls: "kw" }, { text: " { ", cls: "" }, { text: "fetch", cls: "var" }, { text: " } ", cls: "" }, { text: "from", cls: "kw" }, { text: " ", cls: "" }, { text: "'node-fetch'", cls: "str" }, { text: ";", cls: "" }] },
  { ln: "15", parts: [] },
  { ln: "16", parts: [{ text: "export async function", cls: "kw" }, { text: " ", cls: "" }, { text: "validateWebhook", cls: "fn" }, { text: "(", cls: "" }] },
  { ln: "17", parts: [{ text: "  req", cls: "var" }, { text: ": ", cls: "" }, { text: "Request", cls: "type" }] },
  { ln: "18", parts: [{ text: ") {", cls: "" }] },
  { ln: "19", parts: [{ text: "  const", cls: "kw" }, { text: " { ", cls: "" }, { text: "url", cls: "var" }, { text: " } = ", cls: "" }, { text: "await", cls: "kw" }, { text: " req.", cls: "" }, { text: "json", cls: "fn" }, { text: "();", cls: "" }], vuln: true, finding: { severity: "CRITICAL", sevColor: "red", title: "No input validation on user-supplied URL", desc: "User-controlled URL passed directly to fetch() without validation." } },
  { ln: "21", parts: [{ text: "  // Validate the webhook endpoint", cls: "cm" }] },
  { ln: "22", parts: [{ text: "  const", cls: "kw" }, { text: " response = ", cls: "" }, { text: "await", cls: "kw" }, { text: " ", cls: "" }, { text: "fetch", cls: "fn" }, { text: "(url, {", cls: "" }], vuln: true, finding: { severity: "CRITICAL", sevColor: "red", title: "SSRF — Exploit Confirmed ⚠", desc: "Server-Side Request Forgery via unvalidated URL. Internal metadata endpoint accessible.", evidence: "POST /api/webhooks/validate {\"url\":\"http://169.254.169.254/...\"} → 200 (IAM creds leaked)" } },
  { ln: "23", parts: [{ text: "    method: ", cls: "" }, { text: "'HEAD'", cls: "str" }, { text: ",", cls: "" }] },
  { ln: "24", parts: [{ text: "    timeout: 5000,", cls: "" }] },
  { ln: "25", parts: [{ text: "  });", cls: "" }] },
  { ln: "27", parts: [{ text: "  return", cls: "kw" }, { text: " Response.", cls: "" }, { text: "json", cls: "fn" }, { text: "({", cls: "" }], vuln: true, finding: { severity: "HIGH", sevColor: "amber", title: "Response leaks internal service status", desc: "Returning response.status exposes internal infrastructure details to the caller." } },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: "text-[#ff7b72]",
  str: "text-[#a5d6ff]",
  fn: "text-[#d2a8ff]",
  cm: "text-[#484f58]",
  var: "text-[#ffa657]",
  type: "text-[#79c0ff]",
  "": "text-[#8b949e]",
};

function CodeLine({ ln, parts, vuln }: { ln: string; parts: { text: string; cls: string }[]; vuln?: boolean }) {
  return (
    <div className={cn(
      "flex font-[family-name:var(--font-mono)] text-[12px] leading-[1.9] px-4",
      vuln && "bg-red/[0.06] border-l-[3px] border-red"
    )}>
      <span className="w-10 text-right pr-4 text-[#3b3f47] select-none shrink-0">{ln}</span>
      <span className="flex-1 whitespace-pre">
        {parts.length === 0 ? "\u00A0" : parts.map((p, i) => (
          <span key={i} className={TOKEN_COLORS[p.cls]}>{p.text}</span>
        ))}
      </span>
    </div>
  );
}

function FindingCallout({ severity, sevColor, title, desc, evidence }: { severity: string; sevColor: string; title: string; desc: string; evidence?: string }) {
  const colors = sevColor === "red"
    ? { bg: "bg-red/[0.08]", border: "border-red/20", text: "text-red", badge: "bg-red/20 text-red" }
    : { bg: "bg-amber/[0.06]", border: "border-amber/20", text: "text-amber", badge: "bg-amber/20 text-amber" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("mx-4 my-1 p-3 rounded-lg border", colors.bg, colors.border)}
    >
      <div className={cn("flex items-center gap-2 text-[12px] font-bold mb-1", colors.text)}>
        <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase", colors.badge)}>{severity}</span>
        {title}
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{desc}</p>
      {evidence && (
        <p className="text-[10px] text-[#6b7280] font-[family-name:var(--font-mono)] mt-1">▸ {evidence}</p>
      )}
    </motion.div>
  );
}

function BeforeAfterSplit() {
  return (
    <section id="before-after" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-14">
          <SectionLabel>Deep Code Analysis</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="text-text-muted">What you see</span>{" "}
            <span className="text-text-secondary">vs</span>{" "}
            <span className="text-accent">what Infiniview sees.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="relative"
        >
          <div className="flex gap-[3px]">
            {/* Left panel — standard PR review */}
            <motion.div variants={fadeUp} custom={0} className="flex-1 rounded-xl border border-border bg-bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-[12px] font-bold uppercase tracking-wider text-text-muted">Standard PR Review</span>
                <span className="text-[11px] text-[#4b5563] font-[family-name:var(--font-mono)]">src/api/webhooks.ts</span>
              </div>
              <div className="py-1">
                {CODE_LINES_LEFT.map((line, i) => (
                  <CodeLine key={i} ln={line.ln} parts={line.parts} />
                ))}
              </div>
            </motion.div>

            {/* Middle panel — Infiniview analysis */}
            <motion.div variants={fadeUp} custom={1} className="flex-1 rounded-xl border border-border bg-bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-[12px] font-bold uppercase tracking-wider text-accent">Infiniview Analysis</span>
                <span className="text-[11px] text-accent font-[family-name:var(--font-mono)]">3 findings · 1 exploit confirmed</span>
              </div>
              <div className="py-1">
                {CODE_LINES_RIGHT.map((line, i) => (
                  <div key={i}>
                    <CodeLine ln={line.ln} parts={line.parts} vuln={line.vuln} />
                    {line.finding && (
                      <FindingCallout
                        severity={line.finding.severity}
                        sevColor={line.finding.sevColor}
                        title={line.finding.title}
                        desc={line.finding.desc}
                        evidence={line.finding.evidence}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right panel — Interaction Testing Agent */}
            <motion.div variants={fadeUp} custom={2} className="w-[340px] shrink-0 rounded-xl border border-teal/20 bg-bg-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal">Interaction Testing</span>
                </div>
                <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)]">GPT 5.4</span>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {/* Explore phase */}
                <div className="rounded-lg border border-border bg-bg-elevated p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={11} className="text-teal" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal">Explore</span>
                    <span className="ml-auto rounded-full bg-green/15 px-1.5 py-0.5 text-[8px] font-bold text-green">Done</span>
                  </div>
                  <div className="space-y-1.5 font-[family-name:var(--font-mono)] text-[10px]">
                    <div className="flex items-center gap-1.5 text-green"><span>&#10003;</span><span className="text-text-muted">Found 23 endpoints</span></div>
                    <div className="flex items-center gap-1.5 text-green"><span>&#10003;</span><span className="text-text-muted">Found 4 forms</span></div>
                    <div className="flex items-center gap-1.5 text-green"><span>&#10003;</span><span className="text-text-muted">Found auth flow: JWT + session</span></div>
                  </div>
                </div>

                {/* Test phase */}
                <div className="rounded-lg border border-teal/20 bg-bg-elevated p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick size={11} className="text-teal" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal">Test</span>
                    <span className="ml-auto rounded-full bg-teal/15 px-1.5 py-0.5 text-[8px] font-bold text-teal">Running</span>
                  </div>
                  <div className="space-y-1.5 font-[family-name:var(--font-mono)] text-[10px]">
                    <div className="flex items-center gap-1.5 text-green"><span>&#10003;</span><span className="text-text-muted">Filled webhook URL with SSRF payload</span></div>
                    <div className="flex items-center gap-1.5 text-green"><span>&#10003;</span><span className="text-text-muted">Submitted form &mdash; server returned 200</span></div>
                    <div className="flex items-center gap-1.5 text-red"><span>&#9888;</span><span className="text-text-muted">Response leaked internal metadata</span></div>
                    <div className="flex items-center gap-1.5 text-[#f0883e]"><span>&#9656;</span><span className="text-text-muted">Testing XSS in webhook name...</span></div>
                  </div>
                </div>

                {/* Evidence phase */}
                <div className="rounded-lg border border-border bg-bg-elevated p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={11} className="text-red" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red">Evidence</span>
                    <span className="ml-auto rounded-full bg-red/15 px-1.5 py-0.5 text-[8px] font-bold text-red">2 exploits</span>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-md bg-red/[0.06] border border-red/15 p-2">
                      <div className="text-[9px] font-bold text-red mb-0.5">SSRF via webhook form</div>
                      <div className="text-[9px] text-text-muted font-[family-name:var(--font-mono)] leading-relaxed">Navigated to /webhooks &rarr; filled URL with internal IP &rarr; clicked &ldquo;Validate&rdquo; &rarr; IAM creds leaked</div>
                    </div>
                    <div className="rounded-md bg-red/[0.06] border border-red/15 p-2">
                      <div className="text-[9px] font-bold text-red mb-0.5">Stored XSS in webhook name</div>
                      <div className="text-[9px] text-text-muted font-[family-name:var(--font-mono)] leading-relaxed">Filled name with &lt;img onerror=alert(1)&gt; &rarr; saved &rarr; script executed</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* VS badge */}
          <div className="absolute left-[calc(50%-170px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-accent flex items-center justify-center text-[13px] font-extrabold text-white shadow-lg shadow-accent/40">
            VS
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SecurityTestingArsenal() {
  return (
    <section id="security-testing" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Security &amp; Testing Arsenal</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Scanners. Agents. Interaction tests.<br />
            <span className="text-red">Zero blind spots.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Static analysis, runtime attacks, and AI-driven interaction testing - combined into one comprehensive pipeline.
          </motion.p>
        </motion.div>

        {/* Static Scanners */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mb-16"
        >
          <motion.h3 variants={fadeUp} custom={0} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
            <Scan size={14} className="text-accent" />
            Static Scanners
          </motion.h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SCANNER_GROUPS.map((group, gi) => (
              <motion.div
                key={group.label}
                variants={fadeUp}
                custom={gi}
                className="rounded-xl border border-border bg-bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-semibold">{group.label}</h4>
                  <span className="rounded-full bg-accent-glow px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                    {group.items.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[11px] font-mono text-text-muted"
                    >
                      {item}
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
          className="mb-16"
        >
          <motion.h3 variants={fadeUp} custom={0} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
            <Bug size={14} className="text-red" />
            Runtime Attack Agents
          </motion.h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {RUNTIME_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                variants={fadeUp}
                custom={i}
                className="group flex items-start gap-3 rounded-lg border border-border bg-bg-card p-4 transition hover:border-red/20 hover:bg-bg-card-hover"
              >
                <div className="mt-0.5 h-6 w-6 shrink-0 flex items-center justify-center rounded-md bg-red-glow">
                  <Shield size={12} className="text-red" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">{agent.name}</p>
                  <p className="text-[11px] text-text-muted">{agent.desc}</p>
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
          <motion.h3 variants={fadeUp} custom={0} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
            <Eye size={14} className="text-teal" />
            Interaction Testing
          </motion.h3>
          <motion.p variants={fadeUp} custom={0} className="text-[13px] text-text-secondary mb-6">
            AI agents run in a real browser inside the sandbox, interacting with your app like real users - catching bugs that static analysis never could.
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {INTERACTION_TESTS.map((test, i) => (
              <motion.div
                key={test.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border border-border bg-bg-card p-6 transition hover:border-teal/30 hover:bg-bg-card-hover"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-glow">
                  <test.icon size={18} className="text-teal" />
                </div>
                <h4 className="text-[14px] font-semibold mb-2">{test.title}</h4>
                <p className="text-[13px] leading-relaxed text-text-muted">{test.desc}</p>
              </motion.div>
            ))}
          </div>


        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features Grid                                                             */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Search,
    title: "Forensic Findings",
    desc: "Every finding includes root-cause evidence, affected code paths, and suggested fixes - all browsable in a dedicated viewer.",
  },
  {
    icon: Layers,
    title: "Cloud Sandboxes",
    desc: "Every scan runs in an isolated Daytona cloud environment. Deployed, tested, and torn down automatically.",
  },
  {
    icon: Activity,
    title: "Scan Activity Timeline",
    desc: "Live timeline of every agent action, finding, and decision - searchable and replayable after each run.",
  },
  {
    icon: Command,
    title: "Command Palette",
    desc: "Cmd+K search across reviews, security findings, settings, security configuration, and scan history.",
  },
  {
    icon: Lock,
    title: "Secrets Management",
    desc: "Per-repo encrypted secrets stored with AES-256-GCM. Injected into sandboxes at runtime.",
  },
  {
    icon: Network,
    title: "LLM Reasoning Engine",
    desc: "AI-augmented vulnerability chain detection. LLMs analyze the code graph to discover multi-step attack paths.",
  },
  {
    icon: Zap,
    title: "Self-Learning",
    desc: "Learned patterns now feed prioritization, runtime planning, and finding evidence on future scans.",
  },
  {
    icon: Globe,
    title: "Configurable Scans",
    desc: "Toggle scanners and agents per-repo. Set auto-review, PR filters, and notifications.",
  },
  {
    icon: Shield,
    title: "Compliance Reports",
    desc: "Generate security compliance reports for SOC 2, ISO 27001, and internal audit requirements.",
  },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Features</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Everything you need to<br />
            <span className="text-teal">secure your codebase</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feat, i) => (
            <motion.div key={feat.title} variants={fadeUp} custom={i}>
              <Card className="group h-full bg-bg-card ring-0 border border-border transition hover:border-border hover:bg-bg-card-hover">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated border border-border group-hover:border-accent/20 transition">
                    <feat.icon size={16} className="text-text-muted group-hover:text-accent transition" />
                  </div>
                  <CardTitle className="text-[14px] mb-2">{feat.title}</CardTitle>
                  <CardDescription className="text-[13px] leading-relaxed text-text-muted">{feat.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CLI Preview                                                               */
/* -------------------------------------------------------------------------- */

function CLIPreview() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-10">
          <SectionLabel>Command Line</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Scan from your <span className="text-accent">terminal</span>
          </motion.h2>
          <motion.div variants={fadeUp} custom={2} className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-glow px-4 py-1.5">
            <Zap size={12} className="text-accent" />
            <span className="text-[12px] font-semibold text-accent-light">CLI Now Shipping</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <div className="rounded-xl border border-[#1a1d25] bg-[#0d0f14] shadow-2xl shadow-black/60 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#1a1d25] px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-3 text-[12px] font-[family-name:var(--font-cli)] font-medium text-[#6b7280]">infiniview scan</span>
            </div>
            <div className="px-8 py-7 font-[family-name:var(--font-cli)] text-[15px] font-medium leading-[2] text-[#8b949e] space-y-0.5">
              <p><span className="text-[#6b7280]">$</span> <span className="text-[#e6edf3] font-semibold">infiniview auth login</span></p>
              <p className="text-[#3fb950] font-semibold">&#10003; Authenticated to app.infiniview.dev</p>
              <p><span className="text-[#6b7280]">$</span> <span className="text-[#e6edf3] font-semibold">infiniview scan --repo acme/api --branch feat/auth</span></p>
              <p className="text-[#6b7280] mt-3">Provisioning sandbox...</p>
              <p className="text-[#3fb950] font-semibold">&#10003; Sandbox ready</p>
              <p className="text-[#3fb950] font-semibold">&#10003; Repository cloned &amp; app deployed</p>
              <p className="text-[#6b7280] mt-2">Dispatching agents...</p>
              <p className="pl-4 text-[#f0883e]">&#9656; Code review agents analyzing changes</p>
              <p className="pl-4 text-[#f0883e]">&#9656; Static security scanners running</p>
              <p className="pl-4 text-[#f0883e]">&#9656; Runtime attack agents probing</p>
              <p className="pl-4 text-[#f0883e]">&#9656; Interaction testing agent stress-testing UI</p>
              <p><span className="text-[#6b7280]">$</span> <span className="text-[#e6edf3] font-semibold">infiniview status --last</span></p>
              <p className="text-[#6b7280]">Following run state from the terminal...</p>
              <p className="text-[#6b7280] mt-2">Building code graph (15 language parsers)...</p>
              <p className="text-[#3fb950] font-semibold mt-2">&#10003; Scan complete: 3 critical, 7 high, 12 medium findings</p>
              <p className="mt-1 font-semibold text-[#e6edf3]">&#8594; Results posted to <span className="text-[#58a6ff]">PR #247</span> and <span className="text-[#58a6ff]">dashboard</span></p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} custom={3} className="mt-6 text-center">
          <a
            href={CLI_DOCS_URL}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-border text-text-secondary hover:border-accent/30 hover:text-text"
            )}
          >
            CLI Docs
          </a>
        </motion.div>
      </div>
    </section>
  );
}



/* -------------------------------------------------------------------------- */
/*  Challenge Section (at the very bottom)                                    */
/* -------------------------------------------------------------------------- */

function ChallengeSection() {
  return (
    <section id="challenge" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-red/[0.06] blur-[120px]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="relative mx-auto max-w-3xl text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-6">
          <Badge className="border-red/30 bg-red-glow text-red">
            <Bug size={10} />
            Challenge Mode
          </Badge>
        </motion.div>

        <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold tracking-tight">
          Think your app is<br />
          <span className="text-red">unbreakable?</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="mt-5 text-lg text-text-secondary max-w-xl mx-auto">
          Put it to the test. Our AI agents will throw everything they have at your application. If there is a crack, they will find it.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} className="mt-9">
          <a
            href={`${APP_URL}/login`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-3 rounded-xl border-2 border-red/40 bg-red-glow px-8 text-base font-bold text-red shadow-lg shadow-red/10 hover:border-red/60 hover:bg-red/20 hover:shadow-red/20 transition-all"
            )}
          >
            <Bug size={18} />
            Break My Product
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
            <Terminal size={11} className="text-accent" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-text-muted">infiniview</span>
        </div>
        <p className="text-[12px] text-text-muted">
          &copy; {new Date().getFullYear()} Infiniview. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <a href={DOCS_URL} className="text-[12px] text-text-muted transition hover:text-text">
            Docs
          </a>
          <a href="mailto:hello@infiniview.dev" className="text-[12px] text-text-muted transition hover:text-text">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <>
      <AgentBattleNetwork />
      <ChallengeBadge />
      <Nav />
      <main>
        <Hero />
        <Pipeline />
        <AgentSystem />
        <BeforeAfterSplit />
        <SecurityTestingArsenal />
        <Features />
        <CLIPreview />

        <ChallengeSection />
      </main>
      <Footer />
    </>
  );
}
