// Static demo UI. All data is mocked. No backend logic.

"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  ExternalLink,
  FileCode,
  GitBranch,
  GitMerge,
  Loader2,
  Monitor,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  Swords,
  Wrench,
  XCircle,
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
import type { Severity } from "@/components/preview/ui";
import {
  type MockFinding,
  type MockInteractionTest,
  type MockReview,
  type StoryInsights,
  type StoryAttackPath,
  type StoryRootCause,
  type StoryLeverageFix,
  type ReadinessDiagnostics,
  storyForReview,
  readinessForReview,
} from "@/components/preview/mock-data";
import {
  SEVERITY_COLORS,
  FINDING_SEVERITY_ORDER,
  getFindingConfidencePercent,
} from "@/components/preview/findings-lib";
import { FindingDetailView } from "./finding-detail-view";
import { cn } from "@/lib/utils";

// ─── Status color map (mirrors product's statusColors) ───────────────────

const STATUS_COLORS: Record<MockReview["status"], string> = {
  completed: "#10b981",
  "in-progress": "#22d3ee",
  pending: "#a1a1aa",
  failed: "#f43f5e",
  limited: "#facc15",
};

// ─── RESULT_CATEGORIES ────────────────────────────────────────────────────

const RESULT_CATEGORIES = [
  {
    id: "security" as const,
    label: "Security",
    description: "Security-specific findings with evidence and exploitability status",
    icon: Shield,
  },
  {
    id: "code-review" as const,
    label: "Code Review",
    description: "Code quality findings organized by focus area",
    icon: FileCode,
  },
  {
    id: "interaction-testing" as const,
    label: "Interaction Testing",
    description: "Application flow tests and stress test results",
    icon: Monitor,
  },
];

type FindingTab = "security" | "code-review" | "interaction-testing";

// ─── Props ────────────────────────────────────────────────────────────────

interface ReviewDetailViewProps {
  review: MockReview;
  findings: MockFinding[];
  interactionTests: MockInteractionTest[];
  onBack: () => void;
  onOpenFinding?: (id: string) => void;
}

// ─── Severity count chip (mirrors product SeverityCount) ─────────────────

function SeverityCountChip({
  severity,
  count,
}: {
  severity: Severity;
  count: number;
}) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border px-3 py-2",
        colors.bg,
        colors.border,
      )}
    >
      <span className={cn("font-mono text-sm font-bold", colors.text)}>
        {count}
      </span>
      <span className={cn("text-[10px] font-semibold uppercase", colors.text)}>
        {severity}
      </span>
    </div>
  );
}

// ─── SeverityGroup (collapsible severity bucket inside a category) ────────

