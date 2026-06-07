// Static demo UI. All data is mocked. No backend logic.
// Locally-defined types (intentionally narrow) and hand-authored sample data
// for the /preview demo dashboard. Nothing here is sourced from production
// schemas or telemetry.

import type { Severity, ReviewStatus, TestResult } from "@/components/preview/ui";

export type Exploitability = "verified" | "unverified" | "not_tested";
export type FindingDelta = "new" | "recurring" | "regressed";

export interface MockReview {
  id: string;
  name: string | null;
  repoFullName: string;
  branch: string;
  status: ReviewStatus;
  summary: string | null;
  findingsCount: { critical: number; high: number; medium: number; low: number };
  passedTests: number;
  totalTests: number;
  durationMin: number | null;
  startedAgo: string;
}

export type FindingTab = "security" | "code-review" | "interaction-testing";

export interface MockFinding {
  id: string;
  reviewId: string;
  title: string;
  severity: Severity;
  category: string;
  file: string;
  line: number;
  confidence: number;
  exploitability: Exploitability;
  delta: FindingDelta;
  ruleId: string;
  scanner: string;
  summary: string;
  // Optional richer fields surfaced in the finding detail view. Where omitted,
  // the detail view falls back to `summary`/`file`/`line`.
  tab?: FindingTab;
  primaryFile?: string;
  lineStart?: number;
  lineEnd?: number;
  sourcePhase?: string;
  description?: string;
  attackPath?: string[];
  evidence?: string[];
  affectedFiles?: string[];
  suggestedFix?: string;
  poc?: string;
  suppressed?: boolean;
}

// ─── Story + readiness narrative blocks (per completed review) ───────────

export interface StoryAttackPath {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  verifiedCount: number;
  steps: string[];
}

export interface StoryRootCause {
  id: string;
  label: string;
  severity: Severity;
  findingCount: number;
  summary: string;
  files: string[];
}

export interface StoryLeverageFix {
  id: string;
  label: string;
  severity: Severity;
  reason: string;
  affectedFiles: string[];
}

export interface StoryInsights {
  attackPaths: StoryAttackPath[];
  rootCauses: StoryRootCause[];
  leverageFixes: StoryLeverageFix[];
}

export type ReadinessState = "ready" | "warning" | "blocked";

export interface ReadinessCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  blocking?: boolean;
}

export interface ReadinessDiagnostics {
  state: ReadinessState;
  summary: string;
  canRerun: boolean;
  replayReady: boolean;
  checks: ReadinessCheck[];
  recommendations: string[];
}

export interface MockInteractionTest {
  id: string;
  reviewId: string;
  result: TestResult;
  area: string;
  title: string;
  detail: string;
}

export interface MockOverviewStats {
  totalRuns: number;
  uniqueVulnerabilitiesFound: number;
}

