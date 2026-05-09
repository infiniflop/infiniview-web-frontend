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

// Sharp-cornered, mono-uppercase buttons that match the landing page's
// .btn-lime / .btn-ghost language. No rounded corners on the body buttons —
// only the icon variant gets a small radius to keep hit targets readable.
const VARIANT_CLASSES: Record<Variant, string> = {
  lime: "bg-primary text-primary-foreground font-mono uppercase tracking-[0.08em] font-bold border-0 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-bg),4px_4px_0_1px_var(--color-primary)]",
  ghost:
    "bg-transparent text-foreground border border-border-accent font-mono uppercase tracking-[0.08em] font-medium hover:border-primary hover:text-primary",
  outline:
    "bg-transparent text-text-secondary border border-border font-mono uppercase tracking-[0.08em] hover:border-border-accent hover:text-foreground",
  icon: "bg-transparent text-text-secondary border border-transparent rounded-md hover:bg-bg-card-hover hover:text-foreground",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 px-3 text-[10.5px]",
  md: "h-9 px-4 text-[11.5px]",
  lg: "h-10 px-5 text-[12px]",
};

const ICON_SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-[12px]",
  lg: "h-9 w-9 text-[13px]",
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
    <div className="flex items-center gap-2 text-[15px] font-extrabold tracking-[-0.02em] text-foreground">
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
  high: "border-rose-400/30 bg-rose-500/12 text-rose-300",
  medium: "border-amber-400/30 bg-amber-500/12 text-amber-300",
  low: "border-sky-400/30 bg-sky-500/12 text-sky-300",
  info: "border-zinc-400/30 bg-zinc-500/12 text-zinc-300",
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

const STATUS_META: Record<
  ReviewStatus,
  { label: string; color: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    color: "#a8d944",
    dotClass: "bg-[#a8d944]",
  },
  "in-progress": {
    label: "Running",
    color: "#7dd3fc",
    dotClass: "border border-[#7dd3fc] border-t-transparent animate-spin rounded-full",
  },
  pending: {
    label: "Queued",
    color: "#facc15",
    dotClass: "bg-[#facc15]",
  },
  failed: {
    label: "Failed",
    color: "#ff4d4d",
    dotClass: "bg-[#ff4d4d] animate-pulse",
  },
  limited: {
    label: "Limited coverage",
    color: "#facc15",
    dotClass: "bg-[#facc15]",
  },
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = STATUS_META[status];
  const isSpinner = status === "in-progress";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11px]"
      style={{ color: meta.color }}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block",
          isSpinner ? "h-2 w-2" : "h-1.5 w-1.5 rounded-full",
          meta.dotClass,
        )}
      />
      {meta.label}
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
