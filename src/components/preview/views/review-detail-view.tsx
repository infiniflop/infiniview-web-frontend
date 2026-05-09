// Static demo UI. All data is mocked. No backend logic.

"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ResultChip,
  SeverityBadge,
  StatusBadge,
} from "@/components/preview/ui";
import {
  type MockFinding,
  type MockInteractionTest,
  type MockReview,
} from "@/components/preview/mock-data";
import { cn } from "@/lib/utils";

interface ReviewDetailViewProps {
  review: MockReview;
  findings: MockFinding[];
  interactionTests: MockInteractionTest[];
  onBack: () => void;
  onOpenFinding: (id: string) => void;
}

const SEVERITY_ORDER: MockFinding["severity"][] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

function groupFindingsBySeverity(findings: MockFinding[]) {
  return SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    items: findings.filter((f) => f.severity === sev),
  })).filter((g) => g.items.length > 0);
}

function passSummary(tests: MockInteractionTest[]) {
  const pass = tests.filter((t) => t.result === "pass").length;
  const fail = tests.filter((t) => t.result === "fail").length;
  const warn = tests.filter((t) => t.result === "warn").length;
  return { pass, fail, warn };
}

export function ReviewDetailView({
  review,
  findings,
  interactionTests,
  onBack,
  onOpenFinding,
}: ReviewDetailViewProps) {
  const grouped = groupFindingsBySeverity(findings);
  const totalFindings = findings.length;
  const tests = passSummary(interactionTests);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="sm" onClick={onBack} aria-label="Back to reviews">
          <ArrowLeft size={14} />
        </Button>
        <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
          Review · {review.id}
        </span>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[clamp(32px,4.5vw,48px)] font-black leading-[1.02] tracking-[-0.05em] text-foreground">
            {review.name ?? review.repoFullName}
          </h2>
          <StatusBadge status={review.status} />
          <Badge tone="outline">
            <GitBranch size={10} className="text-text-muted" />
            <span className="font-mono">{review.branch}</span>
          </Badge>
        </div>

        <div className="font-mono text-[12px] font-semibold text-text-muted">
          {review.repoFullName}
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            Started {review.startedAgo}
            {review.durationMin != null && ` · ran ${review.durationMin}m`}
          </span>
          <span className="inline-flex items-center gap-1.5 text-text-secondary hover:text-lime">
            <ExternalLink size={12} />
            View on GitHub
          </span>
        </div>

        {review.summary && (
          <p className="max-w-3xl text-[15px] font-medium leading-[1.65] text-text-secondary">
            {review.summary}
          </p>
        )}
      </header>

      <div className="h-px w-full bg-border" />

      {review.status === "in-progress" && <RunningPanel />}
      {review.status === "pending" && <PendingPanel />}
      {review.status === "failed" && <FailedPanel summary={review.summary} />}

      {review.status === "completed" && (
        <>
          <SummaryStrip
            totalFindings={totalFindings}
            tests={tests}
            interactionTotal={interactionTests.length}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                <Target size={14} className="text-primary" />
                Security Findings
                <Badge tone="secondary" className="ml-1">
                  {totalFindings}
                </Badge>
              </CardTitle>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                grouped by severity
              </span>
            </CardHeader>
            <div>
              {grouped.length === 0 ? (
                <CardBody className="text-center text-[13px] text-text-muted">
                  No security findings on this run.
                </CardBody>
              ) : (
                grouped.map((group) => (
                  <div key={group.severity}>
                    <div className="flex items-center gap-2 border-b border-border bg-bg/40 px-4 py-2">
                      <SeverityBadge severity={group.severity} />
                      <span className="text-[12px] text-text-secondary">
                        {group.items.length} finding{group.items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {group.items.map((f, i) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onOpenFinding(f.id)}
                        className={cn(
                          "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-card-hover",
                          i !== group.items.length - 1 && "border-b border-border",
                        )}
                      >
                        <ConfidenceRing pct={f.confidence} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                              {f.title}
                            </span>
                            <Badge tone="outline">
                              <span className="font-mono">{f.scanner}</span>
                            </Badge>
                          </div>
                          <div className="mt-1 truncate font-mono text-[11px] font-medium text-text-muted">
                            {f.file}:{f.line} · {f.category} · {f.ruleId}
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-[12.5px] font-medium leading-relaxed text-text-secondary">
                            {f.summary}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <ExploitabilityPill value={f.exploitability} />
                          <DeltaPill value={f.delta} />
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Sparkles size={14} className="text-primary" />
                Interaction Tests
                <Badge tone="secondary" className="ml-1">
                  {interactionTests.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em]">
                <span className="text-emerald-300">{tests.pass} pass</span>
                <span className="text-amber-300">{tests.warn} warn</span>
                <span className="text-red-300">{tests.fail} fail</span>
              </div>
            </CardHeader>

            {interactionTests.length === 0 ? (
              <CardBody className="text-center text-[13px] text-text-muted">
                No interaction tests recorded for this run.
              </CardBody>
            ) : (
              <div>
                {interactionTests.map((t, i) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      i !== interactionTests.length - 1 &&
                        "border-b border-border",
                    )}
                  >
                    <ResultChip result={t.result} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-text-muted">
                          {t.area}
                        </span>
                        <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                          {t.title}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-text-secondary">
                        {t.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <ReadinessPanel review={review} findings={findings} />
        </>
      )}
    </div>
  );
}

function SummaryStrip({
  totalFindings,
  tests,
  interactionTotal,
}: {
  totalFindings: number;
  tests: { pass: number; fail: number; warn: number };
  interactionTotal: number;
}) {
  const cell =
    "bg-bg-card px-5 py-4";
  const label =
    "font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted";
  const value = "mt-2 text-[28px] font-black leading-none tracking-[-0.04em]";
  return (
    <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
      <div className={cell}>
        <div className={label}>Findings</div>
        <div className={cn(value, "text-foreground")}>{totalFindings}</div>
      </div>
      <div className={cell}>
        <div className={label}>Interaction tests</div>
        <div className={cn(value, "text-foreground")}>{interactionTotal}</div>
      </div>
      <div className={cell}>
        <div className={label}>Pass rate</div>
        <div className={cn(value, "text-emerald-300")}>
          {interactionTotal === 0
            ? "—"
            : `${Math.round((tests.pass / interactionTotal) * 100)}%`}
        </div>
      </div>
      <div className={cell}>
        <div className={label}>Failures</div>
        <div className={cn(value, "text-red-300")}>{tests.fail}</div>
      </div>
    </div>
  );
}

function ConfidenceRing({ pct }: { pct: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
        <circle cx="10" cy="10" r={r} fill="none" stroke="var(--color-border-accent)" strokeWidth="2" />
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-[8px] text-text-muted">
        {pct}
      </span>
    </div>
  );
}

function ExploitabilityPill({
  value,
}: {
  value: MockFinding["exploitability"];
}) {
  const map: Record<MockFinding["exploitability"], { label: string; cls: string }> = {
    verified: {
      label: "Verified",
      cls: "border-red-500/30 bg-red-500/12 text-red-300",
    },
    unverified: {
      label: "Unverified",
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    not_tested: {
      label: "Not tested",
      cls: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    },
  };
  const m = map[value];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

function DeltaPill({ value }: { value: MockFinding["delta"] }) {
  const map: Record<MockFinding["delta"], { label: string; cls: string }> = {
    new: {
      label: "New",
      cls: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
    },
    recurring: {
      label: "Recurring",
      cls: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    },
    regressed: {
      label: "Regressed",
      cls: "border-red-500/30 bg-red-500/12 text-red-300",
    },
  };
  const m = map[value];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em]",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

function RunningPanel() {
  return (
    <Card>
      <CardBody className="flex items-center gap-4 py-8">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div>
          <div className="text-[14px] font-semibold text-foreground">
            Running scan + interaction agents
          </div>
          <div className="text-[12.5px] text-text-muted">
            Sandbox provisioned · code review in flight · runtime attackers warming up.
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function PendingPanel() {
  return (
    <Card>
      <CardBody className="flex items-center gap-4 py-8">
        <div className="h-2 w-2 rounded-full bg-amber-300" />
        <div>
          <div className="text-[14px] font-semibold text-foreground">Queued</div>
          <div className="text-[12.5px] text-text-muted">
            Waiting on a sandbox slot. The pipeline will start automatically.
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function FailedPanel({ summary }: { summary: string | null }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardBody className="flex items-start gap-3 py-6">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <div className="text-[14px] font-semibold text-foreground">
            Run failed
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">
            {summary ?? "The sandbox failed to start. No coverage was produced."}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function ReadinessPanel({
  review,
  findings,
}: {
  review: MockReview;
  findings: MockFinding[];
}) {
  const checks: { label: string; status: "pass" | "warn" | "fail"; detail: string }[] = [
    {
      label: "Sandbox build",
      status: "pass",
      detail: "Cloud sandbox built and reachable. Replay artifacts archived.",
    },
    {
      label: "Code review coverage",
      status: "pass",
      detail: `${findings.length} files reviewed across diff + transitively impacted modules.`,
    },
    {
      label: "Critical findings",
      status:
        review.findingsCount.critical === 0
          ? "pass"
          : review.findingsCount.critical > 1
            ? "fail"
            : "warn",
      detail:
        review.findingsCount.critical === 0
          ? "No critical findings."
          : `${review.findingsCount.critical} critical finding${
              review.findingsCount.critical === 1 ? "" : "s"
            } need review before merge.`,
    },
    {
      label: "Interaction tests",
      status:
        review.totalTests === 0
          ? "warn"
          : review.passedTests === review.totalTests
            ? "pass"
            : "warn",
      detail:
        review.totalTests === 0
          ? "No interaction tests ran for this slice."
          : `${review.passedTests} of ${review.totalTests} interaction tests passed.`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ShieldCheck size={14} className="text-primary" />
          Readiness
        </CardTitle>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
          rerun-ready · replay archived
        </span>
      </CardHeader>
      <div>
        {checks.map((c, i) => {
          const Icon =
            c.status === "pass"
              ? CheckCircle2
              : c.status === "warn"
                ? AlertTriangle
                : AlertTriangle;
          const tone =
            c.status === "pass"
              ? "text-emerald-300"
              : c.status === "warn"
                ? "text-amber-300"
                : "text-red-300";
          return (
            <div
              key={c.label}
              className={cn(
                "flex items-start gap-3 px-4 py-3",
                i !== checks.length - 1 && "border-b border-border",
              )}
            >
              <Icon size={14} className={cn("mt-0.5 shrink-0", tone)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                    {c.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] font-medium leading-relaxed text-text-secondary">
                  {c.detail}
                </p>
              </div>
              <span
                className={cn(
                  "ml-2 shrink-0 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]",
                  tone,
                )}
              >
                {c.status}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
