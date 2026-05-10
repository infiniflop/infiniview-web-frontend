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
  Menu,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedReview = selectedReviewId
    ? findReview(selectedReviewId) ?? null
    : null;

  const headerLabel = useMemo(() => {
    if (selectedReview) return selectedReview.name ?? selectedReview.repoFullName;
    return view === "reviews" ? "Reviews" : "Findings";
  }, [selectedReview, view]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-foreground">
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <DemoSidebar
        view={view}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectView={(v) => {
          setSelectedReviewId(null);
          setView(v);
          setSidebarOpen(false);
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoHeader title={headerLabel} onMenuToggle={() => setSidebarOpen(true)} />

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
  open,
  onClose,
  onSelectView,
}: {
  view: View;
  open: boolean;
  onClose: () => void;
  onSelectView: (v: View) => void;
}) {
  return (
    <aside className={cn(
      "flex h-full w-[228px] shrink-0 flex-col border-r border-border bg-bg-elevated",
      "fixed md:relative z-50 transition-transform duration-200",
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
    )}>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span className="relative inline-block h-[22px] w-[22px] bg-primary">
            <span className="absolute inset-1 border-[1.5px] border-bg" />
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.02em]">
            INFINIVIEW
            <span className="text-lime">/</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden text-text-secondary hover:text-text"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
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

function DemoHeader({ title, onMenuToggle }: { title: string; onMenuToggle: () => void }) {
  return (
    <header className="flex h-14 md:h-16 shrink-0 items-center border-b border-border px-4 md:px-5 gap-2">
      <button
        type="button"
        onClick={onMenuToggle}
        className="md:hidden inline-flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>
      <h1 className="text-base md:text-[20px] font-extrabold tracking-[-0.03em] text-foreground truncate">
        {title}
      </h1>

      <span className="hidden sm:inline-flex ml-2 md:ml-3 h-6 items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary shrink-0">
        <EyeOff size={11} />
        Demo mode · sample data
      </span>

      <div className="ml-auto flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          aria-disabled
          title="Search is disabled in the demo"
          className="hidden md:inline-flex h-9 w-56 cursor-not-allowed items-center gap-2 border border-border bg-bg-card px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted transition-colors hover:border-border-accent"
        >
          <Search size={12} />
          <span>Search</span>
          <kbd className="ml-auto border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9.5px] leading-none text-text-muted">
            ⌘K
          </kbd>
        </button>
        <Link
          href="/#waitlist"
          className="btn-lime font-mono text-[11px] px-3 md:px-4 py-2 md:py-2.5 tracking-[0.08em] uppercase whitespace-nowrap"
        >
          <span className="hidden sm:inline">Join waitlist →</span>
          <span className="sm:hidden">Waitlist</span>
        </Link>
      </div>
    </header>
  );
}
