// Static demo UI. All data is mocked. No backend logic.

"use client";

import {
  Activity,
  ChevronRight,
  GitBranch,
  GitFork,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Badge, SeverityPills, StatusBadge, type SeverityCount } from "@/components/preview/ui";
import {
  type MockReview,
  type MockOverviewStats,
} from "@/components/preview/mock-data";
import { cn } from "@/lib/utils";

interface ReviewsViewProps {
  reviews: MockReview[];
  overviewStats: MockOverviewStats;
  onSelect: (id: string) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function StatTile({
  icon: Icon,
  label,
  tooltip,
  value,
}: {
  icon: typeof Activity;
  label: string;
  tooltip: string;
  value: number;
}) {
  return (
    <div className="border border-border bg-bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
          <Icon size={13} />
          {label}
        </div>
        <span className="group relative">
          <span className="cursor-default text-text-secondary transition-colors hover:text-foreground">
            <Info size={14} />
          </span>
          <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-max max-w-[220px] rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            {tooltip}
          </span>
        </span>
      </div>
      <p className="mt-5 text-[36px] sm:text-[52px] font-black leading-none tracking-[-0.05em] text-foreground">
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}

function reviewSubtitle(r: MockReview): string {
  if (r.status === "pending") return "Queued — waiting on a sandbox slot.";
  if (r.status === "in-progress") return "Running scan + interaction agents…";
  if (r.status === "failed") return r.summary ?? "Run failed.";
  const total =
    r.findingsCount.critical +
    r.findingsCount.high +
    r.findingsCount.medium +
    r.findingsCount.low;
  const passed = r.passedTests;
  const tests = r.totalTests;
  if (total === 0 && tests === 0) return "No findings or interaction results.";
  return [
    total === 0 ? "no findings" : `${total} finding${total === 1 ? "" : "s"}`,
    tests > 0 ? `${passed}/${tests} interaction tests passed` : null,
    r.durationMin != null ? `${r.durationMin}m` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getSeverityPills(r: MockReview): SeverityCount[] | null {
  if (r.status !== "completed" && r.status !== "limited") return null;
  const counts: SeverityCount[] = [];
  if (r.findingsCount.critical > 0) counts.push({ severity: "critical", count: r.findingsCount.critical });
  if (r.findingsCount.high > 0) counts.push({ severity: "high", count: r.findingsCount.high });
  if (r.findingsCount.medium > 0) counts.push({ severity: "medium", count: r.findingsCount.medium });
  if (r.findingsCount.low > 0) counts.push({ severity: "low", count: r.findingsCount.low });
  return counts.length > 0 ? counts : null;
}

function StatusBar({ status }: { status: MockReview["status"] }) {
  const colorMap: Record<MockReview["status"], string> = {
    completed: "bg-[#10b981]",
    "in-progress": "bg-[#22d3ee]",
    pending: "bg-[#a1a1aa]",
    failed: "bg-[#f43f5e]",
    limited: "bg-[#facc15]",
  };
  return (
    <span
      aria-hidden
      className={cn("h-8 w-[3px] shrink-0 rounded-full max-sm:self-stretch max-sm:h-auto", colorMap[status])}
    />
  );
}

export function ReviewsView({
  reviews,
  overviewStats,
  onSelect,
}: ReviewsViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          icon={Activity}
          label="Total Runs"
          value={overviewStats.totalRuns}
          tooltip="Every scan you've launched in Infiniview so far."
        />
        <StatTile
          icon={ShieldAlert}
          label="Significant Vulnerabilities"
          value={overviewStats.uniqueVulnerabilitiesFound}
          tooltip="Unique critical and high severity security findings Infiniview has surfaced."
        />
      </div>

      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
              [01] / Recent Reviews
            </div>
            <h3 className="mt-1.5 text-[22px] sm:text-[28px] font-black tracking-[-0.04em] text-foreground">
              latest scans
            </h3>
          </div>
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            sample data · click any row
          </span>
        </div>
        <div className="overflow-hidden border border-border bg-bg-card">
          {reviews.map((review, i) => {
            const pills = getSeverityPills(review);
            return (
              <button
                key={review.id}
                type="button"
                onClick={() => onSelect(review.id)}
                className={cn(
                  "group flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors hover:bg-bg-card-hover",
                  i !== reviews.length - 1 && "border-b border-border",
                )}
              >
                <StatusBar status={review.status} />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-secondary max-sm:hidden">
                  <GitFork size={13} className="text-text-secondary" />
                </div>

                <div className="min-w-0 shrink-0 max-sm:min-w-[calc(100%-24px)]">
                  <div className="truncate text-[14px] font-bold tracking-[-0.01em] text-foreground">
                    {review.name ?? review.repoFullName}
                  </div>
                  {!pills && (
                    <div className="mt-0.5 truncate text-[11.5px] font-medium text-text-muted">
                      {review.name ? `${review.repoFullName} · ` : ""}
                      {reviewSubtitle(review)}
                    </div>
                  )}
                </div>

                {pills && (
                  <SeverityPills counts={pills} className="max-sm:pl-3" />
                )}

                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <Badge tone="outline" className="hidden shrink-0 sm:inline-flex">
                    <GitBranch size={10} className="text-text-muted" />
                    <span className="font-mono">{review.branch}</span>
                  </Badge>
                  <StatusBadge status={review.status} />
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