export const MOCK_OVERVIEW_STATS: MockOverviewStats = {
  totalRuns: 184,
  uniqueVulnerabilitiesFound: 47,
};

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "rv_01",
    name: "Refund flow hardening",
    repoFullName: "acme/payments-api",
    branch: "feat/refund-flow",
    status: "completed",
    summary:
      "Refund issuance path lacks idempotency guards; multi-tab coupon stacking confirmed in checkout sandbox.",
    findingsCount: { critical: 2, high: 3, medium: 4, low: 2 },
    passedTests: 18,
    totalTests: 24,
    durationMin: 7,
    startedAgo: "12 min ago",
  },
  {
    id: "rv_02",
    name: "Marketing site redesign",
    repoFullName: "acme/web-app",
    branch: "main",
    status: "completed",
    summary:
      "Two reflected XSS vectors in the marketing CMS preview; otherwise clean. Interaction crawl found one broken footer link.",
    findingsCount: { critical: 0, high: 2, medium: 1, low: 4 },
    passedTests: 31,
    totalTests: 33,
    durationMin: 5,
    startedAgo: "47 min ago",
  },
  {
    id: "rv_03",
    name: null,
    repoFullName: "acme/notify-svc",
    branch: "chore/upgrade-deps",
    status: "in-progress",
    summary: null,
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
    passedTests: 0,
    totalTests: 0,
    durationMin: null,
    startedAgo: "2 min ago",
  },
  {
    id: "rv_04",
    name: "Tenant isolation audit",
    repoFullName: "acme/admin-api",
    branch: "feat/scoped-tokens",
    status: "completed",
    summary:
      "IDOR confirmed on /v1/orders/:id under cross-tenant token; SSRF mitigated.",
    findingsCount: { critical: 1, high: 1, medium: 2, low: 1 },
    passedTests: 22,
    totalTests: 25,
    durationMin: 9,
    startedAgo: "3 hr ago",
  },
  {
    id: "rv_05",
    name: "Mobile push pipeline",
    repoFullName: "acme/notify-svc",
    branch: "feat/push-batching",
    status: "failed",
    summary:
      "Sandbox build failed: missing FIREBASE_KEY env var. No coverage produced.",
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
    passedTests: 0,
    totalTests: 0,
    durationMin: 1,
    startedAgo: "5 hr ago",
  },
  {
    id: "rv_06",
    name: "CI pipeline cleanup",
    repoFullName: "acme/infra",
    branch: "chore/ci-bump",
    status: "pending",
    summary: null,
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
    passedTests: 0,
    totalTests: 0,
    durationMin: null,
    startedAgo: "queued",
  },
  {
    id: "rv_07",
    name: "AI assistant gateway",
    repoFullName: "acme/ai-gateway",
    branch: "feat/prompt-firewall",
    status: "completed",
    summary:
      "Prompt-injection mitigations holding under adversarial probes; one rate-limit gap on the streaming endpoint.",
    findingsCount: { critical: 0, high: 1, medium: 2, low: 1 },
    passedTests: 14,
    totalTests: 16,
    durationMin: 6,
    startedAgo: "1 d ago",
  },
];

