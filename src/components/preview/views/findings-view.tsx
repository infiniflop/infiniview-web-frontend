// Static demo UI. All data is mocked. No backend logic.

"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  ShieldOff,
  SortAsc,
  Search,
  ChevronRight,
} from "lucide-react";
import { Badge, SeverityBadge } from "@/components/preview/ui";
import type { MockFinding, Exploitability, FindingDelta } from "@/components/preview/mock-data";
import {
  SEVERITY_COLORS,
  FINDING_SEVERITY_ORDER,
  EXPLOITABILITY_LABELS,
  DELTA_LABELS,
  formatFindingCategory,
  getFindingConfidencePercent,
  sortFindings,
  type FindingSort,
} from "@/components/preview/findings-lib";
import { FindingDetailView } from "@/components/preview/views/finding-detail-view";
import { cn } from "@/lib/utils";
import type { Severity } from "@/components/preview/ui";

// ─── Filter chip group ────────────────────────────────────────────────────

function FilterChipGroup<T extends string>({
  options,
  value,
  onChange,
  getLabel,
}: {
  options: T[];
  value: T | "all";
  onChange: (v: T | "all") => void;
  getLabel: (v: T) => string;
}) {
  return (
    <>
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? "all" : option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
              selected
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            {getLabel(option)}
          </button>
        );
      })}
    </>
  );
}

// ─── Confidence arc SVG ───────────────────────────────────────────────────

function ConfidenceArc({
  confidence,
  dot,
}: {
  confidence: number;
  dot: string;
}) {
  const r = 8;
  const circumference = 2 * Math.PI * r;
  const filled = (confidence / 100) * circumference;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className="shrink-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2"
        className="stroke-border/30"
      />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        stroke={dot}
      />
    </svg>
  );
}

// ─── Severity section (collapsible) ──────────────────────────────────────

