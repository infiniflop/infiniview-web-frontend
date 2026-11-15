"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { HERO, SAMPLE_FINDINGS } from "@/lib/site/content";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { SampleApp } from "@/components/site/sample-app";
import { MaskedWords } from "@/components/site/ui";
import { aimLight, setMood } from "@/lib/site/scene";
import { applyGlassMap, buildGlassMap } from "@/lib/site/glass";
import { Spring, SPRING, VelocityTracker, clamp, onClock, project } from "@/lib/site/motion";
import { scrollToTarget } from "@/lib/site/scroll";

// the light stands behind the stage, toward its upper right: its halo shows beside the headline
const HERO_MOOD = { alert: 0, proof: 0, energy: 0.8, x: 0.86, y: 0.62, spread: 0.26 };

const WORDS: { text: string; br?: boolean }[] = [
  { text: "Attack" },
  { text: "your" },
  { text: "code", br: true },
  { text: "before" },
  { text: "anyone" },
  { text: "else" },
  { text: "does." },
];

type FindingId = (typeof SAMPLE_FINDINGS)[number]["id"];
// what a found slot says: the name the pipeline and the console use for it, and a one-word form
// where there is only room for a word (phones, small laptops)
const NAME: Record<FindingId, string> = { sqli: "SQL injection", refund: "Replayable refund", rate: "No rate limit" };
const SHORT: Record<FindingId, string> = { sqli: "SQLi", refund: "Replay", rate: "No limit" };
const IDS = SAMPLE_FINDINGS.map((f) => f.id) as FindingId[];

