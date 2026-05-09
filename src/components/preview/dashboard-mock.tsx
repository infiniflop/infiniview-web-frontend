// Static demo UI. All data is mocked. No backend logic.
// Top-level dashboard shell — sidebar nav + header + view switching. State
// is plain useState; no router, no fetch, no backend imports.

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  EyeOff,
  FileCode,
  History,
  Lock,
  Search,
  Settings,
  Shield,
  ShieldAlert,
} from "lucide-react";
import {
  MOCK_FINDINGS,
  MOCK_OVERVIEW_STATS,
  MOCK_REVIEWS,
  findingsForReview,
  interactionTestsForReview,
  findReview,
} from "@/components/preview/mock-data";
import { ReviewsView } from "@/components/preview/views/reviews-view";
import { ReviewDetailView } from "@/components/preview/views/review-detail-view";
import { FindingsView } from "@/components/preview/views/findings-view";
import { cn } from "@/lib/utils";

type View = "reviews" | "findings";

const ACTIVE_NAV_ITEMS: {
  id: View;
  label: string;
  icon: typeof FileCode;
}[] = [
  { id: "reviews", label: "Reviews", icon: FileCode },
  { id: "findings", label: "Findings", icon: ShieldAlert },
];

const INERT_NAV_ITEMS: { label: string; icon: typeof FileCode }[] = [
  { label: "Scan History", icon: History },
  { label: "Security", icon: Shield },
  { label: "Settings", icon: Settings },
];

export function DashboardMock() {
  const [view, setView] = useState<View>("reviews");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const selectedReview = selectedReviewId
    ? findReview(selectedReviewId) ?? null
    : null;

  const headerLabel = useMemo(() => {
    if (selectedReview) return selectedReview.name ?? selectedReview.repoFullName;
    return view === "reviews" ? "Reviews" : "Findings";
  }, [selectedReview, view]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-foreground">
      <DemoSidebar
        view={view}
        onSelectView={(v) => {
          setSelectedReviewId(null);
          setView(v);
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoHeader title={headerLabel} />

        <div className="flex flex-1 overflow-y-auto">
          {view === "reviews" && !selectedReview && (
            <ReviewsView
              reviews={MOCK_REVIEWS}
              overviewStats={MOCK_OVERVIEW_STATS}
              onSelect={(id) => setSelectedReviewId(id)}
            />
          )}

          {view === "reviews" && selectedReview && (
            <ReviewDetailView
              review={selectedReview}
              findings={findingsForReview(selectedReview.id)}
              interactionTests={interactionTestsForReview(selectedReview.id)}
              onBack={() => setSelectedReviewId(null)}
              onOpenFinding={() => {
                // In the real app this would deep-link to the finding detail
                // page. In the demo, we just bounce the user to the global
                // findings view to keep scope small but coherent.
                setSelectedReviewId(null);
                setView("findings");
              }}
            />
          )}

          {view === "findings" && <FindingsView findings={MOCK_FINDINGS} />}
        </div>
      </div>
    </div>
  );
}

function DemoSidebar({
  view,
  onSelectView,
}: {
  view: View;
  onSelectView: (v: View) => void;
}) {
  return (
    <aside className="flex h-full w-[228px] shrink-0 flex-col border-r border-border bg-bg-elevated">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span className="relative inline-block h-[22px] w-[22px] bg-primary">
            <span className="absolute inset-1 border-[1.5px] border-bg" />
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.02em]">
            INFINIVIEW
            <span className="text-lime">/</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4">
        {ACTIVE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 text-left font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150",
                isActive
                  ? "bg-bg-card font-bold text-foreground"
                  : "text-text-secondary hover:bg-bg-card/60 hover:text-foreground",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-primary"
                />
              )}
              <Icon size={14} className={isActive ? "text-primary" : ""} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-5 border-t border-border pt-3">
          <div className="px-3 pb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
            Locked in demo
          </div>
          {INERT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                aria-disabled="true"
                title="Disabled in demo · sign up to enable"
                className="flex cursor-not-allowed items-center gap-2.5 px-3 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-text-muted/70"
              >
                <Icon size={14} />
                <span className="flex-1">{item.label}</span>
                <Lock size={10} className="opacity-70" />
              </div>
            );
          })}
        </div>

        <Link
          href="https://docs.infiniview.dev"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-2.5 px-3 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-text-secondary transition-colors hover:bg-bg-card/60 hover:text-foreground"
        >
          <BookOpen size={14} />
          Docs
          <ArrowUpRight size={11} className="ml-auto opacity-60" />
        </Link>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="btn-ghost flex w-full items-center justify-center gap-2 px-3 py-2.5"
        >
          <ChevronLeft size={12} />
          Exit demo
        </Link>
      </div>
    </aside>
  );
}

function DemoHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border px-5">
      <h1 className="text-[20px] font-extrabold tracking-[-0.03em] text-foreground">
        {title}
      </h1>

      <span className="ml-3 inline-flex h-6 items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
        <EyeOff size={11} />
        Demo mode · sample data
      </span>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          type="button"
          aria-disabled
          title="Search is disabled in the demo"
          className="inline-flex h-9 w-56 cursor-not-allowed items-center gap-2 border border-border bg-bg-card px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted transition-colors hover:border-border-accent"
        >
          <Search size={12} />
          <span>Search</span>
          <kbd className="ml-auto border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9.5px] leading-none text-text-muted">
            ⌘K
          </kbd>
        </button>
        <Link
          href="/#waitlist"
          className="btn-lime font-mono text-[11px] px-4 py-2.5 tracking-[0.08em] uppercase"
        >
          Join waitlist →
        </Link>
      </div>
    </header>
  );
}