// All findings collected for the entire workspace. The preview filters by
// reviewId when shown inside Review Detail.
export const MOCK_FINDINGS: MockFinding[] = [
  {
    id: "fd_01",
    reviewId: "rv_01",
    title: "Refund endpoint lacks idempotency key",
    severity: "critical",
    category: "Business Logic",
    file: "services/refund/handler.ts",
    line: 142,
    confidence: 96,
    exploitability: "verified",
    delta: "new",
    ruleId: "biz.idempotency.missing",
    scanner: "runtime-attack",
    summary:
      "Replaying the same refund request 5x within 1s issues 5 distinct refunds. Sandbox reproduced double-spend on a $42.00 charge.",
    tab: "security",
    primaryFile: "services/refund/handler.ts",
    lineStart: 142,
    lineEnd: 168,
    sourcePhase: "runtime-attack",
    description:
      "The refund issuance handler derives no idempotency key from the request and performs the ledger write before any duplicate check. Because the upstream gateway retries on a 200-but-slow response, a single user action can land as several writes. The attack agent replayed an in-flight refund and confirmed multiple distinct refund records were committed against one charge.",
    attackPath: [
      "Attacker initiates a legitimate refund for charge ch_42 and captures the request.",
      "Request is replayed 5 times within a 1s window before the first write settles.",
      "Each call passes the (stateful) balance check using the pre-refund balance.",
      "Five refund records commit; the customer is credited 5x the charge amount.",
    ],
    evidence: [
      "POST /v1/refund replayed x5 -> 5x HTTP 200 with distinct refund_id values.",
      "Ledger query after replay shows 5 rows for charge_id=ch_42 totalling $210.00.",
      "No 409/idempotency-conflict response observed on any replay.",
    ],
    affectedFiles: [
      "services/refund/handler.ts",
      "services/refund/ledger.ts",
      "routes/refund.ts",
    ],
    suggestedFix:
      "Require an `Idempotency-Key` header, persist it with the refund record under a unique constraint, and short-circuit replays with the original response.",
    poc: "for i in $(seq 1 5); do\n  curl -s -XPOST https://sandbox/v1/refund \\\n    -H \"Authorization: Bearer $TOKEN\" \\\n    -d '{\"charge_id\":\"ch_42\",\"amount\":4200}' &\ndone; wait\n# -> 5x {\"refund_id\":\"re_...\",\"status\":\"succeeded\"}",
  },
  {
    id: "fd_02",
    reviewId: "rv_01",
    title: "SQL injection in admin search filter",
    severity: "critical",
    category: "Injection",
    file: "services/admin/search.ts",
    line: 87,
    confidence: 92,
    exploitability: "verified",
    delta: "new",
    ruleId: "sql.injection.taint",
    scanner: "sast",
    summary:
      "Unsanitized `q` query param interpolated into raw query. PoC confirms `' OR 1=1 --` exfiltrates user emails.",
    tab: "security",
    primaryFile: "services/admin/search.ts",
    lineStart: 87,
    lineEnd: 94,
    sourcePhase: "static-analysis",
    description:
      "The admin search handler builds its SQL by string concatenation using the raw `q` query parameter. Taint analysis traces `req.query.q` directly into the executed statement with no parameterization or escaping, and the runtime probe confirmed boolean-based extraction of adjacent columns.",
    attackPath: [
      "Authenticated low-priv admin hits /admin/search?q=...",
      "`q` is concatenated into `WHERE name LIKE '%<q>%'`.",
      "Payload `%' OR 1=1 -- ` returns the full users table.",
      "UNION-based payload exfiltrates email + password_hash columns.",
    ],
    evidence: [
      "/admin/search?q=%25%27%20OR%201%3D1%20--%20 returned 4,812 rows.",
      "UNION SELECT email,password_hash,NULL... echoed credentials in results.",
    ],
    affectedFiles: ["services/admin/search.ts", "lib/db/query.ts"],
    suggestedFix:
      "Use parameterized queries / prepared statements; never interpolate request input into SQL. Add a query builder allowlist for sortable columns.",
    poc: "GET /admin/search?q=%25' OR 1=1 -- \nGET /admin/search?q=%25' UNION SELECT email,password_hash,NULL FROM users -- ",
  },
  {
    id: "fd_03",
    reviewId: "rv_01",
    title: "Missing rate limit on /v1/refund",
    severity: "high",
    category: "Auth",
    file: "routes/refund.ts",
    line: 18,
    confidence: 88,
    exploitability: "verified",
    delta: "new",
    ruleId: "rate.limit.missing",
    scanner: "runtime-attack",
    summary:
      "200 sequential requests accepted without 429. Combined with idempotency gap creates an exploitable double-refund window.",
  },
  {
    id: "fd_04",
    reviewId: "rv_01",
    title: "Hardcoded Stripe webhook secret in fallback path",
    severity: "high",
    category: "Secret Leakage",
    file: "config/stripe.ts",
    line: 24,
    confidence: 81,
    exploitability: "unverified",
    delta: "recurring",
    ruleId: "secret.hardcoded.token",
    scanner: "secrets",
    summary:
      "Test-mode webhook secret committed to repo as `STRIPE_WHSEC_FALLBACK`. Likely safe (test key) but should be rotated and removed.",
  },
  {
    id: "fd_05",
    reviewId: "rv_01",
    title: "Open redirect on post-login return URL",
    severity: "medium",
    category: "Open Redirect",
    file: "routes/auth/login.ts",
    line: 64,
    confidence: 73,
    exploitability: "verified",
    delta: "new",
    ruleId: "redirect.open.unbounded",
    scanner: "runtime-attack",
    summary:
      "`?next=` parameter accepts any absolute URL. Phishing payload `?next=https://acme-billing.support` redirects users off-domain after login.",
  },
  {
    id: "fd_06",
    reviewId: "rv_01",
    title: "Weak bcrypt cost factor",
    severity: "medium",
    category: "Crypto",
    file: "lib/auth/password.ts",
    line: 9,
    confidence: 70,
    exploitability: "not_tested",
    delta: "recurring",
    ruleId: "crypto.bcrypt.weak-cost",
    scanner: "sast",
    summary: "Cost factor of 8 is below current OWASP recommendation of 12.",
  },
  {
    id: "fd_07",
    reviewId: "rv_01",
    title: "Verbose error responses leak stack frames",
    severity: "medium",
    category: "Information Disclosure",
    file: "middleware/error.ts",
    line: 37,
    confidence: 64,
    exploitability: "unverified",
    delta: "new",
    ruleId: "errors.verbose.production",
    scanner: "sast",
    summary:
      "5xx handler returns full stack trace when `NODE_ENV !== 'production'`, but production deploys still set `NODE_ENV=staging` on canary.",
  },
  {
    id: "fd_08",
    reviewId: "rv_01",
    title: "CORS allows credentials with wildcard origin",
    severity: "medium",
    category: "CORS",
    file: "config/cors.ts",
    line: 12,
    confidence: 78,
    exploitability: "verified",
    delta: "new",
    ruleId: "cors.wildcard.credentials",
    scanner: "runtime-attack",
    summary:
      "`Access-Control-Allow-Origin: *` paired with `Allow-Credentials: true` lets any origin read authenticated responses.",
  },
  {
    id: "fd_09",
    reviewId: "rv_01",
    title: "Outdated `axios` dependency (CVE-2024-39338)",
    severity: "low",
    category: "Dependency CVE",
    file: "package.json",
    line: 41,
    confidence: 99,
    exploitability: "not_tested",
    delta: "recurring",
    ruleId: "dep.cve.axios.39338",
    scanner: "deps",
    summary: "axios 1.6.7 is vulnerable to SSRF via path-relative URLs. Upgrade to >= 1.7.4.",
  },
  {
    id: "fd_10",
    reviewId: "rv_01",
    title: "Container runs as root user",
    severity: "low",
    category: "IaC Misconfig",
    file: "deploy/Dockerfile",
    line: 1,
    confidence: 100,
    exploitability: "not_tested",
    delta: "recurring",
    ruleId: "iac.docker.root-user",
    scanner: "iac",
    summary: "No `USER` directive set; container defaults to `root`.",
  },
  {
    id: "fd_11",
    reviewId: "rv_02",
    title: "Reflected XSS in CMS preview iframe",
    severity: "high",
    category: "XSS",
    file: "apps/cms/preview.tsx",
    line: 58,
    confidence: 90,
    exploitability: "verified",
    delta: "new",
    ruleId: "xss.reflected.dom",
    scanner: "interaction",
    summary:
      "Preview renders `?title=` directly into innerHTML. Payload `<svg onload=alert(1)>` executes in editor session.",
  },
  {
    id: "fd_12",
    reviewId: "rv_02",
    title: "Stored XSS via comment markdown emoji shortcode",
    severity: "high",
    category: "XSS",
    file: "apps/cms/comments/render.ts",
    line: 113,
    confidence: 84,
    exploitability: "verified",
    delta: "new",
    ruleId: "xss.stored.markdown",
    scanner: "interaction",
    summary:
      "`:img:url=…:` shortcode is rendered without attribute escaping; `onerror` payload triggers on comment view.",
  },
  {
    id: "fd_13",
    reviewId: "rv_04",
    title: "IDOR on /v1/orders/:id across tenants",
    severity: "critical",
    category: "Auth",
    file: "services/orders/get.ts",
    line: 22,
    confidence: 95,
    exploitability: "verified",
    delta: "new",
    ruleId: "auth.idor.cross-tenant",
    scanner: "runtime-attack",
    summary:
      "Token from tenant A returns 200 with tenant B order payload when `:id` matches an existing record in B's namespace.",
    tab: "security",
    primaryFile: "services/orders/get.ts",
    lineStart: 22,
    lineEnd: 40,
    sourcePhase: "runtime-attack",
    description:
      "The order lookup resolves `:id` directly from the orders table without scoping the query to the caller's tenant. Any authenticated user can read another tenant's order by guessing or enumerating a valid order id, leaking PII and line-item totals across tenant boundaries.",
    attackPath: [
      "Tenant A user authenticates and notes their own order id format.",
      "User requests GET /v1/orders/<id-from-tenant-B> with their own token.",
      "Handler loads the row by id only; tenant scope is never checked.",
      "200 OK returns tenant B's customer name, address, and totals.",
    ],
    evidence: [
      "GET /v1/orders/ord_B17 with tenant-A token -> 200 with tenant-B payload.",
      "No 403/404 returned for cross-tenant ids across 50 sampled records.",
    ],
    affectedFiles: ["services/orders/get.ts", "lib/auth/tenant-scope.ts"],
    suggestedFix:
      "Scope every order query by `tenant_id = ctx.tenantId` and return 404 (not 403) for out-of-scope ids to avoid enumeration.",
    poc: "curl -s https://sandbox/v1/orders/ord_B17 \\\n  -H \"Authorization: Bearer $TENANT_A_TOKEN\"\n# -> 200 {\"tenant\":\"B\",\"customer\":\"...\",\"total\":18840}",
  },
  {
    id: "fd_14",
    reviewId: "rv_07",
    title: "Streaming endpoint missing per-IP rate limit",
    severity: "high",
    category: "Rate Limiting",
    file: "routes/ai/stream.ts",
    line: 31,
    confidence: 86,
    exploitability: "verified",
    delta: "new",
    ruleId: "rate.limit.streaming",
    scanner: "runtime-attack",
    summary:
      "SSE endpoint accepted 500 concurrent connections from a single IP without throttling, exhausting prompt-token budget.",
  },
];

