// Copy and data for the marketing site. Product claims come from the existing
// site copy and the /preview sample data — nothing here is a new metric, a new
// customer, or a new capability. Anything illustrative is labelled as sample.

export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.infiniview.dev";

export const HERO = {
  title: "Attack your code before anyone else does.",
  lede: "Connect your repo and Infiniview runs a full security audit, code review, and interaction stress test on every pull request and on demand, inside isolated cloud sandboxes.",
  assurances: ["Isolated cloud sandboxes", "No test cases to write", "Nothing touches production"],
};

/** The sample scan streamed in the hero card (same events as the previous site). */
export const WIRE_EVENTS = [
  { phase: "setup", agent: "pipeline", msg: "sandboxes provisioned", tone: "amber" },
  { phase: "scan", agent: "code-review", msg: "logic + type-safety pass", tone: "cyan" },
  { phase: "scan", agent: "runtime-attack", msg: "runtime weakness confirmed", tone: "red" },
  { phase: "scan", agent: "interaction", msg: "interaction issue reproduced", tone: "red" },
  { phase: "report", agent: "pipeline", msg: "proof bundle assembled", tone: "lime" },
] as const;

export const THREATS = [
  "Injection", "Auth attacks", "API fuzzing", "SSRF", "CORS",
  "Session hijacking", "Prompt injection", "Rate limits", "Crypto audit",
  "File upload", "Business logic", "UI crawl", "XSS payloads", "Auth flows",
  "Multi-tab races",
];

export const STATEMENT = {
  lead: "The only security review you need",
  accent: "before production.",
};

export const TRUST_STATS = [
  { value: 26, suffix: "", label: "scanners and security tools" },
  { value: 0, suffix: "", label: "test cases to write" },
  { value: 0, suffix: "", label: "production access required" },
  { value: 100, suffix: "%", label: "sandboxed and deleted after scan" },
];
export const TRUST_NOTE =
  "Your code runs in isolated sandboxes and is deleted after every scan. We never store your source code.";

export const PIPELINE_STEPS = [
  {
    id: "trigger",
    tag: "Trigger",
    title: "Open a PR or use the dashboard.",
    body: "Infiniview picks it up instantly. Trigger from a pull request, an @infiniview review comment, or the dashboard.",
  },
  {
    id: "sandbox",
    tag: "Sandbox",
    title: "An isolated cloud environment spins up.",
    body: "Your repo is cloned, built, and deployed in a secure sandbox, fully isolated from production.",
  },
  {
    id: "agents",
    tag: "Agents",
    title: "Reviewers, scanners, attackers and testers run in parallel.",
    body: "Specialized agents run simultaneously: reviewing code, testing interactions, and probing for vulnerabilities.",
  },
  {
    id: "enrich",
    tag: "Enrich",
    title: "Results are deduplicated and correlated.",
    body: "Findings are linked through the code graph and enriched with fix suggestions before anything ships to your PR.",
  },
  {
    id: "report",
    tag: "Report",
    title: "Forensic findings land in the dashboard.",
    body: "Proof bundles you can replay, export, and compare across runs. Output also posts to the PR.",
  },
] as const;

