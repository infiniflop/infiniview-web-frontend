// Static demo UI. All data is mocked. No backend logic.

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileCode,
  Lightbulb,
  AlertCircle,
  Sparkles,
  Copy,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Target,
  TrendingUp,
  TrendingDown,
  CircleMinus,
  FileText,
  GitBranch,
  Check,
} from "lucide-react";
import { SeverityBadge } from "@/components/preview/ui";
import type { MockFinding } from "@/components/preview/mock-data";
import {
  formatFindingCategory,
  getFindingConfidencePercent,
  getModelRecommendation,
  EXPLOITABILITY_LABELS,
  DELTA_LABELS,
} from "@/components/preview/findings-lib";

export function FindingDetailView({
  finding,
  onBack,
}: {
  finding: MockFinding;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const description = finding.description ?? finding.summary;
  const primaryFile = finding.primaryFile ?? finding.file;
  const lineStart = finding.lineStart ?? finding.line;
  const lineEnd = finding.lineEnd;
  const attackPath = finding.attackPath ?? [];
  const evidence = finding.evidence ?? [];
  const affectedFiles = finding.affectedFiles ?? [];
  const poc = finding.poc;
  const suggestedFix = finding.suggestedFix;
  const recommendation = getModelRecommendation(finding);
  const confPercent = getFindingConfidencePercent(finding);

  function handleCopy() {
    if (!suggestedFix) return;
    void navigator.clipboard.writeText(suggestedFix).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="detail-enter flex flex-col gap-6 p-6 mx-auto w-full max-w-6xl">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={12} />
        Back to findings
      </button>

      {/* Badge row + title */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} />

          {/* Category */}
          <span className="inline-flex h-5 items-center rounded-md border border-border bg-transparent px-2 font-mono text-[10px] text-muted-foreground">
            {formatFindingCategory(finding.category)}
          </span>

          {/* Confidence */}
          <span className="inline-flex h-5 items-center rounded-md border border-transparent bg-secondary px-2 font-mono text-[10px] text-foreground">
            {confPercent}% confidence
          </span>

          {/* Exploitability */}
          <span
            className={cn(
              "inline-flex h-5 items-center gap-1 rounded-md border px-2 font-mono text-[10px]",
              finding.exploitability === "verified" &&
                "border-red-500/40 bg-red-500/10 text-red-400",
              finding.exploitability === "unverified" &&
                "border-amber-500/30 bg-amber-500/10 text-amber-400",
              finding.exploitability === "not_tested" &&
                "border-muted-foreground/30 text-muted-foreground",
            )}
          >
            {finding.exploitability === "verified" && (
              <ShieldAlert size={10} />
            )}
            {finding.exploitability === "unverified" && (
              <AlertCircle size={10} />
            )}
            {EXPLOITABILITY_LABELS[finding.exploitability]}
          </span>

          {/* Delta */}
          {finding.delta && (
            <span
              className={cn(
                "inline-flex h-5 items-center gap-1 rounded-md border px-2 font-mono text-[10px]",
                finding.delta === "new" &&
                  "border-amber-500/30 bg-amber-500/10 text-amber-400",
                finding.delta === "recurring" &&
                  "border-border bg-secondary text-muted-foreground",
                finding.delta === "regressed" &&
                  "border-red-500/30 bg-red-500/10 text-red-400",
              )}
            >
              {finding.delta === "regressed" && <TrendingDown size={10} />}
              {finding.delta === "new" && <TrendingUp size={10} />}
              {finding.delta === "recurring" && <CircleMinus size={10} />}
              {DELTA_LABELS[finding.delta]}
            </span>
          )}

          {/* Suppressed */}
          {finding.suppressed && (
            <span className="inline-flex h-5 items-center gap-1 rounded-md border border-muted-foreground/30 px-2 font-mono text-[10px] text-muted-foreground">
              <ShieldOff size={10} />
              suppressed
            </span>
          )}

          {/* Scanner */}
          {finding.scanner && (
            <span className="inline-flex h-5 items-center rounded-md border border-transparent bg-secondary px-2 font-mono text-[10px] text-foreground">
              {finding.scanner}
            </span>
          )}

          {/* Rule ID */}
          {finding.ruleId && (
            <span className="inline-flex h-5 items-center rounded-md border border-border px-2 font-mono text-[10px] text-muted-foreground">
              {finding.ruleId}
            </span>
          )}
        </div>

        {/* Exploit confirmed banner */}
        {finding.exploitability === "verified" && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-500/25 bg-red-500/[0.06] px-3.5 py-2.5">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <Target size={12} className="text-red-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wide text-red-300">
                Exploit Confirmed
              </span>
              <span className="text-[10px] text-red-300/60">
                Runtime verification confirmed this vulnerability is exploitable
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {finding.title}
        </h2>
      </div>

      {/* Summary + location */}
      <section className="border-y border-border py-4">
        <p className="text-[13px] leading-relaxed text-foreground/80">
          {description}
        </p>
        <div className="mt-3 flex items-center gap-2 border-l border-primary/35 bg-secondary/60 px-3 py-2">
          <FileCode size={12} className="shrink-0 text-primary/70" />
          <span className="font-mono text-[11px] text-foreground/80">
            {primaryFile}
          </span>
          <span className="bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
            L{lineStart}
            {typeof lineEnd === "number" && lineEnd !== lineStart
              ? `-${lineEnd}`
              : ""}
          </span>
        </div>
      </section>

      {/* Attack Path */}
      {attackPath.length > 0 && (
        <section className="border-b border-border pb-4">
          <div className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center bg-primary/12">
                <GitBranch size={14} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-foreground">
                  Attack Path
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Exploitation chain from entry to impact
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            {attackPath.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold",
                      index === 0
                        ? "border border-primary/40 bg-primary/15 text-primary"
                        : index === attackPath.length - 1
                          ? "border border-red-500/40 bg-red-500/15 text-red-400"
                          : "border border-border bg-secondary text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < attackPath.length - 1 && (
                    <div className="h-6 w-px bg-border" />
                  )}
                </div>
                <div className="min-w-0 pb-3">
                  <p className="font-mono text-[12px] text-foreground">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evidence */}
      {evidence.length > 0 && (
        <section className="border-b border-border pb-4">
          <div className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center bg-secondary">
                <Target size={14} className="text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-foreground">
                  Evidence
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Captured observations and runtime data
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {evidence.map((ev, index) => (
              <div key={index} className="bg-background/40 py-3">
                <p className="font-mono text-[11px] text-muted-foreground">
                  {ev}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Affected Files */}
      {affectedFiles.length > 0 && (
        <section className="border-b border-border pb-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <span className="text-[12px] font-medium text-foreground">
              Affected Files
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {affectedFiles.map((file) => (
              <li key={file} className="font-mono text-[11px] text-muted-foreground">
                {file}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Proof & Evidence card */}
      <div className="rounded-none border border-primary/20 bg-primary/[0.02]">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/12">
              <ShieldCheck size={14} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-foreground">
                Proof &amp; Evidence
              </span>
              <span className="text-[10px] text-muted-foreground">
                Replay artifacts, proof-of-concept, and export actions
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 px-4 py-4">
          {/* Action links */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15 rounded-md"
            >
              Replay Finding
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground rounded-md"
            >
              Download Proof Bundle
            </button>
          </div>

          {/* PoC block */}
          {poc ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-foreground">
                  Proof of Concept
                </span>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-secondary p-4 font-mono text-[12px] leading-relaxed text-foreground">
                <code>{poc}</code>
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8">
              <ShieldCheck size={20} className="text-muted-foreground/30" />
              <p className="text-[12px] text-muted-foreground">
                No replay artifacts were captured for this finding.
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Replay and bundle links above will work once evidence is generated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Model Recommendation */}
      <div className="border border-primary/15 bg-primary/[0.03]">
        <div className="flex items-center gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center bg-primary/12">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-foreground">
              Recommended Model
            </span>
            <span className="text-[11px] text-muted-foreground">
              {recommendation}
            </span>
          </div>
        </div>
      </div>

      {/* Fix Prompt */}
      {suggestedFix && (
        <div className="border border-border">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Lightbulb size={14} className="text-primary" />
                  <span className="text-[12px] font-semibold text-foreground">
                    Fix Prompt
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Hand this prompt directly to your coding agent
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 border border-border bg-transparent px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-card-hover hover:text-foreground h-7"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Fix"}
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            <pre className="overflow-x-auto rounded-lg border border-border bg-secondary p-4 font-mono text-[12px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {suggestedFix}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
