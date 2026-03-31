"use client";

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
  Braces,
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

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 z-50 w-full border-b border-border/50 bg-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
            <Terminal size={13} className="text-accent" />
          </div>
          <span className="text-[14px] font-bold tracking-tight">docksmith</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {[
            ["How It Works", "#how-it-works"],
            ["Agents", "#agents"],
            ["Security & Testing", "#security-testing"],
            ["Languages", "#languages"],
            ["Features", "#features"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[13px] font-medium text-text-muted transition hover:text-text"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://app.docksmith.dev/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[13px] text-text-muted hover:text-text hover:bg-transparent"
            )}
          >
            Sign In
          </a>
          <a
            href="https://app.docksmith.dev"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-accent px-4 text-[13px] font-semibold text-white hover:bg-accent-light"
            )}
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden grain-overlay">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent/[0.04] blur-[150px]" />
      </div>
      <AgentBattleNetwork />

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
          Docksmith deploys AI agents that review your code, run security scans,
          attack your app, and stress-test your UI - all inside cloud sandboxes,
          triggered from a single PR.
        </motion.p>

        <motion.div variants={fadeUp} custom={3} className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://app.docksmith.dev"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-7 bg-accent text-white font-semibold shadow-lg shadow-accent/25 hover:bg-accent-light hover:shadow-accent/35 transition-all"
            )}
          >
            Get Started
            <ArrowRight size={15} />
          </a>
          <a
            href="https://docs.docksmith.dev"
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
    desc: "Open a PR, run the CLI, or click the dashboard. Docksmith picks it up instantly.",
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
    desc: "Findings land as PR comments and in the dashboard. Critical issues block the merge.",
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
            className="relative z-[2] grid gap-4 md:grid-cols-5 md:pt-6"
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
    model: "Claude Sonnet 4.6",
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
/*  Code Graph & Language Support                                             */
/* -------------------------------------------------------------------------- */

const LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Java", "Go",
  "Rust", "C#", "C++", "C", "PHP",
  "Swift", "Kotlin", "Ruby", "Scala", "Dart",
];

