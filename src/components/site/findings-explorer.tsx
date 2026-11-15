"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/site/gsap";
import { SAMPLE_FINDINGS } from "@/lib/site/content";
import { aimLight, setMood } from "@/lib/site/scene";
import { createPill, DUR, EASE } from "@/lib/site/motion";
import { haptic, tap } from "@/lib/site/haptics";

type Finding = (typeof SAMPLE_FINDINGS)[number];

const TABS = ["Proof", "Attack path", "Code", "Fix"] as const;
const SEV = {
  critical: { label: "Critical", cls: "chip--crit" },
  high: { label: "High", cls: "chip--high" },
} as const;

/* a tiny tokenizer: enough colour to read, none of the weight of a highlighter */
function tint(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\/.*$)|('[^']*'|"[^"]*"|`[^`]*`)|\b(export|async|function|const|return|await|if|import|from|default|new)\b|(\b\d+\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "tk-c" : m[2] ? "tk-s" : m[3] ? "tk-k" : "tk-n";
    out.push(<span key={i++} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

const DWELL = 5.2; // seconds per tab when auto-playing

export function FindingsExplorer() {
  const root = useRef<HTMLElement>(null);
  const railPill = useRef<HTMLSpanElement>(null);
  const tabPill = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [fi, setFi] = useState(0);
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  // the autoplay holds while the pointer is over the console, focus is inside it, or the visitor paused it
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  // choosing Resume is an explicit request to play: it outranks the hover/focus hold (the pointer and the
  // focus are still on the button that was just pressed) until the pointer and focus have both left
  const [resumed, setResumed] = useState(false);
  const running = auto && inView && !userPaused && (resumed || (!hovered && !focused));

  const f: Finding = SAMPLE_FINDINGS[fi];

  /* ── in view: autoplay may run, and the light sits behind the console ──── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => {
            setInView(self.isActive);
            if (self.isActive) {
              // behind the console: a faint vermilion line of light around its edges
              aimLight(root.current?.querySelector<HTMLElement>(".console") ?? null, 0.5, 0.42);
              setMood({ spread: 0.3, energy: 0.7, alert: 0.6, proof: 0 }, 1.4);
            }
          },
        });
        return () => st.kill();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setAuto(false);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // the hero's tray (or anything else) can ask for a finding: show it, with its proof
  useEffect(() => {
    const onAsk = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const i = SAMPLE_FINDINGS.findIndex((x) => x.id === id);
      if (i < 0) return;
      setAuto(false);
      setFi(i);
      setTab(0);
    };
    window.addEventListener("iv:finding", onAsk);
    return () => window.removeEventListener("iv:finding", onAsk);
  }, []);

  /* ── sliding pills: glass on springs (lib/site/motion.ts) ─────────────── */
  // layout offsets (not bounding rects), so they stay true whatever is being transformed around them
  const pills = useRef<{ rail?: ReturnType<typeof createPill>; tab?: ReturnType<typeof createPill> }>({});
  const slide = useCallback((which: "rail" | "tab", pill: HTMLElement | null, wrap: HTMLElement | null, target: HTMLElement | null, instant = false) => {
    if (!pill || !wrap || !target) return;
    // on a phone the tab strip and the findings rail scroll sideways: bring the active one into view
    // (scrollLeft on the strip itself, never scrollIntoView, which would move the page)
    if (wrap.scrollWidth > wrap.clientWidth + 1) {
      wrap.scrollTo({
        left: Math.max(0, target.offsetLeft - (wrap.clientWidth - target.offsetWidth) / 2),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
    const p = (pills.current[which] ??= createPill(pill));
    p.to({ x: target.offsetLeft, y: target.offsetTop, w: target.offsetWidth, h: target.offsetHeight }, instant || prefersReducedMotion());
  }, []);
  useEffect(() => {
    const p = pills.current;
    return () => {
      p.rail?.stop();
      p.tab?.stop();
    };
  }, []);

  useEffect(() => {
    const place = (instant = false) => {
      slide("rail", railPill.current, railRef.current, railRef.current?.querySelector<HTMLElement>(`[data-i="${fi}"]`) ?? null, instant);
      slide("tab", tabPill.current, tabsRef.current, tabsRef.current?.querySelector<HTMLElement>(`[data-t="${tab}"]`) ?? null, instant);
    };
    place();
    const snap = () => place(true); // a change of layout is not a change of selection: no travel
    window.addEventListener("resize", snap);
    // text metrics can change with no resize: web fonts arriving after hydration, or the reader's text size.
    // Items are observed, not just the window, so a pill never stays sized for the old text.
    const ro = new ResizeObserver(snap);
    [railRef.current, tabsRef.current].forEach((strip) => strip?.querySelectorAll("[data-i], [data-t]").forEach((el) => ro.observe(el)));
    document.fonts?.addEventListener?.("loadingdone", snap);
    return () => {
      window.removeEventListener("resize", snap);
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", snap);
    };
  }, [fi, tab, slide]);

  /* ── content swap choreography ────────────────────────────────────────
     The proof is replayed, not faded in: each request is typed at a constant rate (it is a hand on a
     keyboard), then its response arrives. `replay` bumps to play it again. The other tabs arrive as a
     short stagger. */
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || prefersReducedMotion()) return;
    const panel = body.querySelector<HTMLElement>(`[data-f="${fi}"][data-panel="${tab}"]`);
    if (!panel) return;
    const lines = gsap.utils.toArray<HTMLElement>("[data-line]", panel);
    if (tab !== 0) {
      const tween = gsap.fromTo(lines, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.out, stagger: 0.05, overwrite: true });
      return () => {
        tween.kill();
      };
    }
    const tl = gsap.timeline();
    let at = 0.05;
    lines.forEach((line) => {
      if (line.classList.contains("http-gap")) {
        at += 0.12;
        return;
      }
      const text = line.querySelector<HTMLElement>(".http-text");
      if (line.classList.contains("http-line--req") && text) {
        const typing = Math.min(1.1, 0.25 + (text.textContent?.length ?? 0) * 0.014);
        tl.set(line, { autoAlpha: 1, y: 0 }, at).fromTo(text, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: typing, ease: "none" }, at);
        at += typing + 0.22;
      } else {
        tl.fromTo(line, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: EASE.out }, at).fromTo(
          line,
          { backgroundColor: "rgba(255,90,71,0.28)" },
          { backgroundColor: "rgba(255,90,71,0)", duration: 0.9, ease: "power2.out" },
          at,
        );
        at += 0.34;
      }
    });
    gsap.set(lines, { autoAlpha: 0 });
    return () => {
      tl.kill();
      gsap.set(lines, { clearProps: "all" });
      lines.forEach((l) => l.querySelector<HTMLElement>(".http-text")?.style.removeProperty("clip-path"));
    };
  }, [fi, tab, replay]);

  const head = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!head.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      head.current.querySelectorAll(".detail-head[data-on='true'] [data-head]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: DUR.enter, ease: EASE.out, stagger: 0.05 },
    );
    return () => {
      t.kill();
    };
  }, [fi]);

  /* ── autoplay: walk the evidence until the visitor takes over ──────────
     One clock: the progress bar's CSS animation. The next tab is shown when it ends, so pausing
     (animation-play-state) pauses both, and they can never drift apart. */
  const advance = () => {
    if (!auto) return;
    if (tab < TABS.length - 1) setTab(tab + 1);
    else {
      setTab(0);
      setFi((fi + 1) % SAMPLE_FINDINGS.length);
    }
  };

  const pick = (i: number) => {
    if (i !== fi || tab !== 0) haptic("selection"); // only when the selection really moves
    setAuto(false);
    setFi(i);
    setTab(0);
  };
  const pickTab = (t: number) => {
    if (t !== tab) haptic("selection");
    setAuto(false);
    setTab(t);
  };
  // roving tabindex: arrow keys change the selection *and* move DOM focus with it
  const arrow = (e: React.KeyboardEvent<HTMLElement>, n: number, cur: number, set: (i: number) => void) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (cur + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (cur - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
    set(next);
    tabs?.[next]?.focus();
  };

  return (
    <section ref={root} id="findings" className="proof" aria-labelledby="proof-title">
      <div className="wrap">
        <div className="sec-head proof-head">
          <h2 id="proof-title" className="t-h2" data-split>
            Forensic findings, not just alerts.
          </h2>
          <div className="proof-aside">
            <p className="t-lede" data-reveal>
              Every vulnerability comes with root-cause evidence, affected code paths, and a suggested fix.
            </p>
            <Link href="/preview" prefetch={false} className="link proof-link" data-reveal>
              Open the full interactive demo
              <ArrowRight size={16} className="inline" />
            </Link>
          </div>
        </div>

        <div
          className="console pane"
          data-reveal
          onPointerEnter={() => {
            setHovered(true);
            setResumed(false);
          }}
          onPointerLeave={() => {
            setHovered(false);
            if (!focused) setResumed(false);
          }}
          onFocusCapture={(e) => {
            setFocused(true);
            if (!(e.target as HTMLElement).closest(".console-pause")) setResumed(false); // moving on to another control: hold again
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocused(false);
              if (!hovered) setResumed(false);
            }
          }}
        >
          <div className="console-top">
            <div className="flex items-center gap-3">
              <span className="console-dots" aria-hidden><i /><i /><i /></span>
              <span className="console-name">Review</span>
              <span className="console-repo t-mono">acme/web-app</span>
            </div>
            <div className="flex items-center gap-3">
              {auto && (
                <button
                  type="button"
                  className="console-pause"
                  aria-label={userPaused ? "Resume auto-play" : "Pause auto-play"}
                  {...tap("light")}
                  onClick={() => {
                    setResumed(userPaused);
                    setUserPaused((v) => !v);
                  }}
                >
                  {userPaused ? <Play size={13} strokeWidth={2.6} aria-hidden /> : <Pause size={13} strokeWidth={2.6} aria-hidden />}
                </button>
              )}
              <span className="app-tag">Sample data</span>
            </div>
          </div>

          <div className="console-grid">
            {/* findings rail */}
            <div
              ref={railRef}
              role="tablist"
              aria-label="Findings"
              aria-orientation="vertical"
              className="rail"
              tabIndex={-1}
              data-lenis-prevent-wheel
            >
              <span ref={railPill} className="rail-pill" aria-hidden />
              {SAMPLE_FINDINGS.map((x, i) => (
                <button
                  key={x.id}
                  role="tab"
                  id={`finding-${x.id}`}
                  aria-selected={i === fi}
                  aria-controls="finding-panel"
                  tabIndex={i === fi ? 0 : -1}
                  data-i={i}
                  className="rail-item"
                  onClick={() => pick(i)}
                  onKeyDown={(e) => arrow(e, SAMPLE_FINDINGS.length, fi, pick)}
                >
                  <span className={`rail-dot rail-dot--${x.severity}`} aria-hidden />
                  <span className="rail-text">
                    <span className="rail-title">{x.title}</span>
                    <span className="rail-file t-mono">
                      {x.file}:{x.line}
                    </span>
                  </span>
                </button>
              ))}
              <div className="rail-foot" aria-hidden>
                <p className="rail-foot-title">Every finding ships with</p>
                <ul>
                  {["Screenshot", "HTTP trace", "Console log", "Code path", "Fix suggestion"].map((x) => (
                    <li key={x}>
                      <i />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* detail */}
            <div id="finding-panel" role="tabpanel" aria-labelledby={`finding-${f.id}`} className="detail">
              <div ref={head} className="detail-heads">
                {SAMPLE_FINDINGS.map((x, i) => (
                  <div key={x.id} className="detail-head" data-on={i === fi} aria-hidden={i !== fi || undefined}>
                    <h3 className="t-h3 detail-title" data-head>{x.title}</h3>
                    <div className="detail-chips" data-head>
                      <span className={`chip ${SEV[x.severity].cls}`}>
                        <i /> {SEV[x.severity].label}
                      </span>
                      <span className="chip">{x.category}</span>
                      <span className="chip chip--ok">
                        <i /> Verified exploit
                      </span>
                      <span className="chip tnum">{x.confidence}% confidence</span>
                    </div>
                    <p className="t-body detail-sum" data-head>{x.summary}</p>
                  </div>
                ))}
              </div>

              <div ref={tabsRef} role="tablist" aria-label="Evidence" className="tabs" tabIndex={-1} data-lenis-prevent-wheel>
                <span ref={tabPill} className="tab-pill" aria-hidden />
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    role="tab"
                    id={`evidence-tab-${i}`}
                    aria-controls={`finding-${f.id}-panel-${i}`}
                    aria-selected={i === tab}
                    tabIndex={i === tab ? 0 : -1}
                    data-t={i}
                    className="tab"
                    onClick={() => pickTab(i)}
                    onKeyDown={(e) => arrow(e, TABS.length, tab, pickTab)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* every finding's four panels share one grid cell: the console is as tall as the tallest of
                  them, so changing finding or tab never moves the page below it */}
              <div ref={bodyRef} className="panels">
                {SAMPLE_FINDINGS.map((x, fidx) => (
                  <Fragment key={x.id}>
                    {/* proof */}
                    <div id={`finding-${x.id}-panel-0`} role="tabpanel" aria-labelledby="evidence-tab-0" data-f={fidx} data-panel="0" data-on={fidx === fi && tab === 0} aria-hidden={!(fidx === fi && tab === 0) || undefined} className="panel">
                      <div className="http t-mono" role="region" aria-label="HTTP proof" tabIndex={0}>
                        {x.proof.lines.map((l, i) =>
                          l.t === "gap" ? (
                            <div key={i} className="http-gap" data-line />
                          ) : (
                            <div key={i} data-line className={`http-line http-line--${l.t}`}>
                              <span className="http-arrow" aria-hidden>{l.t === "req" ? "→" : "←"}</span>
                              <span className="http-text">{l.v}</span>
                            </div>
                          ),
                        )}
                      </div>
                      <button
                        type="button"
                        className="http-replay"
                        {...tap("light")}
                        tabIndex={fidx === fi && tab === 0 ? 0 : -1}
                        onClick={() => {
                          setAuto(false);
                          setReplay((n) => n + 1);
                        }}
                      >
                        <RotateCcw size={13} strokeWidth={2.4} aria-hidden />
                        Replay
                      </button>
                    </div>

                    {/* attack path */}
                    <div id={`finding-${x.id}-panel-1`} role="tabpanel" aria-labelledby="evidence-tab-1" data-f={fidx} data-panel="1" data-on={fidx === fi && tab === 1} aria-hidden={!(fidx === fi && tab === 1) || undefined} className="panel">
                      <ol className="path">
                        {x.path.map((p, i) => (
                          <li key={i} data-line className="path-step">
                            <span className="path-n">{i + 1}</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* code */}
                    <div id={`finding-${x.id}-panel-2`} role="tabpanel" aria-labelledby="evidence-tab-2" data-f={fidx} data-panel="2" data-on={fidx === fi && tab === 2} aria-hidden={!(fidx === fi && tab === 2) || undefined} className="panel">
                      <div className="code t-mono" role="region" aria-label="Affected code" tabIndex={0}>
                        <div className="code-file" data-line>{x.code.file}</div>
                        {x.code.lines.map((ln, i) => {
                          const n = x.code.from + i;
                          const hot = n === x.code.hot;
                          return (
                            <div key={i} data-line className={`code-line${hot ? " code-line--hot" : ""}`}>
                              <span className="code-n">{n}</span>
                              <span className="code-t">{tint(ln)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* fix */}
                    <div id={`finding-${x.id}-panel-3`} role="tabpanel" aria-labelledby="evidence-tab-3" data-f={fidx} data-panel="3" data-on={fidx === fi && tab === 3} aria-hidden={!(fidx === fi && tab === 3) || undefined} className="panel">
                      <p className="t-body fix-note" data-line>{x.fix.note}</p>
                      <div className="code t-mono" role="region" aria-label="Suggested fix" tabIndex={0}>
                        {x.fix.diff.map((d, i) => (
                          <div key={i} data-line className={`code-line code-line--${d.t}`}>
                            <span className="code-n">{d.t === "add" ? "+" : "−"}</span>
                            <span className="code-t">{tint(d.v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="console-bar" aria-hidden>
            <i
              key={`${fi}-${tab}`}
              onAnimationEnd={advance}
              style={{
                animationDuration: `${DWELL}s`,
                animationPlayState: running ? "running" : "paused",
                opacity: auto ? 1 : 0,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