export const MOCK_INTERACTION_TESTS: MockInteractionTest[] = [
  {
    id: "it_01",
    reviewId: "rv_01",
    result: "fail",
    area: "Auth flow",
    title: "Password reset email enumeration",
    detail:
      "Reset endpoint returns identical 200 + body whether or not the email exists, but timing differs by 380ms — usable for account discovery.",
  },
  {
    id: "it_02",
    reviewId: "rv_01",
    result: "fail",
    area: "Checkout",
    title: "Multi-tab coupon stacking",
    detail:
      "Applying SAVE10 in tab A and FREESHIP in tab B with the same cart commits both adjustments to the same order on first submit.",
  },
  {
    id: "it_03",
    reviewId: "rv_01",
    result: "fail",
    area: "API contract",
    title: "Cross-tenant access on /v1/orders/:id",
    detail:
      "Switching :id to a value from another tenant while keeping the original token returns 200 with foreign order details (IDOR).",
  },
  {
    id: "it_04",
    reviewId: "rv_01",
    result: "warn",
    area: "Form fuzzing",
    title: "Signup display name silently strips emoji",
    detail:
      "Submitting a name containing emoji succeeds but stored value omits them with no inline hint, producing a confusing UX state.",
  },
  {
    id: "it_05",
    reviewId: "rv_01",
    result: "pass",
    area: "Deep link",
    title: "Unauthed /admin/users redirect",
    detail:
      "Direct URL access without a session correctly returns 302 to /login?next=/admin/users; auth resumes the original path on success.",
  },
  {
    id: "it_06",
    reviewId: "rv_01",
    result: "pass",
    area: "Click-through",
    title: "Reviews list pagination integrity",
    detail:
      "Walking 12 pages forward + 12 back yields stable cursor, no duplicate rows, and identical totals on first and final hits.",
  },
  {
    id: "it_07",
    reviewId: "rv_01",
    result: "pass",
    area: "Business logic",
    title: "Refund cap enforcement",
    detail:
      "Attempting to refund a $42 charge for $48 via a manipulated request body is rejected at the API with 400 and audit log entry.",
  },
  {
    id: "it_08",
    reviewId: "rv_02",
    result: "fail",
    area: "Click-through",
    title: "Footer link 404",
    detail: "/legal/imprint resolves to a 404 page when reached via the marketing footer, despite being linked in the sitemap.",
  },
  {
    id: "it_09",
    reviewId: "rv_02",
    result: "warn",
    area: "Form fuzzing",
    title: "Newsletter input accepts overlength addresses",
    detail:
      "Email input accepts values up to 2,400 chars without client-side trim; backend rejects but the UX shows a generic error.",
  },
  {
    id: "it_10",
    reviewId: "rv_02",
    result: "pass",
    area: "XSS payloads",
    title: "Search bar escapes injected payloads",
    detail:
      "Submitting `<svg onload=alert(1)>` through the global search renders the literal string in results header without execution.",
  },
];

