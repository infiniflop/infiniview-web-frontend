// Static demo UI. All data is mocked. No backend logic.

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Archive,
  ChevronRight,
  GitFork,
  Info,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import {
  Badge,
  SeverityPills,
  StatusBadge,
  type SeverityCount,
} from "@/components/preview/ui";
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

// Mirrors lib/reviews statusColors (plus the limited-coverage amber).
const STATUS_COLOR: Record<MockReview["status"], string> = {
  completed: "#10b981",
  "in-progress": "#22d3ee",
  pending: "#a1a1aa",
  failed: "#f43f5e",
  limited: "#facc15",
};

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
    <div className="border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
          <Icon size={13} />
          {label}
        </div>
        <span className="group/info relative inline-flex">
          <button
            type="button"
            aria-label={`${label} details`}
            className="text-text-secondary transition-colors hover:text-foreground"
          >
            <Info size={14} />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 translate-y-1 text-balance rounded-md bg-foreground px-3 py-1.5 text-center text-xs text-background opacity-0 shadow-md transition-all duration-150 group-hover/info:translate-y-0 group-hover/info:opacity-100 max-sm:left-auto max-sm:right-0 max-sm:translate-x-0 max-sm:text-left"
          >
            {tooltip}
            <span
              aria-hidden
              className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-foreground max-sm:left-auto max-sm:right-1.5 max-sm:translate-x-0"
            />
          </span>
        </span>
      </div>
      <p className="mt-5 text-[36px] font-black leading-none tracking-[-0.05em] text-foreground sm:text-[52px]">
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}

function reviewSubtitle(r: MockReview): string {
  if (r.status === "pending") return "Queued — waiting on a sandbox slot.";
  if (r.status === "in-progress")
    return "Scan run and interaction agents in progress…";
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
  if (r.findingsCount.critical > 0)
    counts.push({ severity: "critical", count: r.findingsCount.critical });
  if (r.findingsCount.high > 0)
    counts.push({ severity: "high", count: r.findingsCount.high });
  if (r.findingsCount.medium > 0)
    counts.push({ severity: "medium", count: r.findingsCount.medium });
  if (r.findingsCount.low > 0)
    counts.push({ severity: "low", count: r.findingsCount.low });
  return counts.length > 0 ? counts : null;
}

// Lightweight, inert mirror of the product's ReviewActions 3-dot menu.
function ReviewActions({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Open actions for ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex size-6 items-center justify-center text-muted-foreground transition-[color,opacity] hover:bg-bg-card-hover hover:text-foreground",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          open && "opacity-100",
        )}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden border border-border bg-popover py-1 shadow-xl shadow-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-foreground hover:bg-bg-card-hover"
          >
            <Pencil size={11} />
            Rename
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-foreground hover:bg-bg-card-hover"
          >
            <Archive size={11} />
            Archive
          </button>
        </div>
      )}
    </div>
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
          tooltip="Every scan run launched from your reviews so far."
        />
        <StatTile
          icon={ShieldAlert}
          label="Significant Vulnerabilities"
          value={overviewStats.uniqueVulnerabilitiesFound}
          tooltip="Unique critical and high severity security findings Infiniview has surfaced."
        />
      </div>

      <div className="overflow-hidden border border-border bg-card">
        {reviews.map((review, index) => {
          const pills = getSeverityPills(review);
          const displayName = review.name ?? review.repoFullName;
          return (
            <div
              key={review.id}
              className="review-row-enter group flex w-full items-center gap-3 border-b border-border px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-bg-card-hover"
              style={{ animationDelay: `${index * 35}ms` }}
            >
              <button
                type="button"
                aria-label={`Open review ${displayName}`}
                onClick={() => onSelect(review.id)}
                className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
              >
                <span
                  aria-hidden
                  className="h-8 w-[3px] shrink-0 rounded-full transition-colors duration-300 max-sm:h-auto max-sm:self-stretch"
                  style={{ background: STATUS_COLOR[review.status] }}
                />
                <div className="flex size-8 shrink-0 items-center justify-center bg-secondary max-sm:hidden">
                  <GitFork size={14} className="text-muted-foreground" />
                </div>

                <div className="min-w-0 shrink-0 max-sm:min-w-[calc(100%-24px)]">
                  <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                    {displayName}
                  </h3>
                  {!pills && (
                    <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">
                      {review.name ? `${review.repoFullName} · ` : ""}
                      {reviewSubtitle(review)}
                    </p>
                  )}
                </div>

                {pills && <SeverityPills counts={pills} className="max-sm:pl-3" />}

                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <Badge
                    tone="outline"
                    className="hidden shrink-0 border-border font-mono text-[10px] text-muted-foreground sm:inline-flex"
                  >
                    {review.branch}
                  </Badge>
                  <StatusBadge status={review.status} />
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-muted-foreground/40 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                  />
                </div>
              </button>
              <ReviewActions name={displayName} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