/** Sample findings for the proof explorer — fictional, drawn from the /preview demo data. */
export const SAMPLE_FINDINGS = [
  {
    id: "sqli",
    severity: "critical",
    title: "SQL injection in admin search filter",
    category: "Injection",
    file: "services/admin/search.ts",
    line: 87,
    confidence: 92,
    found: "static analysis, confirmed at runtime",
    summary:
      "Unsanitized `q` query param interpolated into a raw query. The proof of concept confirms `' OR 1=1 --` exfiltrates user emails.",
    proof: {
      kind: "http",
      lines: [
        { t: "req", v: "GET /admin/search?q=%25' OR 1=1 --" },
        { t: "res", v: "200 OK · 4,812 rows returned" },
        { t: "gap" },
        { t: "req", v: "GET /admin/search?q=%25' UNION SELECT email,password_hash,NULL FROM users --" },
        { t: "res", v: "200 OK · credentials echoed in results" },
      ],
    },
    path: [
      "Authenticated low-priv admin hits /admin/search?q=…",
      "`q` is concatenated into WHERE name LIKE '%<q>%'.",
      "Payload %' OR 1=1 -- returns the full users table.",
      "A UNION payload exfiltrates email and password_hash.",
    ],
    code: {
      file: "services/admin/search.ts",
      from: 84,
      hot: 87,
      lines: [
        "export async function searchUsers(req: Request) {",
        "  const q = req.query.q;",
        "  const rows = await db.query(",
        "    `SELECT id, name FROM users WHERE name LIKE '%${q}%'`,",
        "  );",
        "  return rows;",
        "}",
      ],
    },
    fix: {
      note: "Use parameterized queries; never interpolate request input into SQL. Add an allowlist for sortable columns.",
      diff: [
        { t: "del", v: "`SELECT id, name FROM users WHERE name LIKE '%${q}%'`," },
        { t: "add", v: "'SELECT id, name FROM users WHERE name LIKE $1'," },
        { t: "add", v: "[`%${q}%`]," },
      ],
    },
  },
  {
    id: "refund",
    severity: "critical",
    title: "Refund endpoint lacks idempotency key",
    category: "Business logic",
    file: "services/refund/handler.ts",
    line: 142,
    confidence: 96,
    found: "runtime attack agent",
    summary:
      "Replaying the same refund request 5x within 1s issues 5 distinct refunds. The sandbox reproduced a double-spend on a $42.00 charge.",
    proof: {
      kind: "http",
      lines: [
        { t: "req", v: "POST /v1/refund  {\"charge_id\":\"ch_42\",\"amount\":4200}  ×5 in 1s" },
        { t: "res", v: "5× 200 OK · 5 distinct refund_id values" },
        { t: "gap" },
        { t: "req", v: "ledger: SELECT * FROM refunds WHERE charge_id = 'ch_42'" },
        { t: "res", v: "5 rows · totalling $210.00" },
      ],
    },
    path: [
      "Attacker starts a legitimate refund for charge ch_42 and captures the request.",
      "The request is replayed 5 times within a 1s window.",
      "Each call passes the balance check against the pre-refund balance.",
      "Five refund records commit; the customer is credited 5x.",
    ],
    code: {
      file: "services/refund/handler.ts",
      from: 140,
      hot: 142,
      lines: [
        "export async function issueRefund(req: Request) {",
        "  const { charge_id, amount } = req.body;",
        "  await ledger.write({ charge_id, amount }); // no idempotency key",
        "  return respond(200, { refund_id: newId() });",
        "}",
      ],
    },
    fix: {
      note: "Require an Idempotency-Key header, persist it under a unique constraint, and short-circuit replays with the original response.",
      diff: [
        { t: "add", v: "const key = req.headers['idempotency-key'];" },
        { t: "add", v: "const prior = await ledger.findByKey(key);" },
        { t: "add", v: "if (prior) return respond(200, prior);" },
        { t: "del", v: "await ledger.write({ charge_id, amount });" },
        { t: "add", v: "await ledger.write({ charge_id, amount, key });" },
      ],
    },
  },
  {
    id: "rate",
    severity: "high",
    title: "Missing rate limit on /v1/refund",
    category: "Auth",
    file: "routes/refund.ts",
    line: 18,
    confidence: 88,
    found: "runtime attack agent",
    summary:
      "200 sequential requests were accepted without a 429. Combined with the idempotency gap, it creates an exploitable double-refund window.",
    proof: {
      kind: "http",
      lines: [
        { t: "req", v: "POST /v1/refund  ×200, sequential" },
        { t: "res", v: "200 OK on every request · 0 × 429" },
        { t: "gap" },
        { t: "req", v: "replay the same refund_id inside the window" },
        { t: "res", v: "duplicate refunds accepted" },
      ],
    },
    path: [
      "Attacker authenticates with an ordinary token.",
      "They send 200 refund requests back to back.",
      "No request is throttled; none returns 429.",
      "Paired with the idempotency gap, duplicate refunds land inside the window.",
    ],
    code: {
      file: "routes/refund.ts",
      from: 16,
      hot: 18,
      lines: [
        "import { Router } from 'express';",
        "export const router = Router();",
        "router.post('/v1/refund', auth, issueRefund); // no limiter",
        "export default router;",
      ],
    },
    fix: {
      note: "Add a per-token rate limit in front of the refund route and return 429 with a Retry-After header.",
      diff: [
        { t: "add", v: "import { rateLimit } from '../lib/rate-limit';" },
        { t: "del", v: "router.post('/v1/refund', auth, issueRefund);" },
        { t: "add", v: "router.post('/v1/refund', auth, rateLimit({ perMinute: 10 }), issueRefund);" },
      ],
    },
  },
] as const;