// ─── Story insights (what this run means) ────────────────────────────────

export const STORY_BY_REVIEW: Record<string, StoryInsights> = {
  rv_01: {
    attackPaths: [
      {
        id: "ap_01",
        title: "Unbounded refund replay -> double-spend",
        severity: "critical",
        summary:
          "Missing idempotency on the refund path chains with the absent rate limit to let a single refund be cashed out multiple times.",
        verifiedCount: 2,
        steps: [
          "Capture an in-flight refund request",
          "Replay it 5x within the 1s settlement window",
          "Each call passes the stale balance check",
          "Five refunds commit against one charge",
        ],
      },
      {
        id: "ap_02",
        title: "Admin search SQLi -> credential exfiltration",
        severity: "critical",
        summary:
          "The unsanitized search filter allows UNION-based extraction of the users table including password hashes.",
        verifiedCount: 1,
        steps: [
          "Authenticate as a low-priv admin",
          "Inject a boolean payload into ?q=",
          "Confirm full-table disclosure",
          "Pivot to UNION SELECT on credentials",
        ],
      },
    ],
    rootCauses: [
      {
        id: "rc_01",
        label: "Request input trusted without validation",
        severity: "critical",
        findingCount: 3,
        summary:
          "Several handlers consume request parameters directly into side effects or queries with no validation layer.",
        files: ["services/admin/search.ts", "routes/auth/login.ts", "config/cors.ts"],
      },
      {
        id: "rc_02",
        label: "Stateful writes lack idempotency",
        severity: "high",
        findingCount: 2,
        summary:
          "Money-moving endpoints write before deduplicating, so retries and replays produce duplicate effects.",
        files: ["services/refund/handler.ts", "routes/refund.ts"],
      },
    ],
    leverageFixes: [
      {
        id: "lf_01",
        label: "Add an idempotency middleware to mutating routes",
        severity: "critical",
        reason:
          "Closes the double-refund path and hardens every other write endpoint at once.",
        affectedFiles: ["services/refund/handler.ts", "routes/refund.ts"],
      },
      {
        id: "lf_02",
        label: "Introduce a shared input-validation layer",
        severity: "high",
        reason:
          "Neutralizes the SQLi, open-redirect, and CORS findings that all stem from trusting raw input.",
        affectedFiles: ["services/admin/search.ts", "config/cors.ts"],
      },
    ],
  },
  rv_04: {
    attackPaths: [
      {
        id: "ap_04",
        title: "Cross-tenant order disclosure (IDOR)",
        severity: "critical",
        summary:
          "Order lookups are not tenant-scoped, leaking PII across customers via id enumeration.",
        verifiedCount: 1,
        steps: [
          "Authenticate as tenant A",
          "Request an order id owned by tenant B",
          "Handler resolves by id only",
          "Tenant B order payload is returned",
        ],
      },
    ],
    rootCauses: [
      {
        id: "rc_04",
        label: "Authorization checks missing tenant scope",
        severity: "critical",
        findingCount: 1,
        summary: "Resource handlers authenticate the caller but never authorize the resource.",
        files: ["services/orders/get.ts"],
      },
    ],
    leverageFixes: [
      {
        id: "lf_04",
        label: "Enforce tenant scoping in the data-access layer",
        severity: "critical",
        reason: "Removes the IDOR class entirely rather than patching one route.",
        affectedFiles: ["services/orders/get.ts", "lib/auth/tenant-scope.ts"],
      },
    ],
  },
};

