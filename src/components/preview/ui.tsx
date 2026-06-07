// Static demo UI. All data is mocked. No backend logic.
// Local primitives styled with vanilla Tailwind v4 against the shared
// Infiniview design tokens.

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "lime" | "ghost" | "outline" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  lime: "bg-primary text-primary-foreground text-sm font-medium border border-transparent hover:bg-primary/80",
  ghost:
    "bg-transparent text-foreground border border-transparent text-sm font-medium hover:bg-bg-card-hover hover:text-foreground",
  outline:
    "bg-transparent text-text-secondary border border-border text-sm font-medium hover:bg-bg-card-hover hover:text-foreground",
  icon: "bg-transparent text-text-secondary border border-transparent hover:bg-bg-card-hover hover:text-foreground",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 gap-1 px-2.5",
  md: "h-8 gap-1.5 px-2.5",
  lg: "h-9 gap-1.5 px-2.5",
};

const ICON_SIZE_CLASSES: Record<Size, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-9",
};

export function Button({
  variant = "lime",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const isIcon = variant === "icon";
  return (
    <button
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        isIcon ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size],
        className,
      )}
    />
  );
}

type BadgeTone = "default" | "outline" | "secondary" | "primary";

const BADGE_TONE: Record<BadgeTone, string> = {
  default: "border-border bg-bg-card text-text-secondary",
  outline: "border-border bg-transparent text-text-secondary",
  secondary: "border-transparent bg-secondary text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
};

export function Badge({
  tone = "outline",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-2 font-mono text-[10.5px] font-medium tracking-[0.04em]",
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "border border-border bg-bg-card text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-foreground">
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}

// ─── Severity & status pills ─────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low" | "info";

const SEVERITY_CLASSES: Record<Severity, string> = {
  critical: "border-red-500/30 bg-red-500/15 text-red-400",
  high: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  medium: "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  low: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  info: "border-blue-500/30 bg-blue-500/15 text-blue-400",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        SEVERITY_CLASSES[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}

export type ReviewStatus =
  | "completed"
  | "in-progress"
  | "pending"
  | "failed"
  | "limited";

const STATUS_META: Record<ReviewStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "#10b981" },
  "in-progress": { label: "Running", color: "#22d3ee" },
  pending: { label: "Queued", color: "#a1a1aa" },
  failed: { label: "Failed", color: "#f43f5e" },
  limited: { label: "Limited coverage", color: "#facc15" },
};

// Mirrors the product's StatusDot — animated pending bounce, spinner, and
// failed pulse via the shared dashboard CSS classes in globals.css.
function StatusDot({ status, color }: { status: ReviewStatus; color: string }) {
  if (status === "pending") {
    return (
      <span className="status-dots-pending">
        <span style={{ background: color }} />
        <span style={{ background: color }} />
        <span style={{ background: color }} />
      </span>
    );
  }
  if (status === "in-progress") {
    return <span className="status-spinner" style={{ color }} />;
  }
  if (status === "failed") {
    return <span className="status-failed-dot" style={{ background: color }} />;
  }
  return <span className="size-1.5 rounded-full" style={{ background: color }} />;
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11px]"
      style={{ color: meta.color }}
    >
      <StatusDot status={status} color={meta.color} />
      <span>{meta.label}</span>
    </span>
  );
}

// ─── Interaction-test result chip ────────────────────────────────────────

export type TestResult = "pass" | "fail" | "warn";

const TEST_RESULT_CLASSES: Record<TestResult, string> = {
  pass: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
  fail: "border-red-500/30 bg-red-500/15 text-red-300",
  warn: "border-amber-500/30 bg-amber-500/12 text-amber-300",
};

export function ResultChip({ result }: { result: TestResult }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[44px] items-center justify-center gap-1 rounded-full border px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]",
        TEST_RESULT_CLASSES[result],
      )}
    >
      {result}
    </span>
  );
}

// ─── Severity pills (count + label) ─────────────────────────────────────────

export interface SeverityCount {
  severity: Severity;
  count: number;
}

export function SeverityPills({
  counts,
  className,
}: {
  counts: SeverityCount[];
  className?: string;
}) {
  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {counts.map(({ severity, count }) => (
        <span
          key={severity}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums",
            SEVERITY_CLASSES[severity],
          )}
        >
          {count} {severity}
        </span>
      ))}
    </span>
  );
}