export const ARSENAL = [
  {
    id: "review",
    count: 4,
    unit: "parallel code review agents",
    short: "Code review",
    sub: "logic, performance, types, style",
    title: "Four agents review every change",
    body: "Parallel AI agents analyze your code for logic bugs, performance issues, type safety violations, and style problems, simultaneously, on every PR.",
  },
  {
    id: "static",
    count: 26,
    unit: "static scanners",
    short: "Static scanners",
    sub: "SAST, dependencies, secrets, IaC",
    title: "Twenty-six scanners, one pass",
    body: "Static analysis across your code, dependencies, secrets, and infrastructure-as-code, correlated with what the runtime agents confirm.",
  },
  {
    id: "runtime",
    count: 12,
    unit: "runtime attack agents",
    short: "Runtime attacks",
    sub: "injection, auth, SSRF, session, more",
    title: "Real exploits, not guesses",
    body: "AI agents deploy your app in a sandbox and attempt real attacks: SQL injection, auth bypass, SSRF, session hijacking. If there’s a crack, they find it and prove it.",
  },
  {
    id: "interaction",
    count: 7,
    unit: "interaction test types",
    short: "Interaction testing",
    sub: "forms, auth flows, XSS, race conditions",
    title: "Tests every user path automatically",
    body: "Computer-vision agents interact with your running app like real users. They fill forms, click buttons, test auth flows, and discover broken states no static tool can find.",
  },
] as const;

export const ZERO_CONFIG = {
  title: "Connect your repo. That’s it.",
  body: "No test cases to write. No OpenAPI specs to provide. No scanners to configure. Infiniview discovers your attack surface and generates test plans autonomously.",
};

export const FEATURES = {
  hero: {
    title: "Forensic findings",
    body: "Every vulnerability comes with proof: screenshots, HTTP traces, console logs, affected code paths, and a fix suggestion. Show your team exactly what’s wrong and how to fix it.",
    proofs: ["Screenshot", "HTTP trace", "Console log", "Code path", "Suggested fix"],
  },
  sandboxes: {
    title: "Cloud sandboxes",
    body: "Your code runs in isolated environments. Nothing shared. Deleted after every scan.",
  },
  paths: {
    title: "Attack path analysis",
    body: "Discovers multi-step vulnerability chains that single-point scanners miss.",
  },
  learning: {
    title: "Self-learning",
    body: "Gets smarter with every scan. Learns your codebase patterns to reduce noise and improve evidence quality.",
  },
  compliance: {
    title: "Compliance reports",
    body: "Generate security compliance reports for SOC 2, ISO 27001, and internal audit requirements.",
  },
};

export const FAQS = [
  {
    q: "How is this different from Snyk or SonarQube?",
    a: "Snyk and SonarQube are static analysis tools: they scan code without running it. Infiniview deploys your app in a sandbox and tests it at runtime with AI agents that attempt real attacks, test interactions, and review code. You’d need 4-5 separate tools to get what one Infiniview scan covers.",
  },
  {
    q: "Do I need to write any configuration or test cases?",
    a: "No. Connect your GitHub repo and Infiniview handles everything: it discovers your attack surface, generates test plans, and executes them autonomously. No OpenAPI specs, no test scripts, no YAML configs.",
  },
  {
    q: "Is my code safe?",
    a: "Your code runs inside isolated cloud sandboxes that are torn down after every scan. We never store your source code. Only findings, proof bundles, and scan metadata persist so you can review results.",
  },
  {
    q: "What languages and frameworks do you support?",
    a: "Infiniview supports any language or framework that can be built and deployed in a container. The static scanners cover JavaScript/TypeScript, Python, Go, Ruby, Java, PHP, and Rust. Runtime and interaction testing works with any web application.",
  },
  {
    q: "How long does a scan take?",
    a: "Scan time depends on your app’s size and complexity. Agents run in parallel with a 10-minute timeout per phase, and you’ll see real-time progress in the dashboard as each agent completes its work.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist and we’ll invite you as spots open. Early members get priority access and free scans during the beta period.",
  },
];

export const CTA = {
  title: "Think your app is unbreakable?",
  body: "Put it to the test. Our AI agents will throw everything they have at your application. If there is a crack, they will find it.",
};

export const FOOTER_LINKS = [
  { label: "Docs", href: DOCS_URL },
  { label: "Live demo", href: "/preview" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "mailto:hello@infiniflop.com" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