/** Tell the findings console which finding to show (it listens; see findings-explorer.tsx). */
export function showFinding(id: FindingId) {
  window.dispatchEvent(new CustomEvent("iv:finding", { detail: id }));
  const target = document.getElementById("findings");
  if (target) scrollToTarget(target, { offset: -20, duration: 1.4 });
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const fx = useRef<HTMLDivElement>(null);
  const glint = useRef<HTMLSpanElement>(null);
  const reticle = useRef<HTMLSpanElement>(null);

  const [found, setFound] = useState<FindingId[]>([]);
  const [touched, setTouched] = useState(false);
  // the lens loop lives outside React: these let the tray talk to it
  const seek = useRef<(id: FindingId) => void>(() => {});
  const foundRef = useRef<Set<FindingId>>(new Set());

  const markFound = useCallback((id: FindingId) => {
    if (foundRef.current.has(id)) return;
    foundRef.current.add(id);
    setFound((cur) => (cur.includes(id) ? cur : [...cur, id]));
  }, []);

  // the opening mood: a cool light behind the stage
  useGSAP(() => {
    const light = () => {
      // side by side, the light stands behind the stage's upper right and its halo shows beside the
      // headline; stacked (tablets, phones) the copy sits right above the stage, so it stands lower
      const stacked = window.matchMedia("(max-width: 1023px)").matches;
      aimLight(stage.current, stacked ? 0.6 : 0.72, stacked ? 0.7 : 0.22);
      setMood(HERO_MOOD, 1.2);
    };
    light();
    // coming back up the page hands the light back to the stage
    const st = ScrollTrigger.create({ trigger: root.current, start: "top top", end: "bottom 60%", onEnterBack: light });
    return () => st.kill();
  });

  /* ── The lens ──────────────────────────────────────────────────────────
     A piece of glass on two springs. While a pointer holds it, it IS the pointer (no easing); when
     it is let go it carries on at the speed it had, toward where a throw would land. Left alone it
     drifts over the app by itself. Nothing here goes through React state per frame. */
  useEffect(() => {
    const st = stage.current;
    const el = lens.current;
    const vw = view.current;
    const fxEl = fx.current;
    if (!st || !el || !vw || !fxEl) return;

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    let SW = 0;
    let SH = 0;
    let L = 0;
    let hot: { id: FindingId; x: number; y: number }[] = [];
    const sx = new Spring(0, SPRING.soft);
    const sy = new Spring(0, SPRING.soft);
    const focus = new Spring(0, SPRING.ui); // 0 far from a weak point, 1 on it
    type Mode = "auto" | "follow" | "drag" | "seek" | "rest";
    let mode: Mode = "auto";
    let t = 0;
    let over: FindingId | null = null;
    let overFor = 0;
    // where the weak point under the glass is, measured from the glass's centre: the brackets go to it
    let aimX = 0;
    let aimY = 0;
    let inView = true;
    let idleTimer = 0;
    const tracker = new VelocityTracker();
    let grabX = 0;
    let grabY = 0;
    let pointerId = -1;

    const measure = () => {
      const r = st.getBoundingClientRect();
      const first = SW === 0;
      SW = r.width;
      SH = r.height;
      L = el.offsetWidth;
      hot = [];
      st.querySelectorAll<HTMLElement>(".stage-app [data-hot]").forEach((h) => {
        const b = h.getBoundingClientRect();
        hot.push({ id: h.dataset.hot as FindingId, x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 });
      });
      if (first) {
        // start where the server's CSS put it, so nothing jumps when the loop takes over
        const cs = getComputedStyle(st);
        sx.set(SW * (parseFloat(cs.getPropertyValue("--lx")) || 0.34));
        sy.set(SH * (parseFloat(cs.getPropertyValue("--ly")) || 0.42));
      } else {
        sx.set(clamp(sx.value, 0, SW));
        sy.set(clamp(sy.value, 0, SH));
      }
      // the refraction map is built for the lens's exact size
      // a wide, shallow bezel: text bends as it reaches the rim, it is never torn
      const map = buildGlassMap({ width: L, height: L, radius: L * 0.32, bezel: Math.max(14, L * 0.14), depth: L * 0.1, zoom: 1.05 }, L * 0.038);
      const ok = applyGlassMap(document.getElementById("glass-lens") as SVGFilterElement | null, map, 0.035);
      fxEl.dataset.fx = ok ? "on" : "off";
    };

    // The glass never leaves the app at the top or the sides (there is nothing of the app for it to
    // show out there). At the bottom it may dip behind the tray, which sits in front of it like a
    // ledge, so it can still reach the app's last row.
    const bounds = () => ({ x0: L * 0.5, x1: SW - L * 0.5, y0: L * 0.5, y1: SH - L * 0.5 + 38 });
    /** where the glass rests when it is not being steered: fully on the stage, clear of the tray */
    const park = () => {
      sx.to(clamp(sx.value, L * 0.5, SW - L * 0.5), SPRING.ui);
      sy.to(clamp(sy.value, L * 0.5, SH - L * 0.56), SPRING.ui);
    };

    const paint = () => {
      const x = sx.value;
      const y = sy.value;
      const reduced = mqReduce.matches;
      const speed = Math.hypot(sx.velocity, sy.velocity);
      const s = reduced ? 0 : Math.min(0.06, speed / 9000);
      const ang = Math.atan2(sy.velocity, sx.velocity);
      const left = x - L / 2;
      const top = y - L / 2;
      el.style.transform =
        s > 0.002
          ? `translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0) rotate(${ang.toFixed(3)}rad) scale(${(1 + s).toFixed(4)},${(1 - s * 0.7).toFixed(4)}) rotate(${(-ang).toFixed(3)}rad)`
          : `translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0)`;
      vw.style.transform = `translate3d(${(-left).toFixed(2)}px,${(-top).toFixed(2)}px,0)`;
      // the highlight slides against the direction of travel and sits toward the light (upper left)
      if (glint.current) {
        const gx = clamp(-sx.velocity * 0.014, -14, 14) + (x / Math.max(1, SW) - 0.5) * -10;
        const gy = clamp(-sy.velocity * 0.014, -14, 14) + (y / Math.max(1, SH) - 0.5) * -8;
        glint.current.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;
      }
      if (reticle.current) {
        const f = focus.value;
        // at the stage's edges the glass stops but the brackets carry on to the weak point
        const reach = L * 0.27;
        reticle.current.style.transform = `translate3d(${(clamp(aimX, -reach, reach) * f).toFixed(2)}px,${(clamp(aimY, -reach, reach) * f).toFixed(2)}px,0) scale(${(1 - 0.24 * f).toFixed(3)})`;
        reticle.current.style.opacity = (0.5 + 0.5 * f).toFixed(3);
      }
    };

    const frame = (dt: number) => {
      const reduced = mqReduce.matches;
      t += dt;
      if (mode === "auto" && !reduced && hot.length) {
        // a slow figure over the middle of the table: it shows what the glass does (emails beside
        // their password hashes) without touching a weak point, so the game is left to the visitor
        const b = bounds();
        sx.to(clamp(SW * 0.47 + Math.cos(t * 0.52) * SW * 0.12, b.x0, b.x1), SPRING.soft);
        sy.to(clamp(SH * 0.6 + Math.sin(t * 0.74) * SH * 0.12, b.y0, SH - L * 0.56), SPRING.soft);
      }
      const moving = [sx.step(dt), sy.step(dt)].some(Boolean);

      // which weak point is under the middle of the glass?
      let near: FindingId | null = null;
      let best = Infinity;
      for (const h of hot) {
        const d = Math.hypot(h.x - sx.value, h.y - sy.value);
        if (d < best) {
          best = d;
          near = d < L * 0.42 ? h.id : null;
          if (near) {
            aimX = h.x - sx.value;
            aimY = h.y - sy.value;
          }
        }
      }
      focus.to(near ? 1 : 0, SPRING.ui);
      const focusing = focus.step(dt);
      if (near !== over) {
        over = near;
        overFor = 0;
        el.dataset.over = near ?? "";
      } else if (near) {
        overFor += dt;
        // only a visitor finds things: the lens drifting by itself does not play the game for them
        if (overFor > 0.22 && mode !== "auto") markFound(near);
      }
      paint();
      return inView && (mode === "auto" ? !reduced : moving || focusing || mode === "drag" || (near !== null && !foundRef.current.has(near)));
    };
    const clock = onClock(frame);

    const toStage = (e: PointerEvent) => {
      const r = st.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const goAuto = () => {
      if (mqReduce.matches) return;
      mode = "auto";
      clock.wake();
    };
    const idle = (ms: number) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(goAuto, ms);
    };
    const takeOver = () => {
      window.clearTimeout(idleTimer);
      if (!el.dataset.touched) {
        el.dataset.touched = "true";
        setTouched(true);
      }
    };

    /* fine pointers: the glass follows the cursor over the stage */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (mode === "drag") return;
      takeOver();
      mode = "follow";
      const p = toStage(e);
      const b = bounds();
      const tx = clamp(p.x, b.x0, b.x1);
      const ty = clamp(p.y, b.y0, b.y1);
      if (mqReduce.matches) {
        sx.set(tx);
        sy.set(ty);
      } else {
        sx.to(tx, SPRING.follow);
        sy.to(ty, SPRING.follow);
      }
      clock.wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (mode === "follow") {
        mode = "rest";
        park(); // the pointer has gone to the tray or the page: the glass gets out of the way
        clock.wake();
        idle(3200);
      }
    };

    /* touch: pick the glass up. 1:1 while the finger is down, a spring with its velocity after */
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && fine.matches) return; // the cursor already has it
      if (pointerId !== -1) return; // a second finger does not steal it
      pointerId = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId); // keeps the drag when the finger leaves the glass
      } catch {
        /* a pointer that is already gone cannot be captured: the drag still works while it is over the glass */
      }
      takeOver();
      mode = "drag";
      const p = toStage(e);
      grabX = p.x - sx.value; // respect where it was grabbed
      grabY = p.y - sy.value;
      tracker.reset();
      tracker.add(p.x, p.y);
      el.dataset.held = "true";
      clock.wake();
    };
    const onDrag = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const p = toStage(e);
      tracker.add(p.x, p.y);
      const b = bounds();
      // past the edge it follows less and less
      const rx = p.x - grabX;
      const ry = p.y - grabY;
      const soft = (v: number, lo: number, hi: number) => (v < lo ? lo - (lo - v) * 0.22 : v > hi ? hi + (v - hi) * 0.22 : v);
      sx.set(soft(rx, b.x0, b.x1));
      sy.set(soft(ry, b.y0, b.y1));
      clock.wake();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      delete el.dataset.held;
      const v = tracker.get();
      const b = bounds();
      const reduced = mqReduce.matches;
      mode = "rest";
      // a flick throws it: aim at where the momentum would carry it, clamped to the stage
      sx.to(clamp(sx.value + (reduced ? 0 : project(v.x)), b.x0, b.x1), SPRING.release, reduced ? 0 : v.x);
      sy.to(clamp(sy.value + (reduced ? 0 : project(v.y)), b.y0, b.y1), SPRING.release, reduced ? 0 : v.y);
      clock.wake();
      idle(9000);
    };

    /* keyboard and tray: send the glass to a weak point */
    seek.current = (id) => {
      const h = hot.find((p) => p.id === id);
      if (!h) return;
      takeOver();
      mode = "seek";
      if (mqReduce.matches) {
        const b = bounds();
        sx.set(clamp(h.x, b.x0, b.x1));
        sy.set(clamp(h.y, b.y0, b.y1));
        markFound(id);
      } else {
        const b = bounds();
        sx.to(clamp(h.x, b.x0, b.x1), SPRING.ui);
        sy.to(clamp(h.y, b.y0, b.y1), SPRING.ui);
      }
      clock.wake();
      idle(12000);
    };

    measure();
    paint();
    el.dataset.live = "true";
    const ro = new ResizeObserver(() => {
      measure();
      paint();
      clock.wake();
    });
    ro.observe(st);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) clock.wake();
    });
    io.observe(st);
    const onPref = () => {
      if (mqReduce.matches) {
        mode = "rest";
        sx.to(sx.value);
        sy.to(sy.value);
      } else goAuto();
      clock.wake();
    };
    mqReduce.addEventListener("change", onPref);

    st.addEventListener("pointermove", onMove);
    st.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onDrag);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    if (!mqReduce.matches) clock.wake();

    return () => {
      clock.stop();
      window.clearTimeout(idleTimer);
      ro.disconnect();
      io.disconnect();
      mqReduce.removeEventListener("change", onPref);
      st.removeEventListener("pointermove", onMove);
      st.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      delete el.dataset.live;
      seek.current = () => {};
    };
  }, [markFound]);

  // the mark in the tray ticks as each one lands (a one-shot, not a loop)
  const trayRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);
  useEffect(() => {
    if (found.length <= lastCount.current) return;
    lastCount.current = found.length;
    const id = found[found.length - 1];
    const slot = trayRef.current?.querySelector<HTMLElement>(`[data-slot="${id}"]`);
    if (!slot || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tw = gsap.fromTo(slot, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "back.out(2.2)", clearProps: "transform" });
    return () => {
      tw.kill();
    };
  }, [found]);

  const all = found.length === IDS.length;

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <h1 id="hero-title" className="t-display hero-h1" aria-label="Attack your code before anyone else does.">
          <MaskedWords words={WORDS} />
        </h1>

        <div className="hero-copy">
          <p className="t-lede hero-lede">{HERO.lede}</p>
          <WaitlistForm id="waitlist" />
          <ul className="hero-assure">
            {HERO.assurances.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="hero-stage-col">
          <div ref={stage} className="stage" data-all={all ? "true" : undefined}>
            <div className="stage-app pane" aria-hidden>
              <SampleApp />
            </div>

            {/* the lens: a registered copy of the app in attack view, bent by the glass around it */}
            <div ref={lens} className="lens" aria-hidden>
              <div ref={fx} className="lens-fx">
                <div ref={view} className="lens-view">
                  <SampleApp mode="xray" />
                </div>
              </div>
              <span className="lens-body" />
              <span ref={glint} className="lens-glint" />
              <span ref={reticle} className="lens-reticle">
                <i />
              </span>
              <span className="lens-hint" data-off={touched ? "true" : undefined}>
                <span className="lens-hint-fine">Move the lens</span>
                <span className="lens-hint-touch">Drag the lens</span>
              </span>
            </div>
          </div>

          <div ref={trayRef} className="tray pane" role="group" aria-label="Sample findings hidden in this app">
            <p className="tray-count t-label" aria-live="polite">
              <b>{found.length}</b>
              <span aria-hidden>/</span>
              <span className="sr-only"> of </span>
              {IDS.length} found
            </p>
            <ul className="tray-list">
              {SAMPLE_FINDINGS.map((f, i) => {
                const got = found.includes(f.id);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      className="tray-slot"
                      data-slot={f.id}
                      data-found={got ? "true" : undefined}
                      data-sev={f.severity}
                      onClick={() => (got ? showFinding(f.id) : seek.current(f.id))}
                    >
                      <i aria-hidden />
                      <span className="tray-long">{got ? NAME[f.id] : `Weak point ${i + 1}`}</span>
                      <span className="tray-short">{got ? SHORT[f.id] : `Point ${i + 1}`}</span>
                      {/* the name is what is on the button, then the rest: no label that says something else */}
                      <span className="sr-only">
                        {got ? `: ${f.title}, ${f.severity}. Open its proof.` : ` of ${IDS.length}. Send the lens to it.`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {/* always in its place, so finding the last one moves nothing: a hint until then, the way on after */}
            <a
              className="tray-go"
              href="#findings"
              data-on={all ? "true" : undefined}
              tabIndex={all ? undefined : -1}
              aria-hidden={all ? undefined : true}
            >
              <span className="tray-go-off" aria-hidden>
                Find all three
              </span>
              <span className="tray-go-on">
                Replay the proof
                <ArrowDown size={14} strokeWidth={2.6} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