function SeverityGroup({
  severity,
  findings,
  onSelectFinding,
}: {
  severity: Severity;
  findings: MockFinding[];
  onSelectFinding: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(
    severity === "critical" || severity === "high",
  );
  const colors = SEVERITY_COLORS[severity];

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg-card-hover"
      >
        <SeverityBadge severity={severity} />
        <span className="text-[12px] text-muted-foreground">
          {findings.length} finding{findings.length !== 1 ? "s" : ""}
        </span>
        {!isOpen && findings.length <= 3 && (
          <span className="ml-1 truncate text-[11px] text-muted-foreground/50">
            {findings.map((f) => f.title).join(", ")}
          </span>
        )}
        <ChevronRight
          size={12}
          className={cn(
            "ml-auto shrink-0 text-muted-foreground/40 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>
      {isOpen && (
        <div className={cn("ml-4 border-l-2 pl-2", colors.border)}>
          {findings.map((finding) => {
            const loc =
              (finding.primaryFile ?? finding.file) +
              ":" +
              (finding.lineStart ?? finding.line);
            return (
              <button
                key={finding.id}
                type="button"
                onClick={() => onSelectFinding(finding.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-bg-card-hover"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[12px] font-medium text-foreground">
                    {finding.title}
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate font-mono text-[10px] text-muted-foreground">
                      {loc}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {finding.delta && (
                    <span
                      className={cn(
                        "rounded-md border px-1.5 py-0 font-mono text-[8px] font-semibold uppercase",
                        finding.delta === "new"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : finding.delta === "regressed"
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
                      )}
                    >
                      {finding.delta}
                    </span>
                  )}
                  {finding.suppressed && (
                    <span className="rounded-md border border-zinc-500/30 bg-zinc-500/10 px-1.5 py-0 font-mono text-[8px] font-semibold uppercase text-zinc-400">
                      suppressed
                    </span>
                  )}
                  <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">
                    {getFindingConfidencePercent(finding)}%
                  </span>
                  <ChevronRight size={10} className="text-muted-foreground/30" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CategorySection (collapsible card for one RESULT_CATEGORY) ───────────

function CategorySection({
  id,
  label,
  description,
  icon: Icon,
  findings,
  interactionTests,
  onSelectFinding,
}: {
  id: FindingTab;
  label: string;
  description: string;
  icon: React.ElementType;
  findings: MockFinding[];
  interactionTests: MockInteractionTest[];
  onSelectFinding: (id: string) => void;
}) {
  const total = findings.length + (id === "interaction-testing" ? interactionTests.length : 0);
  const [isOpen, setIsOpen] = useState(total > 0);

  // Severity counts for badge row
  const severityCounts = useMemo(() => {
    const counts: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    for (const f of findings) {
      counts[f.severity]++;
    }
    return counts;
  }, [findings]);

  // Severity groups
  const severityGroups = useMemo(() => {
    return FINDING_SEVERITY_ORDER.flatMap((sev) => {
      const items = findings.filter((f) => f.severity === sev);
      return items.length > 0 ? [{ severity: sev, items }] : [];
    });
  }, [findings]);

  return (
    <Card className="border-border">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-bg-card-hover"
        aria-expanded={isOpen}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
          <Icon size={15} className="text-muted-foreground" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
              {label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ({total} finding{total !== 1 ? "s" : ""})
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{description}</span>
        </div>
        <div className="flex items-center gap-1">
          {FINDING_SEVERITY_ORDER.map(
            (sev) =>
              severityCounts[sev] > 0 && (
                <SeverityBadge
                  key={sev}
                  severity={sev}
                  className="px-1.5 py-0 text-[8px]"
                />
              ),
          )}
        </div>
        <ChevronRight
          size={14}
          className={cn(
            "text-muted-foreground/40 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>
      {isOpen && (
        <>
          <div className="h-px w-full bg-border" />
          <div className="space-y-1 p-3">
            {severityGroups.map((group) => (
              <SeverityGroup
                key={group.severity}
                severity={group.severity}
                findings={group.items}
                onSelectFinding={onSelectFinding}
              />
            ))}
            {id === "interaction-testing" && interactionTests.length > 0 && (
              <div className="mt-1 space-y-1">
                {interactionTests.map((t) => (
                  <div
                    key={t.id}
                    className="flex w-full items-center gap-2 px-3 py-2.5"
                  >
                    <ResultChip result={t.result} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[12px] font-medium text-foreground">
                        {t.title}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {t.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {total === 0 && (
              <p className="px-3 py-2 text-[12px] text-muted-foreground">
                No findings in this category.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Story severity badge (mirrors product StorySeverityBadge) ────────────

function StorySeverityBadge({ severity }: { severity: string }) {
  const colors =
    severity in SEVERITY_COLORS
      ? SEVERITY_COLORS[severity as Severity]
      : SEVERITY_COLORS.info;
  return (
    <Badge
      tone="outline"
      className={cn(
        "rounded-md text-[10px]",
        colors.text,
        colors.bg,
        colors.border,
      )}
    >
      {severity}
    </Badge>
  );
}

// ─── AttackPathChain ──────────────────────────────────────────────────────

const ATTACK_PATH_PREVIEW_COUNT = 3;

function AttackPathChain({ steps }: { steps: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const overflow = Math.max(0, steps.length - ATTACK_PATH_PREVIEW_COUNT);
  const visible = expanded ? steps : steps.slice(0, ATTACK_PATH_PREVIEW_COUNT);

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Attack Chain
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50">
          {steps.length} step{steps.length === 1 ? "" : "s"}
        </span>
      </div>
      <ol className="space-y-2.5">
        {visible.map((step, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={idx} className="flex gap-3">
            <div className="flex flex-col items-center pt-[1px]">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-[9px] font-semibold tabular-nums text-primary">
                {idx + 1}
              </span>
              {idx < visible.length - 1 && (
                <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border/40" />
              )}
            </div>
            <p className="flex-1 pb-1 text-[11px] leading-relaxed text-muted-foreground/85">
              {step}
            </p>
          </li>
        ))}
      </ol>
      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="mt-2.5 inline-flex items-center gap-1 border border-border bg-background px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
        >
          {expanded ? (
            <>
              <ChevronRight size={11} className="rotate-90" aria-hidden="true" />
              Collapse chain
            </>
          ) : (
            <>
              <ChevronDown size={11} aria-hidden="true" />
              Show all {steps.length} steps
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── StorySection ─────────────────────────────────────────────────────────

function StorySection({ insights }: { insights: StoryInsights }) {
  const hasContent =
    insights.attackPaths.length > 0 ||
    insights.rootCauses.length > 0 ||
    insights.leverageFixes.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-4">
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
        What This Run Means
      </p>

      {insights.attackPaths.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Swords size={13} className="text-red-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Attack Paths
            </span>
          </div>
          {insights.attackPaths.map((story: StoryAttackPath) => (
            <Card key={story.id} className="border-border bg-background">
              <CardBody className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <StorySeverityBadge severity={story.severity} />
                  <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                    {story.title}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {story.summary}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground/60">
                  {story.steps.length > 0 && (
                    <p>{story.steps.length} step{story.steps.length !== 1 ? "s" : ""}</p>
                  )}
                  {story.verifiedCount > 0 && (
                    <p>{story.verifiedCount} verified</p>
                  )}
                </div>
                {story.steps.length > 0 && <AttackPathChain steps={story.steps} />}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {insights.rootCauses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GitMerge size={13} className="text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Root-Cause Clusters
            </span>
          </div>
          {insights.rootCauses.map((cluster: StoryRootCause) => (
            <Card key={cluster.id} className="border-border bg-background">
              <CardBody className="p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <StorySeverityBadge severity={cluster.severity} />
                  <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                    {cluster.label}
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {cluster.findingCount} finding{cluster.findingCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {cluster.summary}
                </p>
                {cluster.files.length > 0 && (
                  <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/60">
                    {cluster.files.join(", ")}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {insights.leverageFixes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench size={13} className="text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Top Leverage Fixes
            </span>
          </div>
          {insights.leverageFixes.map((fix: StoryLeverageFix) => (
            <Card key={fix.id} className="border-border bg-background">
              <CardBody className="p-4">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
                    {fix.label}
                  </span>
                  <span className="shrink-0 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                    {fix.affectedFiles.length} file{fix.affectedFiles.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {fix.reason}
                </p>
                {fix.affectedFiles.length > 0 && (
                  <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/60">
                    {fix.affectedFiles.join(", ")}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReadinessSection ─────────────────────────────────────────────────────

const READINESS_STATE_CONFIG: Record<
  ReadinessDiagnostics["state"],
  { icon: React.ElementType; iconColor: string; label: string; borderColor: string }
> = {
  ready: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    label: "Ready to rerun",
    borderColor: "border-emerald-500/20",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-amber-400",
    label: "Needs attention before rerun",
    borderColor: "border-amber-500/20",
  },
  blocked: {
    icon: XCircle,
    iconColor: "text-red-400",
    label: "Blocked",
    borderColor: "border-red-500/20",
  },
};

function ReadinessSection({ diagnostics }: { diagnostics: ReadinessDiagnostics }) {
  const config = READINESS_STATE_CONFIG[diagnostics.state];
  const StateIcon = config.icon;

  return (
    <div className="space-y-4">
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
        Ready to Rerun
      </p>
      <Card className={cn("bg-card", config.borderColor)}>
        <CardBody className="p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <StateIcon size={16} className={config.iconColor} />
            <span className="text-[14px] font-bold tracking-[-0.01em] text-foreground">
              {config.label}
            </span>
          </div>

          <p className="mb-4 text-[12px] leading-relaxed text-muted-foreground">
            {diagnostics.summary}
          </p>

          {diagnostics.checks.length > 0 && (
            <div className="mb-4 space-y-2">
              {diagnostics.checks.map((check) => {
                const blocking = check.status === "fail";
                return (
                  <div
                    key={check.id}
                    className="flex items-start gap-2.5 border border-border bg-background px-3 py-2.5"
                  >
                    {check.status === "pass" ? (
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                    ) : check.status === "warn" ? (
                      <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                    ) : (
                      <XCircle size={13} className="mt-0.5 shrink-0 text-red-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-foreground">
                          {check.label}
                        </span>
                        {blocking && (
                          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-400">
                            blocking
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {diagnostics.recommendations.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                Recommended Next Steps
              </p>
              <ul className="space-y-1.5">
                {diagnostics.recommendations.map((step) => (
                  <li
                    key={step}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                  >
                    <ChevronRight size={11} className="shrink-0 text-primary/60" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[12px] font-medium",
                !diagnostics.canRerun
                  ? "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                  : "border-primary/30 bg-primary/10 text-primary cursor-default",
              )}
            >
              <RotateCcw size={12} />
              {!diagnostics.canRerun ? "Resolve blockers first" : "Rerun available"}
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Status-dependent body states ─────────────────────────────────────────

function PendingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">Queued</p>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          Waiting for an available scan slot
        </p>
      </div>
    </div>
  );
}

function InProgressState() {
  const phases = [
    { label: "Provisioning sandbox", done: true },
    { label: "Code review pass", done: true },
    { label: "Runtime attack agents", done: false },
    { label: "Interaction crawl", done: false },
  ];

  return (
    <div className="py-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>
            <Loader2 size={14} className="animate-spin text-primary" />
            Run in progress
          </CardTitle>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            live scan
          </span>
        </CardHeader>
        <div className="divide-y divide-border">
          {phases.map((phase) => (
            <div
              key={phase.label}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              {phase.done ? (
                <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
              ) : (
                <Loader2 size={13} className="shrink-0 animate-spin text-primary" />
              )}
              <span
                className={cn(
                  "text-[13px] font-medium",
                  phase.done ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {phase.label}
              </span>
              {phase.done && (
                <span className="ml-auto font-mono text-[10px] text-emerald-400/70">
                  done
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FailedState({
  summary,
  readiness,
}: {
  summary: string | null;
  readiness: ReadinessDiagnostics | undefined;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center gap-5 py-20">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-destructive/5 blur-2xl" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5">
            <AlertTriangle size={22} className="text-destructive" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">Testing failed</p>
          {summary && (
            <Card className="mt-3 max-w-md border-destructive/10 bg-destructive/5">
              <CardBody className="px-4 py-3">
                <p className="font-mono text-[12px] text-muted-foreground">
                  {summary}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      {readiness && <ReadinessSection diagnostics={readiness} />}
    </div>
  );
}

// ─── Results (completed / limited) ───────────────────────────────────────

function ResultsSection({
  review,
  findings,
  interactionTests,
  story,
  readiness,
  onSelectFinding,
}: {
  review: MockReview;
  findings: MockFinding[];
  interactionTests: MockInteractionTest[];
  story: StoryInsights | undefined;
  readiness: ReadinessDiagnostics | undefined;
  onSelectFinding: (id: string) => void;
}) {
  // Group findings by tab
  const grouped = useMemo(() => {
    const g: Record<FindingTab, MockFinding[]> = {
      security: [],
      "code-review": [],
      "interaction-testing": [],
    };
    for (const f of findings) {
      const tab: FindingTab = f.tab ?? "security";
      g[tab].push(f);
    }
    return g;
  }, [findings]);

  // Summary severity counts (all findings)
  const severityCounts = useMemo(() => {
    const counts: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    for (const f of findings) {
      counts[f.severity]++;
    }
    return counts;
  }, [findings]);

  // Delta counts
  const deltaCounts = useMemo(() => {
    const counts = { new: 0, recurring: 0, regressed: 0 };
    for (const f of findings) {
      if (f.delta in counts) {
        counts[f.delta as keyof typeof counts]++;
      }
    }
    return counts;
  }, [findings]);

  return (
    <div className="flex flex-col gap-6">
      {story && <StorySection insights={story} />}

      {/* Summary card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>
            <BarChart3 size={15} className="text-primary" />
            Scan Results
            <span className="text-[11px] text-muted-foreground">
              {findings.length} finding{findings.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {review.summary && (
            <p className="text-[13px] leading-relaxed text-foreground/80">
              {review.summary}
            </p>
          )}

          {/* Delta context */}
          {(deltaCounts.new > 0 || deltaCounts.recurring > 0 || deltaCounts.regressed > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {deltaCounts.new > 0 && (
                <Badge tone="secondary" className="rounded-md text-[10px]">
                  {deltaCounts.new} new
                </Badge>
              )}
              {deltaCounts.recurring > 0 && (
                <Badge tone="secondary" className="rounded-md text-[10px]">
                  {deltaCounts.recurring} recurring
                </Badge>
              )}
              {deltaCounts.regressed > 0 && (
                <span className="inline-flex h-5 items-center rounded-full border border-red-500/30 bg-transparent px-2 font-mono text-[10px] font-medium text-red-300">
                  {deltaCounts.regressed} regressed
                </span>
              )}
            </div>
          )}

          {/* Severity counts row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {FINDING_SEVERITY_ORDER.map((sev) => (
              <SeverityCountChip key={sev} severity={sev} count={severityCounts[sev]} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Category sections */}
      <div className="flex flex-col gap-2">
        {RESULT_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            id={cat.id}
            label={cat.label}
            description={cat.description}
            icon={cat.icon}
            findings={grouped[cat.id]}
            interactionTests={cat.id === "interaction-testing" ? interactionTests : []}
            onSelectFinding={onSelectFinding}
          />
        ))}
      </div>

      {readiness && <ReadinessSection diagnostics={readiness} />}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────

export function ReviewDetailView({
  review,
  findings,
  interactionTests,
  onBack,
  onOpenFinding,
}: ReviewDetailViewProps) {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const statusColor = STATUS_COLORS[review.status];
  const displayName = review.name ?? review.repoFullName;

  const story = storyForReview(review.id);
  const readiness = readinessForReview(review.id);

  const selectedFinding = useMemo(
    () => (selectedFindingId ? findings.find((f) => f.id === selectedFindingId) ?? null : null),
    [selectedFindingId, findings],
  );

  const handleSelectFinding = (id: string) => {
    setSelectedFindingId(id);
    onOpenFinding?.(id);
  };

  // If a finding is selected, render the detail view in place of the body
  if (selectedFinding) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        <div className="detail-enter mx-auto w-full max-w-4xl p-8">
          <FindingDetailView
            finding={selectedFinding}
            onBack={() => setSelectedFindingId(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <div className="detail-enter mx-auto w-full max-w-4xl p-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ background: `${statusColor}15` }}
            >
              <GitBranch size={16} style={{ color: statusColor }} />
            </div>
            <StatusBadge status={review.status} />
            <Badge
              tone="outline"
              className="border-border font-mono text-[10px] text-muted-foreground"
            >
              {review.branch}
            </Badge>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-1.5 text-[12px] text-muted-foreground"
              >
                <ArrowLeft size={13} />
                All reviews
              </Button>
            </div>
          </div>

          <h1 className="text-[clamp(28px,4.5vw,48px)] font-semibold leading-[1.02] tracking-[-0.05em] text-foreground">
            {displayName}
          </h1>
          {review.name && (
            <p className="mt-1 font-mono text-[12px] font-semibold text-muted-foreground">
              {review.repoFullName}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} />
              {review.startedAgo}
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
              <ExternalLink size={12} />
              View on GitHub
            </span>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="mb-8 h-px w-full bg-border" />

        {/* ── Status-dependent body ── */}
        {review.status === "pending" && <PendingState />}

        {review.status === "in-progress" && <InProgressState />}

        {review.status === "failed" && (
          <FailedState summary={review.summary} readiness={readiness} />
        )}

        {(review.status === "completed" || review.status === "limited") && (
          <ResultsSection
            review={review}
            findings={findings}
            interactionTests={interactionTests}
            story={story}
            readiness={readiness}
            onSelectFinding={handleSelectFinding}
          />
        )}
      </div>
    </div>
  );
}
