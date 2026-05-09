// Static demo UI. All data is mocked. No backend logic.

"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search, Shield } from "lucide-react";
import {
  Badge,
  SeverityBadge,
  type Severity,
} from "@/components/preview/ui";
import {
  type MockFinding,
  type Exploitability,
} from "@/components/preview/mock-data";
import { cn } from "@/lib/utils";

interface FindingsViewProps {
  findings: MockFinding[];
}

const SEVERITY_OPTIONS: ("all" | Severity)[] = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

const EXPLOIT_OPTIONS: ("all" | Exploitability)[] = [
  "all",
  "verified",
  "unverified",
  "not_tested",
];

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-red-400",
  high: "bg-rose-300",
  medium: "bg-amber-300",
  low: "bg-sky-300",
  info: "bg-zinc-300",
};

function exploitLabel(v: "all" | Exploitability): string {
  switch (v) {
    case "all":
      return "All";
    case "verified":
      return "Verified";
    case "unverified":
      return "Unverified";
    case "not_tested":
      return "Not tested";
  }
}

export function FindingsView({ findings }: FindingsViewProps) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [exploit, setExploit] = useState<"all" | Exploitability>("all");
  const [openGroups, setOpenGroups] = useState<Record<Severity, boolean>>({
    critical: true,
    high: true,
    medium: false,
    low: false,
    info: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return findings.filter((f) => {
      if (severity !== "all" && f.severity !== severity) return false;
      if (exploit !== "all" && f.exploitability !== exploit) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.file.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.ruleId.toLowerCase().includes(q)
      );
    });
  }, [findings, search, severity, exploit]);

  const groups: { severity: Severity; items: MockFinding[] }[] = (
    ["critical", "high", "medium", "low", "info"] as const
  )
    .map((sev) => ({
      severity: sev,
      items: filtered.filter((f) => f.severity === sev),
    }))
    .filter((g) => g.items.length > 0);

  const totalCount = filtered.length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-6">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-lime">
          <Shield size={11} />
          [02] / Security Findings
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <h2 className="text-[36px] font-black leading-[1.0] tracking-[-0.045em] text-foreground">
            verified vulnerabilities
          </h2>
          <Badge tone="secondary">{totalCount}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-border bg-bg-card px-3 py-3">
        <label className="relative flex min-w-[220px] flex-1 items-center">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, file, rule…"
            className="h-9 w-full border border-border bg-bg pl-9 pr-3 text-[12.5px] text-foreground placeholder:text-text-muted focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </label>

        <div className="h-6 w-px bg-border" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Severity
          </span>
          {SEVERITY_OPTIONS.map((opt) => {
            const isActive = severity === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSeverity(opt)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-bg-card text-text-muted hover:border-border-accent hover:text-foreground",
                )}
              >
                {opt === "all" ? "All" : opt}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Exploitability
          </span>
          {EXPLOIT_OPTIONS.map((opt) => {
            const isActive = exploit === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setExploit(opt)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-bg-card text-text-muted hover:border-border-accent hover:text-foreground",
                )}
              >
                {exploitLabel(opt)}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="border border-border bg-bg-card p-12 text-center">
          <Shield size={20} className="mx-auto text-text-muted" />
          <p className="mt-3 text-[14px] font-medium text-foreground">
            No findings match these filters.
          </p>
          <p className="mt-1 text-[12.5px] text-text-muted">
            Clear or relax filters to see more results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isOpen = openGroups[group.severity];
            return (
              <div
                key={group.severity}
                className="overflow-hidden border border-border bg-bg-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [group.severity]: !prev[group.severity],
                    }))
                  }
                  className="flex w-full items-center gap-2 border-b border-border bg-bg/30 px-4 py-2.5 text-left transition-colors hover:bg-bg-card-hover"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 rounded-full",
                      SEVERITY_DOT[group.severity],
                    )}
                  />
                  <SeverityBadge severity={group.severity} />
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10.5px] text-text-secondary">
                    {group.items.length}
                  </span>
                  <span className="ml-auto" />
                  <ChevronRight
                    size={14}
                    className={cn(
                      "shrink-0 text-text-muted transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                </button>

                {isOpen && (
                  <div>
                    {group.items.map((f, i) => (
                      <div
                        key={f.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-card-hover",
                          i !== group.items.length - 1 &&
                            "border-b border-border",
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
                          <span
                            className={cn(
                              "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
                              f.exploitability === "verified" &&
                                "border-red-500/30 bg-red-500/12 text-red-300",
                              f.exploitability === "unverified" &&
                                "border-amber-500/30 bg-amber-500/10 text-amber-300",
                              f.exploitability === "not_tested" &&
                                "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
                            )}
                          >
                            {exploitLabel(f.exploitability)}
                          </span>
                          <span className="font-mono text-[10.5px] text-text-muted">
                            {f.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