function CodeGraph() {
  return (
    <section id="languages" className="relative px-6 py-32">
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Code Intelligence</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Deep understanding across<br />
            <span className="text-cyan">15 languages</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Tree-sitter parsers build a code knowledge graph - functions, classes, endpoints, data flows, and dependencies - enabling cross-file vulnerability detection.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border bg-bg-card p-7">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
              <Braces size={14} className="text-cyan" />
              Supported Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <span
                  key={lang}
                  className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-[12px] font-mono font-medium text-text-secondary transition hover:border-cyan/30 hover:text-text"
                >
                  {lang}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border bg-bg-card p-7">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
              <Network size={14} className="text-accent" />
              Code Graph Nodes
            </h3>
            <div className="space-y-3">
              {[
                { label: "Functions & Methods", desc: "Parameters, return types, async status, exports" },
                { label: "Endpoints", desc: "HTTP routes, middleware chains, auth requirements" },
                { label: "Data Flows", desc: "Tainted input tracing from source to sink" },
                { label: "Dependencies", desc: "Package versions, known CVEs, fix versions" },
                { label: "Classes & Imports", desc: "Inheritance trees, module graphs" },
                { label: "Auth Gates & Middleware", desc: "Authorization checks and middleware ordering" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <span className="text-[13px] font-medium">{item.label}</span>
                    <span className="text-[12px] text-text-muted ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
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
    icon: GitBranch,
    title: "GitHub Native",
    desc: "GitHub App integration with PR webhooks. Findings posted as review comments.",
  },
  {
    icon: Layers,
    title: "Cloud Sandboxes",
    desc: "Every scan runs in an isolated Daytona cloud environment. Deployed, tested, and torn down automatically.",
  },
  {
    icon: Activity,
    title: "Real-Time Progress",
    desc: "Watch agents work in real-time via the dashboard with continuous status updates.",
  },
  {
    icon: Command,
    title: "Command Palette",
    desc: "Cmd+K search across all reviews, findings, and settings.",
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
    desc: "Verified runtime exploits become patterns. Future scans detect recurring vulnerabilities faster.",
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
/*  CLI Preview (moved down, launching soon)                                  */
/* -------------------------------------------------------------------------- */

function CLIPreview() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-10">
          <SectionLabel>Command Line</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Scan from your <span className="text-accent">terminal</span>
          </motion.h2>
          <motion.div variants={fadeUp} custom={2} className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber-glow px-4 py-1.5">
            <Zap size={12} className="text-amber" />
            <span className="text-[12px] font-semibold text-amber">CLI Feature Launching Soon</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <div className="rounded-xl border border-border bg-bg-elevated shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green/60" />
              </div>
              <span className="ml-2 text-[11px] font-mono text-text-muted">docksmith scan</span>
            </div>
            <div className="p-6 font-mono text-[14px] leading-loose text-text-secondary space-y-1">
              <p><span className="text-text-muted">$</span> <span className="text-text">docksmith scan --repo acme/api --branch feat/auth</span></p>
              <p className="text-text-muted mt-3">Provisioning sandbox...</p>
              <p className="text-green">&#10003; Sandbox ready (Daytona CDE)</p>
              <p className="text-green">&#10003; Repository cloned &amp; app deployed</p>
              <p className="text-text-muted mt-2">Dispatching agents...</p>
              <p className="pl-4 text-accent-light">&#9656; Code review agents analyzing changes</p>
              <p className="pl-4 text-accent-light">&#9656; Static security scanners running</p>
              <p className="pl-4 text-accent-light">&#9656; Runtime attack agents probing</p>
              <p className="pl-4 text-accent-light">&#9656; Interaction testing agent stress-testing UI</p>
              <p className="text-text-muted mt-2">Building code graph (15 language parsers)...</p>
              <p className="text-green mt-2">&#10003; Scan complete: 3 critical, 7 high, 12 medium findings</p>
              <p className="text-text-muted">&#8594; Results posted to PR #247 and dashboard</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA                                                                       */
/* -------------------------------------------------------------------------- */

function CTA() {
  return (
    <section className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-accent/[0.04] blur-[140px]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="relative mx-auto max-w-3xl text-center"
      >
        <motion.h2 variants={fadeUp} custom={0} className="text-4xl sm:text-5xl font-bold tracking-tight">
          Stop shipping<br />
          <span className="text-red">vulnerable code.</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="mt-5 text-lg text-text-secondary max-w-xl mx-auto">
          Set up Docksmith in minutes. Every PR gets reviewed, scanned, attacked, and stress-tested automatically.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} className="mt-9 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://app.docksmith.dev"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-7 bg-accent text-white font-semibold shadow-lg shadow-accent/25 hover:bg-accent-light hover:shadow-accent/35 transition-all"
            )}
          >
            Start Scanning
            <ArrowRight size={15} />
          </a>
          <a
            href="https://docs.docksmith.dev"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 gap-2 px-7 border-border text-text-secondary hover:border-accent/30 hover:text-text transition-all"
            )}
          >
            Read the Docs
          </a>
        </motion.div>
      </motion.div>
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
            href="https://app.docksmith.dev/login"
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
          <span className="text-[13px] font-semibold tracking-tight text-text-muted">docksmith</span>
        </div>
        <p className="text-[12px] text-text-muted">
          &copy; {new Date().getFullYear()} Docksmith. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <a href="https://github.com/docksmith" className="text-[12px] text-text-muted transition hover:text-text">
            GitHub
          </a>
          <a href="https://docs.docksmith.dev" className="text-[12px] text-text-muted transition hover:text-text">
            Docs
          </a>
          <a href="mailto:hello@docksmith.dev" className="text-[12px] text-text-muted transition hover:text-text">
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
      <ChallengeBadge />
      <Nav />
      <main>
        <Hero />
        <Pipeline />
        <AgentSystem />
        <SecurityTestingArsenal />
        <CodeGraph />
        <Features />
        <CLIPreview />
        <CTA />
        <ChallengeSection />
      </main>
      <Footer />
    </>
  );
}
