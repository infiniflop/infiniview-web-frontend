"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { WIRE_EVENTS } from "@/lib/site/content";

const TONE: Record<string, string> = {
  amber: "var(--iv-amber)",
  cyan: "var(--iv-cyan)",
  red: "var(--iv-red)",
  lime: "var(--iv-lime)",
};

/**
 * A sample scan, streamed. Same five events the pipeline emits, replayed on a
 * loop so the hero has a live pulse. It is labelled as a sample run: nothing
 * here is customer data.
 */
export function ScanCard() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", el);
      const crit = el.querySelector<HTMLElement>("[data-crit]");
      const high = el.querySelector<HTMLElement>("[data-high]");
      const posted = el.querySelector<HTMLElement>("[data-posted]");
      const live = el.querySelector<HTMLElement>("[data-live]");
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      if (!crit || !high || !posted || !live || !bar) return;

      // two media contexts, so the stream stops on a finished scan (and resumes) when the motion
      // preference changes while the page is open
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        crit.textContent = "1";
        high.textContent = "1";
        live.textContent = "Complete";
        gsap.set([...rows, posted], { autoAlpha: 1 });
        gsap.set(bar, { scaleX: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        crit.textContent = "0";
        high.textContent = "0";
        live.textContent = "Scanning";
        gsap.set([...rows, posted], { opacity: 0, y: 10 });
        gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });

        const tl = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 0.2,
          defaults: { ease: "power3.out" },
          onRepeat: () => {
            crit.textContent = "0";
            high.textContent = "0";
            live.textContent = "Scanning";
          },
        });
        tl.set(live, { textContent: "Scanning" }, 0);
        rows.forEach((row, i) => {
          const at = 0.35 + i * 0.7;
          tl.to(row, { opacity: 1, y: 0, duration: 0.55 }, at);
          tl.to(bar, { scaleX: (i + 1) / rows.length, duration: 0.6, ease: "power2.out" }, at);
          if (i === 2) tl.call(() => { crit.textContent = "1"; }, [], at + 0.1);
          if (i === 3) tl.call(() => { high.textContent = "1"; }, [], at + 0.1);
        });
        const end = 0.35 + rows.length * 0.7;
        tl.to(posted, { opacity: 1, y: 0, duration: 0.6 }, end);
        tl.call(() => { live.textContent = "Complete"; }, [], end);
        // hold the finished scan, then quickly clear and replay
        tl.to([...rows, posted], { opacity: 0, y: -6, duration: 0.35, ease: "power1.in" }, end + 7);
        tl.to(bar, { scaleX: 0, duration: 0.35, ease: "power1.in" }, end + 7);
        tl.set(rows, { y: 10 }, end + 7.4);
        tl.set(posted, { y: 10 }, end + 7.4);
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 95%",
          end: "bottom 5%",
          onEnter: () => tl.play(),
          onEnterBack: () => tl.play(),
          onLeave: () => tl.pause(),
          onLeaveBack: () => tl.pause(),
        });
        // let the hero intro land first
        gsap.delayedCall(1.6, () => st.isActive && tl.play());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="scan glass" aria-label="Sample scan stream">
      <div className="scan-head">
        <div className="flex items-center gap-3">
          <span className="scan-pulse" aria-hidden />
          <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">
            <span data-live>Scanning</span>
          </span>
          <span className="t-small">acme/web-app</span>
        </div>
        <span className="chip">Sample run</span>
      </div>
      <div className="scan-bar" aria-hidden>
        <i data-bar />
      </div>
      <ol className="scan-rows">
        {WIRE_EVENTS.map((e) => (
          <li key={e.agent + e.msg} data-row className="scan-row">
            <span className="scan-phase">{e.phase}</span>
            <span className="scan-agent t-mono">{e.agent}</span>
            <span className="scan-msg" style={{ ["--tone" as string]: TONE[e.tone] }}>
              <i aria-hidden />
              {e.msg}
            </span>
          </li>
        ))}
      </ol>
      <div className="scan-foot">
        <div className="flex items-center gap-2.5">
          <span className="chip chip--crit">
            <i />
            <b className="tnum font-semibold" data-crit>0</b>&nbsp;critical
          </span>
          <span className="chip chip--high">
            <i />
            <b className="tnum font-semibold" data-high>0</b>&nbsp;high
          </span>
        </div>
        <span data-posted className="t-small">
          Posted to PR #247
        </span>
      </div>
    </div>
  );
}