// ─── Readiness diagnostics (ready to rerun) ──────────────────────────────

export const READINESS_BY_REVIEW: Record<string, ReadinessDiagnostics> = {
  rv_01: {
    state: "ready",
    summary: "All sandbox artifacts captured. This run can be replayed deterministically.",
    canRerun: true,
    replayReady: true,
    checks: [
      { id: "c1", label: "Sandbox snapshot", status: "pass", detail: "Container image + seed DB captured." },
      { id: "c2", label: "Network recording", status: "pass", detail: "All outbound calls recorded for replay." },
      { id: "c3", label: "Secrets present", status: "pass", detail: "All required env vars resolved at run time." },
    ],
    recommendations: [
      "Re-run after adding the idempotency middleware to confirm the double-refund path closes.",
      "Promote the SQLi fix and re-scan the admin surface.",
    ],
  },
  rv_02: {
    state: "warning",
    summary: "Replayable, but one interaction step depended on a live third-party preview.",
    canRerun: true,
    replayReady: true,
    checks: [
      { id: "c1", label: "Sandbox snapshot", status: "pass", detail: "Captured." },
      { id: "c2", label: "CMS preview origin", status: "warn", detail: "Live origin used; replay falls back to a recording." },
    ],
    recommendations: ["Pin the CMS preview origin to the sandbox for deterministic replays."],
  },
  rv_04: {
    state: "ready",
    summary: "Run is fully reproducible.",
    canRerun: true,
    replayReady: true,
    checks: [
      { id: "c1", label: "Sandbox snapshot", status: "pass", detail: "Captured." },
      { id: "c2", label: "Auth fixtures", status: "pass", detail: "Multi-tenant tokens seeded." },
    ],
    recommendations: ["Re-run with tenant scoping enforced to verify the IDOR is resolved."],
  },
  rv_05: {
    state: "blocked",
    summary: "The run cannot be replayed until the missing build secret is provided.",
    canRerun: false,
    replayReady: false,
    checks: [
      { id: "c1", label: "Build step", status: "fail", detail: "Sandbox build failed before any coverage.", blocking: true },
      { id: "c2", label: "FIREBASE_KEY", status: "fail", detail: "Required env var was not provided.", blocking: true },
    ],
    recommendations: ["Add FIREBASE_KEY to the review's secret set and re-launch."],
  },
  rv_07: {
    state: "ready",
    summary: "Run is reproducible.",
    canRerun: true,
    replayReady: true,
    checks: [
      { id: "c1", label: "Sandbox snapshot", status: "pass", detail: "Captured." },
      { id: "c2", label: "Adversarial probe set", status: "pass", detail: "Prompt-injection corpus recorded." },
    ],
    recommendations: ["Add the per-IP rate limit and re-run the streaming stress test."],
  },
};

// ─── Convenience selectors ───────────────────────────────────────────────

export function storyForReview(reviewId: string): StoryInsights | undefined {
  return STORY_BY_REVIEW[reviewId];
}

export function readinessForReview(
  reviewId: string,
): ReadinessDiagnostics | undefined {
  return READINESS_BY_REVIEW[reviewId];
}

export function findReview(reviewId: string): MockReview | undefined {
  return MOCK_REVIEWS.find((r) => r.id === reviewId);
}

export function findingsForReview(reviewId: string): MockFinding[] {
  return MOCK_FINDINGS.filter((f) => f.reviewId === reviewId);
}

export function interactionTestsForReview(
  reviewId: string,
): MockInteractionTest[] {
  return MOCK_INTERACTION_TESTS.filter((t) => t.reviewId === reviewId);
}

// Default review surfaced when entering /preview directly without selecting
// a row first. Picked because it has the richest mix of finding categories
// and interaction-test outcomes.
export const DEFAULT_REVIEW_ID = "rv_01";
