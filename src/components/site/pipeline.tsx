"use client";

import { useRef } from "react";
import { Check, GitPullRequest, Lock, X } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { aimLight, setMood } from "@/lib/site/scene";
import { PIPELINE_STEPS } from "@/lib/site/content";
import { SampleApp } from "@/components/site/sample-app";
import { scrollToTarget } from "@/lib/site/scroll";
import { VelocityTracker, clamp, project } from "@/lib/site/motion";

/* Where each probe goes: [lane 0..3, the weak point it lands on (or a spot on the app, as fractions)] */
const PROBES: { lane: number; hot?: "sqli" | "refund" | "rate"; at?: [number, number] }[] = [
  { lane: 0, at: [0.34, 0.3] },
  { lane: 0, at: [0.62, 0.58] },
  { lane: 0, at: [0.82, 0.76] },
  { lane: 1, at: [0.3, 0.52] },
  { lane: 1, at: [0.5, 0.4] },
  { lane: 1, at: [0.72, 0.68] },
  { lane: 1, at: [0.9, 0.44] },
  { lane: 2, hot: "sqli" },
  { lane: 2, hot: "sqli" },
  { lane: 2, hot: "refund" },
  { lane: 2, hot: "refund" },
  { lane: 2, hot: "rate" },
  { lane: 3, hot: "refund" },
  { lane: 3, hot: "rate" },
  { lane: 3, at: [0.44, 0.82] },
  { lane: 3, at: [0.66, 0.34] },
];

const LANES = [
  { k: "review", label: "Code review", n: "×4" },
  { k: "static", label: "Scanners", n: "×26" },
  { k: "runtime", label: "Runtime attacks", n: "×12" },
  { k: "interaction", label: "Interaction tests", n: "×7" },
] as const;

const FILES = ["Screenshot", "HTTP trace", "Console log", "Code path", "Fix suggestion"];

const FINDS = [
  { id: "sqli", hot: "sqli", sev: "crit", label: "SQL injection" },
  { id: "refund", hot: "refund", sev: "crit", label: "Replayable refund" },
  { id: "rate", hot: "rate", sev: "high", label: "Missing rate limit" },
  { id: "dup", hot: "rate", sev: "high", label: "Missing rate limit" },
] as const;

const N = PIPELINE_STEPS.length;

// The pinned stage plus the active step's copy cannot fit a short screen. Only a landscape phone is
// that short in practice; a portrait phone whose browser bars are expanded can read ~550px tall, and
// flipping layouts as the URL bar collapses would rebuild the page under the reader's thumb.
const SHORT = 560;
const TINY = 480; // under this even a portrait screen is too short for the pin
const STATIC_Q = `(orientation: landscape) and (max-height: ${SHORT - 1}px), (max-height: ${TINY - 1}px)`;
const PIN_OK = `(min-height: ${TINY}px) and ((orientation: portrait) or (min-height: ${SHORT}px))`;

/**
 * "From pull request to proof": one run, as a pinned stage scrubbed by the scroll, or by dragging
 * its timeline. The glass's job in this chapter is containment: it closes around the sample app
 * and becomes the sandbox. Five beats, each with an exact rest pose, playable in both directions.
 */
