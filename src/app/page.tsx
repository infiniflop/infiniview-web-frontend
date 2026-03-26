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
  Check,
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
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

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

function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-accent/[0.04] blur-[120px]" />
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-medium tracking-wide uppercase text-text-muted",
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
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <GridBackground />

      {/* Floating orbs */}
      <div className="absolute top-32 left-[15%] h-64 w-64 rounded-full bg-accent/[0.06] blur-[100px] animate-float" />
      <div className="absolute bottom-40 right-[12%] h-48 w-48 rounded-full bg-green/[0.05] blur-[90px] animate-float-delayed" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <Badge className="border-accent/30 bg-accent-glow text-accent-light">
            <Zap size={10} />
            AI-Powered Security &amp; Code Review
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
        >
          <span className="block">Ship code that</span>
          <span className="block mt-2 bg-gradient-to-r from-accent via-accent-light to-cyan bg-clip-text text-transparent pb-2">
            fights back.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-7 max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed"
        >
          Docksmith deploys AI agents that review your code, pentest your app, and
          stress-test your UI, all inside cloud sandboxes, triggered from a PR.
        </motion.p>

        <motion.div variants={fadeUp} custom={3} className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://app.docksmith.dev"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-accent/30"
          >
            Get Started
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>

        </motion.div>

        {/* Terminal preview */}
        <motion.div
          variants={fadeUp}
          custom={4}
          className="mx-auto mt-16 max-w-3xl"
        >
          <div className="rounded-xl border border-border bg-bg-elevated shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green/60" />
              </div>
              <span className="ml-2 text-[11px] font-mono text-text-muted">docksmith scan</span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-relaxed text-text-secondary space-y-1">
              <p><span className="text-text-muted">$</span> <span className="text-text">docksmith scan --repo acme/api --branch feat/auth</span></p>
              <p className="text-text-muted mt-3">Provisioning sandbox...</p>
              <p className="text-green">&#10003; Sandbox ready (Daytona CDE)</p>
              <p className="text-green">&#10003; Repository cloned &amp; app deployed</p>
              <p className="text-text-muted mt-2">Dispatching agents...</p>
              <p className="pl-3 text-accent-light">&#9656; Code review agents analyzing changes</p>
              <p className="pl-3 text-accent-light">&#9656; Security scanners running</p>
              <p className="pl-3 text-accent-light">&#9656; Runtime attack agents probing</p>
              <p className="pl-3 text-accent-light">&#9656; Interaction testing agent stress-testing UI</p>
              <p className="text-text-muted mt-2">Building code graph (15 language parsers)...</p>
              <p className="text-green mt-2">&#10003; Scan complete: 3 critical, 7 high, 12 medium findings</p>
              <p className="text-text-muted">&#8594; Results posted to PR #247 and dashboard</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={20} className="text-text-muted animate-bounce" />
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How It Works - Pipeline                                                    */
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
    desc: "Code review, security scanners, runtime attackers, and interaction testers run in parallel.",
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
            From PR to pentest in <span className="text-accent">seconds</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Every scan follows the same battle-tested pipeline. Fully automated, fully sandboxed.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-4 md:grid-cols-5"
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
    desc: "Stress-tests the running application via computer use: fills forms, clicks buttons, injects XSS payloads, and discovers broken interactions.",
    icon: Eye,
    color: "green",
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
  green: "border-green/20 hover:border-green/40",
  red: "border-red/20 hover:border-red/40",
};

const ICON_COLOR_MAP: Record<string, string> = {
  accent: "text-accent",
  cyan: "text-cyan",
  green: "text-green",
  red: "text-red",
};

const GLOW_MAP: Record<string, string> = {
  accent: "bg-accent-glow",
  cyan: "bg-cyan-glow",
  green: "bg-green-glow",
  red: "bg-red-glow",
};