function SeveritySection({
  severity,
  findings,
  onSelectFinding,
  defaultOpen,
}: {
  severity: Severity;
  findings: MockFinding[];
  onSelectFinding: (id: string) => void;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = SEVERITY_COLORS[severity];

  return (
    <div className="overflow-hidden border border-border bg-bg-card">
      {/* Trigger */}
      <button
        type="button"
        aria-label={`${severity} severity findings (${findings.length})`}
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg-card-hover"
      >
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: colors.dot }}
        />
        <span className="text-[13px] font-semibold capitalize text-foreground">
          {severity}
        </span>
        <span className="bg-secondary px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
          {findings.length}
        </span>
        <span className="flex-1" />
        <ChevronRight
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground/40 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {/* Rows */}
      {isOpen && (
        <div className={cn("border-t", colors.border)}>
          {findings.map((finding) => {
            const confPercent = getFindingConfidencePercent(finding);
            return (
              <button
                key={finding.id}
                type="button"
                aria-label={`Open finding ${finding.title}`}
                onClick={() => onSelectFinding(finding.id)}
                className="group flex w-full items-start gap-3 border-b border-border px-5 py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-bg-card-hover"
              >
                {/* Confidence arc */}
                <div className="mt-1 flex size-5 shrink-0 items-center justify-center">
                  <ConfidenceArc
                    confidence={confPercent}
                    dot={colors.dot}
                  />
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {finding.title}
                    </span>
                    {finding.suppressed && (
                      <span className="shrink-0 border border-border bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        Suppressed
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-muted-foreground">
                      {finding.primaryFile ?? finding.file}
                      {(finding.lineStart ?? finding.line) != null
                        ? `:${finding.lineStart ?? finding.line}`
                        : ""}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="text-muted-foreground">
                      {formatFindingCategory(finding.category)}
                    </span>
                    {finding.sourcePhase && (
                      <>
                        <span className="text-muted-foreground/40">&bull;</span>
                        <span className="text-muted-foreground">
                          {finding.sourcePhase}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {/* Delta badge */}
                  {finding.delta && (
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[9px] font-semibold uppercase",
                        finding.delta === "new" &&
                          "border-amber-500/30 bg-amber-500/10 text-amber-400",
                        finding.delta === "recurring" &&
                          "border-border bg-secondary text-muted-foreground",
                        finding.delta === "regressed" &&
                          "border-red-500/30 bg-red-500/10 text-red-400",
                      )}
                    >
                      {DELTA_LABELS[finding.delta]}
                    </span>
                  )}

                  {/* Exploitability badge */}
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[9px]",
                      finding.exploitability === "verified" &&
                        "border-red-500/30 bg-red-500/10 text-red-400",
                      finding.exploitability === "unverified" &&
                        "border-amber-400/30 bg-amber-400/10 text-amber-400",
                      finding.exploitability === "not_tested" &&
                        "border-border bg-secondary text-muted-foreground",
                    )}
                  >
                    {EXPLOITABILITY_LABELS[finding.exploitability]}
                  </span>

                  {/* Confidence percent */}
                  <span className="tabular-nums text-[11px] text-muted-foreground/60">
                    {confPercent}%
                  </span>
                </div>

                <ChevronRight
                  size={14}
                  className="mt-1 shrink-0 text-muted-foreground/20 transition-colors group-hover:text-primary"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Suppressions dialog ──────────────────────────────────────────────────

function SuppressionsDialog({
  findings,
  onClose,
}: {
  findings: MockFinding[];
  onClose: () => void;
}) {
  const suppressed = findings.filter((f) => f.suppressed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <ShieldOff size={14} className="text-muted-foreground" />
          <span className="text-[14px] font-semibold text-foreground">
            Suppression Inventory
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-4">
          {suppressed.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <ShieldOff size={20} className="mb-2 text-muted-foreground/30" />
              <p className="text-[12px] text-muted-foreground">
                No active suppressions
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suppressed.map((f) => (
                <div
                  key={f.id}
                  className="border border-border bg-secondary p-3"
                >
                  <p className="truncate font-mono text-[11px] font-medium text-foreground/90">
                    {f.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {f.file}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <SeverityBadge severity={f.severity} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border px-4 py-2">
          <p className="text-[10px] text-muted-foreground/60">
            {suppressed.length} suppression{suppressed.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main FindingsView ────────────────────────────────────────────────────

export function FindingsView({ findings }: { findings: MockFinding[] }) {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [exploitabilityFilter, setExploitabilityFilter] = useState<Exploitability | "all">("all");
  const [deltaFilter, setDeltaFilter] = useState<FindingDelta | "all">("all");
  const [sortField, setSortField] = useState<FindingSort>("severity");
  const [suppressionsOpen, setSuppressionsOpen] = useState(false);

  const selectedFinding = useMemo(
    () => findings.find((f) => f.id === selectedFindingId) ?? null,
    [findings, selectedFindingId],
  );

  const filteredFindings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return findings.filter((f) => {
      if (severityFilter !== "all" && f.severity !== severityFilter) return false;
      if (exploitabilityFilter !== "all" && f.exploitability !== exploitabilityFilter)
        return false;
      if (deltaFilter !== "all" && f.delta !== deltaFilter) return false;
      if (q) {
        if (
          !f.title.toLowerCase().includes(q) &&
          !f.category.toLowerCase().includes(q) &&
          !(f.primaryFile ?? f.file).toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [findings, searchQuery, severityFilter, exploitabilityFilter, deltaFilter]);

  const sortedFindings = useMemo(
    () => sortFindings(filteredFindings, sortField),
    [filteredFindings, sortField],
  );

  const hasActiveFilter =
    severityFilter !== "all" ||
    exploitabilityFilter !== "all" ||
    deltaFilter !== "all" ||
    searchQuery.trim().length > 0;

  function clearFilters() {
    setSeverityFilter("all");
    setExploitabilityFilter("all");
    setDeltaFilter("all");
    setSearchQuery("");
  }

  // Finding detail view
  if (selectedFinding) {
    return (
      <FindingDetailView
        finding={selectedFinding}
        onBack={() => setSelectedFindingId(null)}
      />
    );
  }

  const severityOptions: Severity[] = ["critical", "high", "medium", "low", "info"];
  const exploitabilityOptions: Exploitability[] = ["verified", "unverified", "not_tested"];
  const deltaOptions: FindingDelta[] = ["new", "recurring", "regressed"];

  // Group findings by severity for the grouped display
  const groups = FINDING_SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    findings: sortedFindings.filter((f) => f.severity === sev),
  })).filter((g) => g.findings.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-5 p-6">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <Shield size={18} className="text-primary" />
        <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground">
          Security Findings
        </h1>
        <Badge tone="secondary" className="ml-auto">
          {filteredFindings.length} of {findings.length}
        </Badge>
        <button
          type="button"
          onClick={() => setSuppressionsOpen(true)}
          className="inline-flex items-center gap-1.5 border border-border bg-transparent px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-card-hover hover:text-foreground h-7"
        >
          <ShieldOff size={12} />
          Suppressions
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="text"
            aria-label="Search findings"
            placeholder="Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Filter chips + sort */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChipGroup<Severity>
            options={severityOptions}
            value={severityFilter}
            onChange={setSeverityFilter}
            getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />

          <div className="w-px self-stretch bg-border" />

          <FilterChipGroup<Exploitability>
            options={exploitabilityOptions}
            value={exploitabilityFilter}
            onChange={setExploitabilityFilter}
            getLabel={(v) => EXPLOITABILITY_LABELS[v]}
          />

          <div className="w-px self-stretch bg-border" />

          <FilterChipGroup<FindingDelta>
            options={deltaOptions}
            value={deltaFilter}
            onChange={setDeltaFilter}
            getLabel={(v) => DELTA_LABELS[v]}
          />

          {hasActiveFilter && (
            <>
              <div className="w-px self-stretch bg-border" />
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
              >
                Clear all
              </button>
            </>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <SortAsc size={12} className="text-muted-foreground/60" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as FindingSort)}
              className="h-7 w-[120px] border border-border bg-card px-2 text-[12px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="priority">Priority</option>
              <option value="severity">Severity</option>
              <option value="confidence">Confidence</option>
              <option value="recency">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="text-[12px] text-muted-foreground">
        Showing {filteredFindings.length} of {findings.length} findings
      </div>

      {/* Grouped findings */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Shield size={28} className="mb-3 text-muted-foreground/40" />
          <p className="text-[13px] text-muted-foreground">
            No findings match the current filters
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {groups.map((group) => (
            <SeveritySection
              key={group.severity}
              severity={group.severity}
              findings={group.findings}
              onSelectFinding={setSelectedFindingId}
              defaultOpen={group.severity === "critical" || group.severity === "high"}
            />
          ))}
        </div>
      )}

      {/* Suppressions dialog */}
      {suppressionsOpen && (
        <SuppressionsDialog
          findings={findings}
          onClose={() => setSuppressionsOpen(false)}
        />
      )}
    </div>
  );
}
