// Static demo UI. All data is mocked. No backend logic.

"use client";

import {
  Activity,
  ChevronRight,
  GitBranch,
  GitFork,
  ShieldAlert,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/preview/ui";
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
  value,
  caption,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="border border-border bg-bg-card p-6">
      <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
        <Icon size={13} />
        {label}
      </div>
      <p className="mt-5 text-[52px] font-black leading-none tracking-[-0.05em] text-foreground">
        {numberFormatter.format(value)}
      </p>
      <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-text-secondary">
        {caption}
      </p>
    </div>
  );
}

function totalFindings(r: MockReview): number {
  return (
    r.findingsCount.critical +
    r.findingsCount.high +
    r.findingsCount.medium +
    r.findingsCount.low
  );
}

function reviewSubtitle(r: MockReview): string {
  if (r.status === "pending") return "Queued — waiting on a sandbox slot.";
  if (r.status === "in-progress") return "Running scan + interaction agents…";
  if (r.status === "failed") return r.summary ?? "Run failed.";
  const total = totalFindings(r);
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

function StatusBar({ status }: { status: MockReview["status"] }) {
  const colorMap: Record<MockReview["status"], string> = {
    completed: "bg-[#a8d944]",
    "in-progress": "bg-[#7dd3fc]",
    pending: "bg-[#facc15]",
    failed: "bg-[#ff4d4d]",
    limited: "bg-[#facc15]",
  };
  return (
    <span
      aria-hidden
      className={cn("h-8 w-[3px] rounded-full", colorMap[status])}
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
          caption="Every scan you've launched in Infiniview so far."
        />
        <StatTile
          icon={ShieldAlert}
          label="Unique Vulnerabilities"
          value={overviewStats.uniqueVulnerabilitiesFound}
          caption="Unique critical, high, medium, and low severity findings surfaced."
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
              [01] / Recent Reviews
            </div>
            <h3 className="mt-1.5 text-[28px] font-black tracking-[-0.04em] text-foreground">
              latest scans
            </h3>
          </div>
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            sample data · click any row
          </span>
        </div>
        <div className="overflow-hidden border border-border bg-bg-card">
          {reviews.map((review, i) => (
            <button
              key={review.id}
              type="button"
              onClick={() => onSelect(review.id)}
              className={cn(
                "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-card-hover",
                i !== reviews.length - 1 && "border-b border-border",
              )}
            >
              <StatusBar status={review.status} />
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-secondary">
                <GitFork size={13} className="text-text-secondary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate text-[14px] font-bold tracking-[-0.01em] text-foreground">
                  {review.name ?? review.repoFullName}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] font-medium text-text-muted">
                  {review.name ? `${review.repoFullName} · ` : ""}
                  {reviewSubtitle(review)}
                </div>
              </div>

              <Badge tone="outline" className="hidden shrink-0 sm:inline-flex">
                <GitBranch size={10} className="text-text-muted" />
                <span className="font-mono">{review.branch}</span>
              </Badge>
              <StatusBadge status={review.status} />
              <ChevronRight
                size={14}
                className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