export function Pipeline() {
  const root = useRef<HTMLElement>(null);
  // the pinned ScrollTrigger, for the step buttons and the timeline handle
  const pin = useRef<ScrollTrigger | null>(null);

  const progressToScroll = (p: number) => {
    const st = pin.current;
    return st ? st.start + clamp(p, 0, 1) * (st.end - st.start) : null;
  };
  /** go to a beat's rest pose (just before the next beat begins, so this step is the active one) */
  const jump = (i: number, smooth = true) => {
    const y = progressToScroll((i + 0.94) / N);
    if (y === null) return;
    scrollToTarget(y, { duration: 1.1, immediate: !smooth });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const host = root.current!;
      const q = <T extends Element = HTMLElement>(sel: string) => host.querySelector<T>(sel)!;
      const qa = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, host);

      const stage = q(".pstage");
      const fit = q(".pstage-fit");
      const list = q(".pipe-steps");
      const items = qa("[data-step]");
      const handle = q(".pipe-handle");
      const track = q(".pipe-track");
      const fill = q(".pipe-fill");

      /* ── always: scale the design space to its box ─────────────────── */
      let k = 1;
      const fitStage = () => {
        const tall = window.matchMedia("(max-width: 1023px)").matches;
        stage.dataset.layout = tall ? "tall" : "wide";
        const dw = tall ? 600 : 960;
        const dh = tall ? 600 : 560;
        k = Math.min(stage.clientWidth / dw, stage.clientHeight / dh);
        // centred by percentage, not by the grid: a box wider than its track would overflow one way only
        gsap.set(fit, { scale: k, width: dw, height: dh, xPercent: -50, yPercent: -50 });
      };
      fitStage();
      const ro = new ResizeObserver(fitStage);
      ro.observe(stage);

      /** a point in the stage's design space */
      const centre = (el: Element) => {
        const f = fit.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return { x: (r.left - f.left + r.width / 2) / k, y: (r.top - f.top + r.height / 2) / k, w: r.width / k, h: r.height / k };
      };

      const build = () => {
        const chamber = q(".p-chamber");
        const shell = q(".p-shell");
        // (the dashed plate dims and returns; its label is a sibling, so it stays readable throughout)
        const prod = q(".p-prod");
        const pr = q(".p-pr");
        const lanes = q(".p-lanes");
        const bundle = q(".p-bundle");
        const xray = q(".p-xray");
        const probeEls = qa(".p-probe");
        const ripples = qa(".p-ripple");
        const finds = qa(".p-find");

        gsap.set([lanes, bundle, chamber, q(".p-torn")], { autoAlpha: 0 });
        gsap.set(qa(".p-find, .p-merge, .p-fix"), { autoAlpha: 0 });
        gsap.set(probeEls, { autoAlpha: 0, xPercent: -50, yPercent: -50 });
        gsap.set(ripples, { autoAlpha: 0, xPercent: -50, yPercent: -50 });
        gsap.set(xray, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(shell, { clipPath: "inset(0 0 100% 0)" });
        gsap.set(qa(".p-tick, .p-shell-chip"), { autoAlpha: 0, x: -8 });
        gsap.set(qa(".p-lane"), { autoAlpha: 0, x: -12 });
        gsap.set(qa(".p-file"), { autoAlpha: 0, x: -8 });
        gsap.set(qa(".p-check[data-s]"), { autoAlpha: 0 });

        // measured once, with everything in place: the design space never reflows
        gsap.set([chamber, lanes], { autoAlpha: 1 });
        const hot: Record<string, { x: number; y: number }> = {};
        chamber.querySelectorAll<HTMLElement>(".p-live [data-hot]").forEach((h) => (hot[h.dataset.hot!] = centre(h)));
        const box = centre(chamber);
        const laneEnds = qa(".p-lane").map((l) => {
          const c = centre(l);
          return { x: c.x + c.w / 2, y: c.y };
        });
        const bundleAt = centre(bundle);
        gsap.set([chamber, lanes], { autoAlpha: 0 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

        /* ── 1 · trigger: a pull request opens ─────────────────────────── */
        // (the pull request is already on the stage when the chapter arrives: an empty stage says nothing)
        tl.fromTo(pr, { y: -18, scale: 0.97 }, { y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0.02)
          .fromTo(qa(".p-diff i"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", stagger: 0.07, duration: 0.3 }, 0.12)
          .fromTo(q(".p-check[data-s='queued']"), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.25 }, 0.5)
          .fromTo(q(".p-wire"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 0.35, ease: "power2.inOut" }, 0.6)
          .fromTo(prod, { autoAlpha: 0.55 }, { autoAlpha: 1, duration: 0.4 }, 0.55);

        /* ── 2 · sandbox: a copy of the app is sealed in glass ─────────── */
        tl.fromTo(chamber, { autoAlpha: 0, x: 30, y: -30, scale: 0.97 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 1)
          .to(prod, { autoAlpha: 0.45, duration: 0.5 }, 1)
          .to(shell, { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "power2.inOut" }, 1.25)
          .to(q(".p-shell-chip"), { autoAlpha: 1, x: 0, duration: 0.3 }, 1.55)
          .to(qa(".p-tick"), { autoAlpha: 1, x: 0, stagger: 0.14, duration: 0.3 }, 1.35)
          .to(q(".p-check[data-s='queued']"), { autoAlpha: 0, duration: 0.15 }, 1.5)
          .to(q(".p-check[data-s='running']"), { autoAlpha: 1, duration: 0.2 }, 1.55);

        /* ── 3 · agents: four lanes fire into the app; it is seen as an attacker sees it ── */
        tl.to(lanes, { autoAlpha: 1, duration: 0.3 }, 2)
          .to(qa(".p-lane"), { autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.35 }, 2.03)
          .to(xray, { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power1.inOut" }, 2.2);
        PROBES.forEach((p, i) => {
          const el = probeEls[i];
          const from = laneEnds[p.lane];
          const to = p.hot ? hot[p.hot] : { x: box.x - box.w / 2 + box.w * p.at![0], y: box.y - box.h / 2 + box.h * p.at![1] };
          if (!el || !from || !to) return;
          const at = 2.22 + i * 0.038;
          tl.set(el, { x: from.x, y: from.y }, at - 0.01)
            .to(el, { autoAlpha: 1, duration: 0.05 }, at)
            .to(el, { x: to.x, y: to.y, duration: 0.42, ease: "power2.in" }, at)
            .to(el, { autoAlpha: 0, duration: 0.06 }, at + 0.42);
          const rip = ripples[i];
          if (rip) {
            tl.set(rip, { x: to.x, y: to.y }, at)
              .fromTo(rip, { autoAlpha: 0.9, scale: 0.3 }, { autoAlpha: 0, scale: 1.6, duration: 0.45, ease: "power2.out" }, at + 0.4);
          }
        });

        /* ── 4 · enrich: findings land where they were found; the duplicate merges ── */
        tl.to(qa(".p-lane"), { autoAlpha: 0.35, duration: 0.3 }, 3.02);
        finds.forEach((f, i) => {
          const at = hot[f.dataset.hot!];
          if (!at) return;
          const dup = f.dataset.find === "dup";
          // the weak points are on the app's right side: each chip ends at its point and reads leftward,
          // so none of them leaves the stage
          gsap.set(f, { x: at.x + 26 - (dup ? 150 : 0), y: at.y + (dup ? -72 : f.dataset.find === "sqli" ? 36 : -36), xPercent: -100, yPercent: -50 });
          tl.fromTo(f, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, 3.08 + i * 0.1);
        });
        const dupEl = q(".p-find[data-find='dup']");
        tl.to(dupEl, { x: (hot.rate?.x ?? 0) + 26, y: (hot.rate?.y ?? 0) - 36, autoAlpha: 0, duration: 0.42, ease: "power3.inOut" }, 3.6)
          .to(q(".p-merge"), { autoAlpha: 1, duration: 0.2 }, 3.86)
          .to(qa(".p-fix"), { autoAlpha: 1, stagger: 0.08, duration: 0.25 }, 3.7);

        /* ── 5 · report: proof is bundled and posted; the sandbox is torn down ── */
        tl.to(lanes, { autoAlpha: 0, duration: 0.25 }, 4.02)
          .fromTo(bundle, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" }, 4.12)
          .to(qa(".p-find:not([data-find='dup'])"), { x: bundleAt.x, y: bundleAt.y, scale: 0.5, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "power3.inOut" }, 4.14)
          .to(qa(".p-file"), { autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.28 }, 4.34)
          .to(chamber, { autoAlpha: 0, scale: 0.985, duration: 0.4, ease: "power3.in" }, 4.3)
          .to(q(".p-torn"), { autoAlpha: 1, duration: 0.3 }, 4.62)
          .to(prod, { autoAlpha: 1, duration: 0.4 }, 4.5)
          .to(q(".p-check[data-s='running']"), { autoAlpha: 0, duration: 0.15 }, 4.58)
          .to(q(".p-check[data-s='blocked']"), { autoAlpha: 1, duration: 0.25 }, 4.64)
          .to({}, { duration: 0.12 }, 4.88);
        return tl;
      };

      const setStep = (idx: number) => {
        items.forEach((li, i) => li.setAttribute("data-state", i < idx ? "done" : i === idx ? "active" : "todo"));
        list.setAttribute("data-idx", String(idx));
        handle.setAttribute("aria-valuenow", String(idx + 1));
        handle.setAttribute("aria-valuetext", `${PIPELINE_STEPS[idx].tag}: ${PIPELINE_STEPS[idx].title}`);
      };

      // Reduced motion, or a screen too short for the pinned stage plus its copy (a phone in
      // landscape): show the finished state, every step readable, no scroll-scrubbing
      mm.add(`(prefers-reduced-motion: reduce), ${STATIC_Q}`, () => {
        const tl = build();
        tl.progress(1);
        host.dataset.static = "true";
        items.forEach((li) => li.setAttribute("data-state", "active"));
        return () => {
          tl.revert();
          delete host.dataset.static;
          setStep(0);
        };
      });

      // the breakpoint is a condition, so crossing 1023px (rotating a tablet, resizing a window)
      // tears this setup down and rebuilds it with the right layout and pin length
      mm.add(
        {
          wide: `(min-width: 1024px) and ${PIN_OK} and (prefers-reduced-motion: no-preference)`,
          tall: `(max-width: 1023px) and ${PIN_OK} and (prefers-reduced-motion: no-preference)`,
        },
        (ctx) => {
          const tall = !!ctx.conditions?.tall;
          fitStage();
          const tl = build();
          const total = tl.duration();
          let current = -1;
          let dragging = false;
          let trackW = 1;
          // the light stands behind the sandbox throughout; its colour and strength tell the beat
          const moods = [
            { spread: 0.24, energy: 0.45, alert: 0, proof: 0 },
            { spread: 0.27, energy: 0.6, alert: 0, proof: 0 },
            { spread: 0.3, energy: 0.9, alert: 0.92, proof: 0 },
            { spread: 0.27, energy: 0.65, alert: 0.45, proof: 0 },
            { spread: 0.27, energy: 0.7, alert: 0, proof: 0.95 },
          ];
          const aim = () => aimLight(q(".p-chamber"), 0.5, 0.5);
          const placeHandle = (p: number) => {
            handle.style.transform = `translate3d(${(p * trackW).toFixed(2)}px,0,0)`;
            fill.style.transform = `scaleX(${p.toFixed(4)})`;
          };
          const measureTrack = () => {
            trackW = Math.max(1, track.clientWidth);
          };
          measureTrack();

          const st = ScrollTrigger.create({
            trigger: q(".pipe-pin"),
            start: "top top",
            end: () => `+=${window.innerHeight * (tall ? 4 : 4.6)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // pins refresh first so later triggers (nav spy, the finale) measure past the pin spacers
            refreshPriority: 1,
            animation: tl,
            onRefresh: measureTrack,
            onUpdate: (self) => {
              const t = self.progress * total;
              const idx = Math.min(N - 1, Math.floor(t + 0.001));
              if (!dragging) placeHandle(self.progress);
              if (idx !== current) {
                current = idx;
                setStep(idx);
                aim();
                setMood(moods[idx], 1.1);
              }
            },
          });
          pin.current = st;
          placeHandle(st.progress);

          // the chapter opens on a calm light; scrolling back up hands the light back to the statement
          const head = ScrollTrigger.create({
            trigger: q(".pipe-head"),
            start: "top 80%",
            onEnter: () => {
              aim();
              setMood(moods[0], 1);
            },
          });

          /* ── the timeline handle: drag it and the run follows ───────────
             1:1 while the pointer is down (the handle is the pointer, the page scrolls to match);
             on release the run carries on to where the throw would land and settles on a beat. */
          const tracker = new VelocityTracker();
          let pointerId = -1;
          let grab = 0;
          const pFromEvent = (e: PointerEvent) => {
            const r = track.getBoundingClientRect();
            return clamp((e.clientX - r.left - grab) / Math.max(1, r.width), 0, 1);
          };
          const onDown = (e: PointerEvent) => {
            if (pointerId !== -1 || (e.pointerType === "mouse" && e.button !== 0)) return;
            pointerId = e.pointerId;
            try {
              handle.setPointerCapture(e.pointerId);
            } catch {
              /* a pointer that is already gone cannot be captured */
            }
            const r = track.getBoundingClientRect();
            const hx = r.left + st.progress * r.width;
            grab = e.target === handle || handle.contains(e.target as Node) ? e.clientX - hx : 0; // respect where it was grabbed
            dragging = true;
            handle.dataset.held = "true";
            tracker.reset();
            tracker.add(e.clientX, 0);
            const p = pFromEvent(e);
            placeHandle(p);
            const y = st.start + p * (st.end - st.start);
            scrollToTarget(y, { immediate: true });
            e.preventDefault();
          };
          const onMove = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;
            tracker.add(e.clientX, 0);
            const p = pFromEvent(e);
            placeHandle(p);
            scrollToTarget(st.start + p * (st.end - st.start), { immediate: true });
          };
          const onUp = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;
            pointerId = -1;
            dragging = false;
            delete handle.dataset.held;
            const v = tracker.get().x / Math.max(1, track.clientWidth); // progress per second
            const landed = clamp(pFromEvent(e) + project(v * 1000, 0.99) / 1000, 0, 1);
            // settle on the nearest rest pose
            const beat = clamp(Math.round(landed * N), 0, N);
            const p = beat === 0 ? 0 : (beat - 0.06) / N;
            scrollToTarget(st.start + p * (st.end - st.start), { duration: 0.9 });
          };
          const onKey = (e: KeyboardEvent) => {
            const cur = Math.max(0, current);
            let next = -1;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(N - 1, cur + 1);
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, cur - 1);
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = N - 1;
            if (next < 0) return;
            e.preventDefault();
            scrollToTarget(st.start + ((next + 0.94) / N) * (st.end - st.start), { duration: 0.9 });
          };
          const scrub = q(".pipe-scrub");
          scrub.addEventListener("pointerdown", onDown);
          handle.addEventListener("pointermove", onMove);
          handle.addEventListener("pointerup", onUp);
          handle.addEventListener("pointercancel", onUp);
          handle.addEventListener("keydown", onKey);

          return () => {
            scrub.removeEventListener("pointerdown", onDown);
            handle.removeEventListener("pointermove", onMove);
            handle.removeEventListener("pointerup", onUp);
            handle.removeEventListener("pointercancel", onUp);
            handle.removeEventListener("keydown", onKey);
            pin.current = null;
            head.kill();
            st.kill();
            tl.revert();
            handle.style.transform = "";
            fill.style.transform = "";
            setStep(0);
          };
        },
      );

      return () => {
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how-it-works" className="pipe" aria-labelledby="pipe-title">
      <div className="wrap sec-head pipe-head">
        <h2 id="pipe-title" className="t-h2" data-split>
          From pull request to proof.
        </h2>
        <p className="t-lede" data-reveal>
          Code review, security testing, and interaction testing: fully automated, fully sandboxed.
        </p>
      </div>

      <div className="pipe-pin">
        <div className="wrap pipe-grid">
          <ol className="pipe-steps" data-idx="0">
            {PIPELINE_STEPS.map((s, i) => (
              <li key={s.id} data-step data-state={i === 0 ? "active" : "todo"} className="pipe-step">
                <h3 className="pipe-title">
                  <button type="button" className="pipe-btn" onClick={() => jump(i)}>
                    <span className="pipe-tag t-label">
                      <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                      <span>{s.tag}</span>
                    </span>
                    <span className="pipe-name">{s.title}</span>
                  </button>
                </h3>
                <div className="pipe-body">
                  <p className="t-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="pipe-stage-col">
            <div className="pstage" aria-hidden>
              <div className="pstage-fit">
                {/* production: never touched */}
                <span className="p-prod-label t-label">
                  <Lock size={11} strokeWidth={2.4} /> Production · untouched
                </span>
                <div className="p-prod">
                  <span className="p-prod-rows">
                    {Array.from({ length: 9 }, (_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                </div>

                {/* the pull request, and the check it will carry */}
                <div className="p-pr pane">
                  <div className="p-pr-top t-label">
                    <GitPullRequest size={13} strokeWidth={2.2} /> Pull request #247
                  </div>
                  <p className="p-pr-title">Add refund retries</p>
                  <div className="p-diff">
                    <i data-k="add" />
                    <i data-k="add" />
                    <i data-k="del" />
                    <i />
                  </div>
                  <div className="p-checks">
                    <span className="p-check" data-s="queued">
                      <b className="p-dot" /> Infiniview · queued
                    </span>
                    <span className="p-check" data-s="running">
                      <b className="p-spin" /> Infiniview · running
                    </span>
                    <span className="p-check" data-s="blocked">
                      <b className="p-x">
                        <X size={10} strokeWidth={3.4} />
                      </b>
                      2 critical, 1 high · merge blocked
                    </span>
                  </div>
                  <span className="p-wire" />
                </div>

                {/* the four layers of a scan */}
                <div className="p-lanes">
                  {LANES.map((l) => (
                    <div key={l.k} className="p-lane" style={{ ["--c" as string]: `var(--k-${l.k})` }}>
                      <span>{l.label}</span>
                      <b>{l.n}</b>
                    </div>
                  ))}
                </div>

                {/* the sandbox: the app, sealed in glass */}
                <div className="p-chamber">
                  <div className="p-app app-frame pane">
                    <div className="p-live">
                      <SampleApp label="Sandbox" />
                    </div>
                    <div className="p-xray">
                      <SampleApp mode="xray" />
                    </div>
                  </div>
                  <div className="p-shell" />
                  <span className="chip chip--ok p-shell-chip">
                    <i /> Isolated from production
                  </span>
                  <div className="p-ticks t-label">
                    {["Clone", "Build", "Deploy"].map((t) => (
                      <span key={t} className="p-tick">
                        <Check size={11} strokeWidth={3.2} /> {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="p-torn t-label">Sandbox torn down</p>

                {PROBES.map((p, i) => (
                  <i key={i} className="p-probe" style={{ ["--c" as string]: `var(--k-${LANES[p.lane].k})` }} />
                ))}
                {PROBES.map((p, i) => (
                  <i key={i} className="p-ripple" style={{ ["--c" as string]: `var(--k-${LANES[p.lane].k})` }} />
                ))}

                {/* what was found, pinned to where it was found */}
                {FINDS.map((f) => (
                  <span key={f.id} className={`p-find chip chip--${f.sev}`} data-find={f.id} data-hot={f.hot}>
                    <i /> {f.label}
                    {f.id !== "dup" && <em className="p-fix">fix</em>}
                    {f.id === "rate" && <em className="p-merge">merged ×2</em>}
                  </span>
                ))}

                {/* the proof bundle */}
                <div className="p-bundle pane">
                  <div className="p-pr-top t-label">Proof bundle</div>
                  <ul>
                    {FILES.map((f) => (
                      <li key={f} className="p-file">
                        <Check size={12} strokeWidth={3.2} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* the run's timeline: scrub it by hand */}
            <div className="pipe-scrub">
              <div className="pipe-track">
                <span className="pipe-fill" />
                <span
                  className="pipe-handle glass"
                  role="slider"
                  tabIndex={0}
                  aria-label="Scrub through the run"
                  aria-orientation="horizontal"
                  aria-valuemin={1}
                  aria-valuemax={N}
                  aria-valuenow={1}
                  aria-valuetext={`${PIPELINE_STEPS[0].tag}: ${PIPELINE_STEPS[0].title}`}
                >
                  <i />
                  <i />
                </span>
              </div>
              <ol className="pipe-ticks t-label" aria-hidden>
                {PIPELINE_STEPS.map((s) => (
                  <li key={s.id}>{s.tag}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
