"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MOCK_FINDINGS = [
  { severity: "CRITICAL", color: "text-red", bg: "bg-red/5", title: "SQL Injection in /api/users", agent: "injection-tester", proof: 3 },
  { severity: "HIGH", color: "text-orange-400", bg: "", title: "Broken auth on /admin route", agent: "auth-attacker", proof: 5 },
  { severity: "MEDIUM", color: "text-yellow-400", bg: "", title: "Missing rate limiting on /api/login", agent: "rate-limit-tester", proof: 2 },
];

type Phase = "idle" | "running" | "complete";

export function DashboardPreviewAnimated() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleFindings, setVisibleFindings] = useState(0);
  const [showBottom, setShowBottom] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("complete");
      setVisibleFindings(3);
      setShowBottom(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          observer.disconnect();
          setPhase("running");

          setTimeout(() => setVisibleFindings(1), 800);
          setTimeout(() => setVisibleFindings(2), 1400);
          setTimeout(() => setVisibleFindings(3), 2000);
          setTimeout(() => setPhase("complete"), 2600);
          setTimeout(() => setShowBottom(true), 3000);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const severityCounts = {
    critical: visibleFindings >= 1 ? 1 : 0,
    high: visibleFindings >= 2 ? 1 : 0,
    medium: visibleFindings >= 3 ? 1 : 0,
  };

  return (
    <div ref={containerRef} className="border border-border bg-bg-elevated/70 overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border font-mono text-[11px]">
        <div className="flex items-center gap-4">
          <span className="text-lime tracking-[0.14em]">SCAN RESULTS</span>
          <span className="text-text-muted">acme/web-app</span>
        </div>
        <div className="flex items-center gap-4">
          {phase === "complete" ? (
            <span className="text-green transition-colors duration-300">COMPLETE</span>
          ) : phase === "running" ? (
            <span className="text-amber animate-pulse">RUNNING...</span>
          ) : (
            <span className="text-text-muted">—</span>
          )}
          {phase === "complete" && <span className="text-text-muted">2m 47s ago</span>}
        </div>
      </div>

      {/* Severity summary */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 px-4 py-3 border-b border-border font-mono text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red" />
          <span className="text-red">{severityCounts.critical} critical</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-400" />
          <span className="text-orange-400">{severityCounts.high} high</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-yellow-400" />
          <span className="text-yellow-400">{severityCounts.medium} medium</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400" />
          <span className="text-emerald-400">0 low</span>
        </span>
      </div>

      {/* Finding rows */}
      {MOCK_FINDINGS.map((f, i) => (
        <div
          key={i}
          className={cn(
            "px-4 py-3.5 font-mono text-[11.5px] transition-all duration-400 ease-out",
            i > 0 && "border-t border-border",
            f.bg,
            i < visibleFindings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          <div className="hidden sm:grid grid-cols-[80px_1fr_140px_80px] gap-3 items-center">
            <span className={cn("font-bold tracking-[0.04em]", f.color)}>{f.severity}</span>
            <span className="text-text">{f.title}</span>
            <span className="text-lime">{f.agent}</span>
            <span className="text-text-muted text-right">{f.proof} files</span>
          </div>
          <div className="sm:hidden flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className={cn("font-bold tracking-[0.04em]", f.color)}>{f.severity}</span>
              <span className="text-text-muted">{f.proof} files</span>
            </div>
            <span className="text-text">{f.title}</span>
            <span className="text-lime text-[10.5px]">{f.agent}</span>
          </div>
        </div>
      ))}

      {/* Bottom bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-t border-border font-mono text-[11px] text-text-muted transition-opacity duration-500",
          showBottom ? "opacity-100" : "opacity-0",
        )}
      >
        <span>12 agents completed in 2m 47s</span>
        <span className="text-lime">→ view full report</span>
      </div>
    </div>
  );
}
