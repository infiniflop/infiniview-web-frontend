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

// ─── Convenience selectors ───────────────────────────────────────────────

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