function AgentSystem() {
  return (
    <section id="agents" className="relative px-6 py-32">
      <GridBackground />
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Multi-Agent AI</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            An army of AI agents,<br />
            <span className="text-accent">working in parallel</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            A coordinated team of specialized agents, each with distinct models, tools, and objectives, that reviews, attacks, and stress-tests your code simultaneously.
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
            <motion.div
              key={agent.title}
              variants={fadeUp}
              custom={i}
              className={cn(
                "group rounded-xl border bg-bg-card p-7 transition hover:bg-bg-card-hover",
                COLOR_MAP[agent.color]
              )}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", GLOW_MAP[agent.color])}>
                  <agent.icon size={18} className={ICON_COLOR_MAP[agent.color]} />
                </div>
                <span className="rounded-full border border-border bg-bg-elevated px-2.5 py-0.5 text-[10px] font-mono font-medium text-text-muted">
                  {agent.model}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{agent.title}</h3>
              <p className="text-[13px] leading-relaxed text-text-muted">{agent.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Security Arsenal                                                          */
/* -------------------------------------------------------------------------- */

const SCANNER_GROUPS = [
  {
    label: "Static Analysis",
    count: 9,
    items: ["Semgrep", "ESLint Security", "Bandit", "gosec", "Brakeman", "SpotBugs", "PHPStan", "Bearer", "njsscan"],
  },
  {
    label: "Dependency Audit",
    count: 7,
    items: ["npm audit", "pip-audit", "cargo-audit", "OSV Scanner", "Safety", "Grype", "Retire.js"],
  },
  {
    label: "Secrets Detection",
    count: 2,
    items: ["Gitleaks", "detect-secrets"],
  },
  {
    label: "Configuration",
    count: 4,
    items: ["Trivy", "Checkov", "tfsec", "Hadolint"],
  },
];

const RUNTIME_AGENTS = [
  { name: "Injection Tester", desc: "SQL / NoSQL / OS injection" },
  { name: "Auth Attacker", desc: "LLM-guided auth attacks" },
  { name: "API Fuzzer", desc: "Endpoint fuzzing" },
  { name: "SSRF Prober", desc: "Server-side request forgery" },
  { name: "CORS Tester", desc: "Cross-origin policy testing" },
  { name: "Session Tester", desc: "Session hijacking" },
  { name: "Prompt Injection", desc: "AI endpoint attacks" },
  { name: "Rate Limit Tester", desc: "Brute-force protection" },
  { name: "Crypto Auditor", desc: "Cryptographic review" },
  { name: "File Upload Tester", desc: "Upload vulnerabilities" },
  { name: "Biz Logic Prober", desc: "Business logic flaws" },
  { name: "UI Crawler", desc: "Automated UI discovery" },
];

function SecurityArsenal() {
  return (
    <section id="security" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Security Arsenal</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Dozens of scanners. Swarms of attack agents.<br />
            <span className="text-red">Zero mercy.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            The most comprehensive security pipeline you can wire into a pull request.
          </motion.p>
        </motion.div>

        {/* Scanners */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.h3 variants={fadeUp} custom={0} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
            <Scan size={14} className="text-accent" />
            Static Scanners
          </motion.h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-14">
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
                    {group.count}
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

        {/* Runtime agents */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
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
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interaction Testing                                                       */
/* -------------------------------------------------------------------------- */

const INTERACTION_TESTS = [
  {
    title: "Form & Input Fuzzing",
    desc: "AI agents fill every form field with edge cases, unicode, overflows, and malicious payloads to find validation gaps.",
    icon: FileCode,
  },
  {
    title: "Click-Through Exploration",
    desc: "Agents navigate every button, link, and interactive element to discover broken flows, dead ends, and unexpected states.",
    icon: Eye,
  },
  {
    title: "XSS Payload Injection",
    desc: "Injects cross-site scripting payloads through the UI to test if your frontend sanitizes and escapes user input correctly.",
    icon: Bug,
  },
  {
    title: "Auth Flow Testing",
    desc: "Tests login, signup, password reset, and session management flows for broken auth, privilege escalation, and token leaks.",
    icon: Lock,
  },
  {
    title: "Responsive & State Stress",
    desc: "Rapid-fire interactions, back-button abuse, tab switching, and network interruptions to find race conditions and UI crashes.",
    icon: Activity,
  },
  {
    title: "Accessibility Probing",
    desc: "Verifies keyboard navigation, screen reader compatibility, focus traps, and ARIA attribute correctness across all views.",
    icon: Globe,
  },
];

function InteractionTesting() {
  return (
    <section id="interaction-testing" className="relative px-6 py-32">
      <GridBackground />
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Interaction Testing</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Agents that try to<br />
            <span className="text-green">break your software</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            AI-powered agents interact with your running application just like real users would, except they are specifically trying to break it. Every click, form submission, and navigation path is stress-tested.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INTERACTION_TESTS.map((test, i) => (
            <motion.div
              key={test.title}
              variants={fadeUp}
              custom={i}
              className="group rounded-xl border border-border bg-bg-card p-6 transition hover:border-green/30 hover:bg-bg-card-hover"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-glow">
                <test.icon size={18} className="text-green" />
              </div>
              <h3 className="text-[14px] font-semibold mb-2">{test.title}</h3>
              <p className="text-[13px] leading-relaxed text-text-muted">{test.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          className="mt-10 rounded-xl border border-green/20 bg-green-glow p-6 text-center"
        >
          <p className="text-[14px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Interaction testing runs inside a real browser in the cloud sandbox. Agents use computer vision and DOM introspection to interact with your app exactly as users do, finding bugs that static analysis never could.
          </p>
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
      <GridBackground />
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-16">
          <SectionLabel>Code Intelligence</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Deep understanding across<br />
            <span className="text-cyan">15 languages</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-text-secondary max-w-xl mx-auto text-lg">
            Tree-sitter parsers build a code knowledge graph covering functions, classes, endpoints, data flows, and dependencies, enabling cross-file vulnerability detection.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Languages grid */}
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

          {/* Graph capabilities */}
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
    desc: "GitHub App integration with PR webhooks. Findings posted as review comments. Installation-based access with encrypted tokens.",
  },
  {
    icon: Terminal,
    title: "CLI First",
    desc: "docksmith scan, docksmith status, docksmith auth: trigger scans and check results without leaving the terminal.",
  },
  {
    icon: Layers,
    title: "Cloud Sandboxes",
    desc: "Every scan runs in an isolated Daytona cloud environment. Your app is deployed, tested, and torn down automatically.",
  },
  {
    icon: Activity,
    title: "Real-Time Progress",
    desc: "Watch agents work in real-time via the dashboard. Polling keeps scan status, findings, and results continuously updated.",
  },
  {
    icon: Command,
    title: "Command Palette",
    desc: "Cmd+K search across all reviews, findings, and settings. Navigate the dashboard without touching the mouse.",
  },
  {
    icon: Lock,
    title: "Secrets Management",
    desc: "Per-repo encrypted secrets stored with AES-256-GCM. Environment variables injected into sandboxes at runtime.",
  },
  {
    icon: Network,
    title: "LLM Reasoning Engine",
    desc: "AI-augmented vulnerability chain detection. LLMs analyze the code graph to discover multi-step attack paths invisible to static tools.",
  },
  {
    icon: Zap,
    title: "Self-Learning",
    desc: "A feedback loop stores verified runtime exploits as discovered patterns. Future scans detect recurring vulnerabilities faster.",
  },
  {
    icon: Globe,
    title: "Configurable Scans",
    desc: "Toggle individual scanners and agents per-repo. Set auto-review, PR filters, debounce timing, and email notifications.",
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
            <span className="text-green">secure your codebase</span>
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
            <motion.div
              key={feat.title}
              variants={fadeUp}
              custom={i}
              className="group rounded-xl border border-border bg-bg-card p-6 transition hover:border-border hover:bg-bg-card-hover"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated border border-border group-hover:border-accent/20 transition">
                <feat.icon size={16} className="text-text-muted group-hover:text-accent transition" />
              </div>
              <h3 className="text-[14px] font-semibold mb-2">{feat.title}</h3>
              <p className="text-[13px] leading-relaxed text-text-muted">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tech Stack                                                                */
/* -------------------------------------------------------------------------- */

const STACK = [
  { label: "Next.js 16", category: "Framework" },
  { label: "React 19", category: "Framework" },
  { label: "Tailwind v4", category: "Styling" },
  { label: "shadcn/ui", category: "Components" },
  { label: "Prisma 7", category: "Database" },
  { label: "Neon Postgres", category: "Database" },
  { label: "WorkOS AuthKit", category: "Auth" },
  { label: "Inngest v4", category: "Jobs" },
  { label: "Daytona.io", category: "Sandboxes" },
  { label: "Vercel AI SDK", category: "AI" },
  { label: "web-tree-sitter", category: "Parsing" },
  { label: "Cloudflare R2", category: "Storage" },
];

function TechStack() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="text-center mb-14">
          <SectionLabel>Tech Stack</SectionLabel>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Built on the <span className="text-amber">modern stack</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="flex flex-wrap justify-center gap-3"
        >
          {STACK.map((tech, i) => (
            <motion.div
              key={tech.label}
              variants={fadeUp}
              custom={i}
              className="rounded-lg border border-border bg-bg-card px-4 py-2.5 transition hover:border-amber/20 hover:bg-bg-card-hover"
            >
              <span className="text-[13px] font-medium">{tech.label}</span>
              <span className="ml-2 text-[10px] font-mono text-text-muted">{tech.category}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Break My App                                                              */
/* -------------------------------------------------------------------------- */

function BreakMyApp() {
  return (
    <section className="relative px-6 py-32">
      <div className="absolute inset-0 overflow-hidden">
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
            className="group inline-flex items-center gap-3 rounded-xl border-2 border-red/40 bg-red-glow px-8 py-4 text-base font-bold text-red shadow-lg shadow-red/10 transition hover:border-red/60 hover:bg-red/20 hover:shadow-red/20"
          >
            <Bug size={18} />
            Try to Break My Product
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA                                                                       */
/* -------------------------------------------------------------------------- */

function CTA() {
  return (
    <section className="relative px-6 py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-accent/[0.05] blur-[120px]" />
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
          Set up Docksmith in minutes. Every PR gets reviewed by AI, pentested by attack agents, and stress-tested through the UI.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} className="mt-9 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://app.docksmith.dev"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-accent/30"
          >
            Start Scanning
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://docs.docksmith.dev"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-7 py-3.5 text-sm font-medium text-text-secondary transition hover:border-accent/40 hover:text-text"
          >
            Read the Docs
          </a>
        </motion.div>
      </motion.div>
    </section>
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
            ["Security", "#security"],
            ["Interaction Testing", "#interaction-testing"],
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
            className="text-[13px] font-medium text-text-muted transition hover:text-text"
          >
            Sign In
          </a>
          <a
            href="https://app.docksmith.dev"
            className="rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-accent-light"
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.nav>
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
      <Nav />
      <main>
        <Hero />
        <Pipeline />
        <AgentSystem />
        <SecurityArsenal />
        <InteractionTesting />
        <CodeGraph />
        <Features />
        <TechStack />
        <BreakMyApp />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
