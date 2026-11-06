// Static demo UI. All data is mocked. No backend logic.
// Top-level dashboard shell — sidebar nav + header + view switching. State
// is plain useState; no router, no fetch, no backend imports.

"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
  type RefObject,
} from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileCode,
  History,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  GitFork,
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
import { Button } from "@/components/preview/ui";
import { cn } from "@/lib/utils";

type View = "reviews" | "scan-history" | "findings" | "security" | "settings";

interface NavItem {
  id: View;
  label: string;
  icon: ElementType;
  wired: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "reviews", label: "Reviews", icon: FileCode, wired: true },
  { id: "scan-history", label: "Scan History", icon: History, wired: false },
  { id: "findings", label: "Findings", icon: ShieldAlert, wired: true },
  { id: "security", label: "Security", icon: Shield, wired: false },
  { id: "settings", label: "Settings", icon: Settings, wired: false },
];

const NAV_LABELS = Object.fromEntries(
  NAV_ITEMS.map((i) => [i.id, i.label]),
) as Record<View, string>;

// Below md the sidebar is an off-canvas drawer (a modal while open); from md up it is the persistent
// sidebar and must never carry modal semantics or make the page inert. WIDE_QUERY is the md breakpoint
// exactly as Tailwind emits it (`md:` = @media (min-width:48rem)); NARROW_QUERY is its logical complement
// (what `max-md:` emits), so no width, fractional ones included, falls between the two.
const WIDE_QUERY = "(min-width: 48rem)";
const NARROW_QUERY = `not all and ${WIDE_QUERY}`;
function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useIsNarrow() {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DashboardMock() {
  const [view, setView] = useState<View>("reviews");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // the open drawer is a real modal on phones: the page behind it is inert (no Tab stops, out of the
  // accessibility tree), the drawer is a labelled dialog, focus goes into it and wraps inside it, and
  // Escape, the close button, the overlay or picking a view hand focus back to the button that opened it
  const narrow = useIsNarrow();
  const modal = sidebarOpen && narrow;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerWasOpen = useRef(false);

  useEffect(() => {
    if (sidebarOpen) {
      drawerWasOpen.current = true;
      // one frame later: the closed drawer is visibility:hidden until the open transition has begun
      const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSidebarOpen(false);
          return;
        }
        if (e.key !== "Tab") return;
        // keep Tab and Shift+Tab inside the drawer: wrap at either end (or pull focus back in if it strayed)
        const drawer = drawerRef.current;
        if (!drawer) return;
        const items = [...drawer.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
          (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden",
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        const inside = !!active && drawer.contains(active);
        if (e.shiftKey && (!inside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKey);
      // widening to md or beyond (resize, rotate) hides the overlay and makes the sidebar persistent:
      // the drawer is no longer a modal, so it closes and the page must not stay inert
      const wide = window.matchMedia(WIDE_QUERY);
      const onWide = () => {
        if (wide.matches) setSidebarOpen(false);
      };
      wide.addEventListener("change", onWide);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("keydown", onKey);
        wide.removeEventListener("change", onWide);
      };
    }
    if (drawerWasOpen.current) {
      drawerWasOpen.current = false;
      menuButtonRef.current?.focus(); // no-op where that button is hidden (md and up)
    }
  }, [sidebarOpen]);

  const selectedReview = selectedReviewId
    ? findReview(selectedReviewId) ?? null
    : null;

  const headerLabel = useMemo(() => NAV_LABELS[view], [view]);

  const selectView = (v: View) => {
    setSelectedReviewId(null);
    setView(v);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DemoSidebar
        view={view}
        collapsed={collapsed}
        open={sidebarOpen}
        modal={modal}
        drawerRef={drawerRef}
        onClose={() => setSidebarOpen(false)}
        closeButtonRef={closeButtonRef}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        onSelectView={selectView}
      />

      <div className="flex flex-1 flex-col overflow-hidden" inert={modal}>
        <DemoHeader
          label={headerLabel}
          onMenuToggle={() => setSidebarOpen(true)}
          menuButtonRef={menuButtonRef}
          drawerOpen={modal}
        />

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
            />
          )}

          {view === "findings" && <FindingsView findings={MOCK_FINDINGS} />}

          {(view === "scan-history" ||
            view === "security" ||
            view === "settings") && <ComingSoonView view={view} />}
        </div>
      </div>
    </div>
  );
}

