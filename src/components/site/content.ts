// All marketing copy and product facts in one place. Facts are taken from
// the existing site and the public docs (docs.infiniview.dev): scanner
// list, pipeline phases, merge-blocking rules, sandbox lifecycle.

export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";
export const CONTACT_EMAIL = "hello@infiniflop.com";
export const SALES_EMAIL = "sales@infiniflop.com";

export const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Arsenal", href: "/#arsenal" },
  { label: "Proof", href: "/#proof" },
  { label: "Pricing", href: "/pricing" },
];

/* ─── The run: seven phases, as the product's timeline labels them ─── */

export type Phase = {
  name: string;
  title: string;
  body: string;
};

export const PHASES: Phase[] = [
  {
    name: "Setup",
    title: "A sandbox is sealed around your repo.",
    body: "The branch is cloned into an isolated cloud environment. Dashboard settings merge with your .infiniview.yml and freeze for the run.",
  },
  {
    name: "Graph build",
    title: "Your codebase becomes a map.",
    body: "Infiniview parses the code and builds a security knowledge graph of routes, data flows and the files that touch them.",
  },
  {
    name: "Scanning",
    title: "Twenty-five scanners sweep it.",
    body: "Static analysis, dependency audits, secret detection and infrastructure checks run against the clone, each one reporting its own coverage.",
  },
  {
    name: "Analysis",
    title: "Findings are correlated, not stacked.",
    body: "Results are deduplicated and linked through the graph, so a single root cause reads as one problem and a chain of small ones reads as an attack path.",
  },
  {
    name: "Review",
    title: "AI reviews the change itself.",
    body: "Code review agents read the diff for correctness, maintainability and security-sensitive logic, in parallel with everything else.",
  },
  {
    name: "Testing",
    title: "Agents attack the running app.",
    body: "The app is built and served inside the glass. Runtime agents probe input handling, auth, sessions, request forgery, uploads and rate limits, and browser agents walk real user flows.",
  },
  {
    name: "Report",
    title: "Proof leaves. The sandbox doesn't.",
    body: "Findings, evidence and fixes land in the dashboard and on the pull request. Then the sandbox is torn down.",
  },
];

/* ─── Sandbox guarantees ─── */

export const GUARANTEES = [
  {
    title: "One sandbox per run",
    body: "Each scan runs in its own isolated cloud environment, apart from production and from every other run.",
  },
  {
    title: "No production access",
    body: "Agents attack the copy inside the sandbox. They never need credentials for, or a route to, your live systems.",
  },
  {
    title: "Secrets only at scan time",
    body: "Repo secrets are stored encrypted and decrypted server-side only at the moment they are injected into the sandbox.",
  },
  {
    title: "Torn down every time",
    body: "Sandbox files, logs and processes are destroyed when the run ends. Your source code is never stored.",
  },
];

/* ─── Arsenal: the scanners, exactly as the docs list them ─── */

export type Tool = { name: string; does: string; optIn?: boolean };
export type Family = { name: string; summary: string; tools: Tool[] };

export const FAMILIES: Family[] = [
  {
    name: "Static analysis",
    summary: "Source-level rule engines run against the cloned repo without executing it.",
    tools: [
      { name: "Semgrep", does: "Multi-language static analysis with custom rules" },
      { name: "ESLint Security", does: "JavaScript and TypeScript security rules" },
      { name: "Bandit", does: "Python security linter" },
      { name: "gosec", does: "Go security analyzer" },
      { name: "Brakeman", does: "Ruby on Rails security scanner" },
      { name: "SpotBugs", does: "Java static analysis for bugs and vulnerabilities" },
      { name: "PHPStan", does: "PHP static analyzer with security rules" },
      { name: "Bearer", does: "Code security scanner for sensitive data flows" },
      { name: "njsscan", does: "Node.js semantic security scanner" },
      { name: "SonarQube", does: "Static analysis via your own SonarQube service", optIn: true },
    ],
  },
  {
    name: "Dependency audit",
    summary: "Manifest- and lockfile-driven CVE detection across ecosystems.",
    tools: [
      { name: "npm audit", does: "Node.js dependency vulnerabilities" },
      { name: "pip-audit", does: "Python dependency vulnerabilities" },
      { name: "cargo-audit", does: "Rust dependency vulnerabilities" },
      { name: "OSV Scanner", does: "Open Source Vulnerabilities database" },
      { name: "Safety", does: "Python dependency safety checker", optIn: true },
      { name: "Grype", does: "Container and filesystem vulnerabilities", optIn: true },
      { name: "Retire.js", does: "Vulnerable JavaScript libraries", optIn: true },
      { name: "Snyk Open Source", does: "Snyk dependency scanning, with your token", optIn: true },
    ],
  },
  {
    name: "Secrets",
    summary: "Pattern and entropy detection for committed credentials.",
    tools: [
      { name: "Gitleaks", does: "Hardcoded secrets in git history" },
      { name: "detect-secrets", does: "Yelp's secret detection" },
      { name: "TruffleHog", does: "High-entropy and verified secrets" },
    ],
  },
  {
    name: "Config & IaC",
    summary: "Cloud-native and container manifest checks.",
    tools: [
      { name: "Trivy", does: "Misconfiguration and vulnerability scanner" },
      { name: "Checkov", does: "Infrastructure-as-code security" },
      { name: "Hadolint", does: "Dockerfile linting and security" },
      { name: "kube-linter", does: "Kubernetes manifest security gaps" },
      { name: "tfsec", does: "Terraform security scanner", optIn: true },
    ],
  },
];