function DemoSidebar({
  view,
  collapsed,
  open,
  modal,
  drawerRef,
  onClose,
  closeButtonRef,
  onToggleCollapsed,
  onSelectView,
}: {
  view: View;
  collapsed: boolean;
  open: boolean;
  /** open below md: the drawer is a modal dialog; false for the persistent sidebar */
  modal: boolean;
  drawerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onToggleCollapsed: () => void;
  onSelectView: (v: View) => void;
}) {
  return (
    <div
      id="preview-sidebar"
      ref={drawerRef}
      // a div, not an aside: the dialog role is not permitted on aside. Persistent sidebar = complementary
      // landmark (what the aside was); only the open mobile drawer is a modal dialog with a name
      role={modal ? "dialog" : "complementary"}
      aria-modal={modal ? true : undefined}
      aria-label={modal ? "Navigation menu" : undefined}
      className={cn(
        // visibility flips at once when the drawer opens (so focus can move into it) and only after the slide
        // when it closes: durations are per property (width, transform, visibility), delays likewise
        "fixed z-50 flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width,transform,visibility] [transition-duration:200ms,200ms,0s] motion-reduce:transition-none ease-[cubic-bezier(0.16,1,0.3,1)] md:relative",
        open
          ? "translate-x-0"
          : "-translate-x-full max-md:invisible md:translate-x-0 [transition-delay:0s,0s,200ms]",
      )}
      style={{ width: collapsed ? 56 : 228 }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-sidebar-border px-4">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="brand-mark shrink-0" />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              INFINIVIEW
              <span className="text-primary">/</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150",
                isActive
                  ? "nav-item-active bg-sidebar-accent font-bold text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon size={14} className={isActive ? "text-primary" : ""} />
              {!collapsed && (
                <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em]">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        <Link
          prefetch={false}
          href="https://docs.infiniview.dev"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "Docs" : undefined}
          className="flex items-center gap-2.5 px-3 py-2.5 text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <BookOpen size={14} />
          {!collapsed && (
            <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em]">
              Docs
            </span>
          )}
        </Link>

        {!collapsed && (
          <div className="mt-4 px-0.5">
            <Button
              variant="lime"
              size="sm"
              onClick={() => onSelectView("reviews")}
              className="w-full justify-start gap-2 text-[13px] font-medium"
            >
              <Plus size={14} />
              New Review
            </Button>
          </div>
        )}
        {collapsed && (
          <div className="mt-4 px-0.5">
            <Button
              variant="lime"
              size="sm"
              aria-label="New review"
              onClick={() => onSelectView("reviews")}
              className="h-8 w-full"
            >
              <Plus size={14} />
            </Button>
          </div>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border px-2 py-3">
        {!collapsed && (
          <div className="mb-1 flex items-center gap-2 px-2.5 py-1.5">
            <GitFork size={13} className="shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate font-mono text-[11px] text-muted-foreground">
              @acme-dev
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center gap-2.5 px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span className="text-[12px]">Collapse</span>}
        </button>

        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-foreground ring-1 ring-border">
            A
          </div>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-[12px] font-medium text-foreground">
                Acme Dev
              </span>
              <Link
                href="/"
                prefetch={false}
                aria-label="Exit demo"
                title="Exit demo"
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut size={12} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoHeader({
  label,
  onMenuToggle,
  menuButtonRef,
  drawerOpen,
}: {
  label: string;
  onMenuToggle: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  drawerOpen: boolean;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 md:px-5">
      <button
        type="button"
        ref={menuButtonRef}
        onClick={onMenuToggle}
        aria-expanded={drawerOpen}
        aria-controls="preview-sidebar"
        className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      <h1 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-foreground">
        {label}
      </h1>

      <span className="ml-2 hidden h-6 shrink-0 items-center gap-1.5 whitespace-nowrap border border-primary/30 bg-primary/10 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:inline-flex">
        Demo · sample data
      </span>

      <Link
        href="/"
        prefetch={false}
        className="ml-1.5 hidden h-6 shrink-0 items-center gap-1.5 whitespace-nowrap border border-border bg-card px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-border-accent hover:text-foreground lg:inline-flex"
      >
        <X size={11} />
        Exit demo
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-disabled
          title="Search is disabled in the demo"
          className="hidden h-9 w-56 cursor-not-allowed items-center gap-2 border border-border bg-card px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-border-accent xl:inline-flex"
        >
          <Search size={12} />
          <span>Search</span>
          <kbd className="ml-auto border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9.5px] leading-none text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <Link
          prefetch={false}
          href="/#waitlist"
          className="btn-lime whitespace-nowrap px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] md:px-4 md:py-2.5"
        >
          <span className="hidden sm:inline">Get early access →</span>
          <span className="sm:hidden">Access</span>
        </Link>
      </div>
    </header>
  );
}

const COMING_SOON_COPY: Record<
  Exclude<View, "reviews" | "findings">,
  { icon: ElementType; title: string; body: string }
> = {
  "scan-history": {
    icon: History,
    title: "Scan History",
    body: "Browse every completed and in-progress run, compare deltas across scans, and restore archived reviews. Available in the full product.",
  },
  security: {
    icon: Shield,
    title: "Security Configuration",
    body: "Tune scanners, attack agents, and scan defaults per repository. Available in the full product.",
  },
  settings: {
    icon: Settings,
    title: "Settings",
    body: "Manage your GitHub connection, automation preferences, and team access. Available in the full product.",
  },
};

function ComingSoonView({
  view,
}: {
  view: "scan-history" | "security" | "settings";
}) {
  const copy = COMING_SOON_COPY[view];
  const Icon = copy.icon;
  return (
    <div className="fade-enter mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center border border-border bg-card">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground">
        {copy.title}
      </h3>
      <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      <Link
        prefetch={false}
        href="/#waitlist"
        className="btn-lime mt-6 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em]"
      >
        Get early access →
      </Link>
    </div>
  );
}