export const AGENT_SURFACES = [
  "Input handling",
  "Authentication",
  "Session management",
  "Request forgery",
  "File uploads",
  "Rate limits",
];

export const CAPABILITIES = [
  {
    name: "Code review",
    body: "Reviews changed code for correctness, maintainability and security-sensitive logic.",
  },
  {
    name: "Runtime verification",
    body: "Confirms high-confidence findings against the running app. Verified findings carry a verified flag and weigh more in trust.",
  },
  {
    name: "Browser interaction testing",
    body: "Exercises reachable user flows in a sandboxed browser and records evidence for broken or risky behaviour.",
  },
  {
    name: "Evidence packages",
    body: "Collects reproducible context, affected locations and remediation guidance for every confirmed issue.",
  },
];

/* ─── Merge gate ─── */

export const TRIGGERS = [
  { how: "Open a pull request", detail: "or move one from draft to ready. Auto-review rules decide what runs." },
  { how: "Comment @infiniview review", detail: "on any pull request you're trusted on." },
  { how: "Start from the dashboard", detail: "pick a repo and branch, and a review begins." },
  { how: "Rerun", detail: "from review detail whenever readiness allows it." },
];

/* ─── FAQ (mirrored into the page's structured data) ─── */

export const FAQS = [
  {
    q: "How is this different from Snyk or SonarQube?",
    a: "Snyk and SonarQube analyse code without running it. Infiniview builds your app in a sandbox and tests it at runtime, with agents that attempt real attacks and walk real user flows, alongside static analysis and AI code review. You would otherwise need several separate tools to cover the same ground, and you can still run both inside an Infiniview scan as opt-in scanners.",
  },
  {
    q: "Do I need to write any configuration or test cases?",
    a: "No. Connect a GitHub repo and Infiniview discovers the attack surface, plans the tests and runs them. No test scripts, no OpenAPI specs. When you want control, settings live in the dashboard or in an .infiniview.yml at the root of the repo.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes that are torn down after every scan. We never store your source code. Only findings, proof bundles and scan metadata persist, so you can review results.",
  },
  {
    q: "What languages and frameworks do you support?",
    a: "Static scanners cover JavaScript and TypeScript, Python, Go, Ruby, Java, PHP and Rust, plus dependency, secret and infrastructure checks. Runtime and browser interaction testing work with web apps that the sandbox can build and serve.",
  },
  {
    q: "How long does a scan take?",
    a: "Scan budgets adapt to the size and complexity of the repo: a small project finishes well under the cap, a large monorepo gets the full budget. The maximum is one hour per run, and progress streams live to the dashboard as each phase completes.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we'll invite you as spots open. Early members get priority access and free scans during the beta.",
  },
];

/* ─── Sample run shown in the hero console (from the demo workspace) ─── */

export const SAMPLE_RUN = {
  repo: "acme/payments-api",
  pr: 482,
  branch: "feat/refund-flow",
  counts: { critical: 2, high: 3, medium: 4, low: 2 },
  tests: { passed: 18, total: 24 },
  minutes: 7,
};
