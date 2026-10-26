"use client";

import { useRef } from "react";
import { GitPullRequest, Lock, ShieldCheck, Check, FileText, Image as ImageIcon, Terminal, Waypoints, Wrench } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/site/gsap";
import { setMood } from "@/lib/site/scene";
import { PIPELINE_STEPS } from "@/lib/site/content";

/* Probe routes: [lane, target on the app, kind]. Lanes are 0..3 from the top. */
const PROBES: { lane: number; tx: number; ty: number; kind: "review" | "static" | "runtime" | "interaction"; hit?: string }[] = [
  { lane: 0, tx: -170, ty: -70, kind: "review" },
  { lane: 0, tx: 40, ty: -50, kind: "review" },
  { lane: 0, tx: 150, ty: 60, kind: "review" },
  { lane: 1, tx: -190, ty: 10, kind: "static" },
  { lane: 1, tx: 70, ty: 20, kind: "static" },
  { lane: 1, tx: 170, ty: -20, kind: "static" },
  { lane: 1, tx: -60, ty: 70, kind: "static" },
  { lane: 2, tx: 120, ty: -75, kind: "runtime", hit: "search" },
  { lane: 2, tx: 140, ty: -62, kind: "runtime", hit: "search" },
  { lane: 2, tx: -150, ty: 30, kind: "runtime", hit: "login" },
  { lane: 2, tx: -120, ty: 44, kind: "runtime", hit: "login" },
  { lane: 2, tx: 100, ty: 52, kind: "runtime", hit: "api" },
  { lane: 3, tx: -165, ty: 78, kind: "interaction", hit: "login" },
  { lane: 3, tx: 60, ty: 74, kind: "interaction", hit: "api" },
  { lane: 3, tx: -40, ty: -10, kind: "interaction" },
  { lane: 3, tx: 175, ty: 12, kind: "interaction" },
];

const LANES = [
  { k: "review", label: "Code review", n: "×4" },
  { k: "static", label: "Scanners", n: "×26" },
  { k: "runtime", label: "Runtime attacks", n: "×12" },
  { k: "interaction", label: "Interaction tests", n: "×7" },
] as const;

const FILES = [
  { icon: ImageIcon, label: "Screenshot" },
  { icon: Waypoints, label: "HTTP trace" },
  { icon: Terminal, label: "Console log" },
  { icon: FileText, label: "Code path" },
  { icon: Wrench, label: "Fix suggestion" },
];

// below this viewport height the pinned stage and the active step's copy cannot both fit
const SHORT = 560;

export function Pipeline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = <T extends Element = HTMLElement>(sel: string) =>
        root.current!.querySelector<T>(sel)!;
      const qa = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(sel, root.current!);

      const stage = q(".stage");
      const fit = q(".stage-fit");
      const tilt = q(".stage-tilt");
      const world = q(".stage-world");
      const list = q(".pipe-steps");
      const items = qa("[data-step]");

      /* ── always: scale the 720×560 design space to its box ─────────── */
      const fitStage = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const small = window.matchMedia("(max-width: 1023px)").matches;
        // phones get a tighter design box so the scene fills the screen
        const k = small ? Math.min(w / 600, h / 560) : Math.min(w / 720, h / 560);
        gsap.set(fit, { scale: k });
      };
      fitStage();
      const ro = new ResizeObserver(fitStage);
      ro.observe(stage);

      // Reduced motion, or a screen too short for the pinned stage plus its copy (a phone in
      // landscape): show the finished state, every step readable, no scroll-scrubbing
      mm.add(`(prefers-reduced-motion: reduce), (max-height: ${SHORT - 1}px)`, () => {
        gsap.set(qa(".pane"), { xPercent: -50, yPercent: -50, autoAlpha: 1 });
        gsap.set(q(".pane--prod"), { x: 0, y: 40, z: -170, autoAlpha: 0.5 });
        gsap.set(q(".pane--sandbox"), { autoAlpha: 0 });
        gsap.set(q(".pane--agents"), { autoAlpha: 0 });
        gsap.set(q(".pane--findings"), { autoAlpha: 0 });
        gsap.set(q(".pane--report"), { x: 0, y: 0, z: 140 });
        gsap.set(q(".pane--pr"), { x: -240, y: -190, z: 210 });
        gsap.set(q(".pane--comment"), { x: 160, y: 200, z: 210 });
        gsap.set(world, { rotationX: 14, rotationY: -18 });
        gsap.set(qa("[data-probe]"), { autoAlpha: 0 });
        items.forEach((li) => li.setAttribute("data-state", "active"));
        // leaving this layout (a phone rotated back to portrait, motion switched on) must hand the
        // steps back in their opening state, or every body stays expanded inside the pinned stage
        return () => {
          items.forEach((li, i) => li.setAttribute("data-state", i === 0 ? "active" : "todo"));
          list.setAttribute("data-idx", "0");
        };
      });

      // the breakpoint is a condition, so crossing 1023px (rotating a tablet, resizing a window)
      // tears this setup down and rebuilds it with the right offsets, pin length and tilt
      mm.add(
        {
          full: `(min-width: 1024px) and (min-height: ${SHORT}px) and (prefers-reduced-motion: no-preference)`,
          small: `(max-width: 1023px) and (min-height: ${SHORT}px) and (prefers-reduced-motion: no-preference)`,
        },
        (ctx) => {
        const isSmall = !!ctx.conditions?.small;
        const P = gsap.utils.toArray<HTMLElement>(".pane", root.current!);
        gsap.set(P, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

        const prod = q(".pane--prod");
        const sb = q(".pane--sandbox");
        const ag = q(".pane--agents");
        const fd = q(".pane--findings");
        const rp = q(".pane--report");
        const pr = q(".pane--pr");
        const cm = q(".pane--comment");

        const prX = isSmall ? -128 : -240;
        const cmX = isSmall ? 120 : 150;
        gsap.set(prod, { x: 0, y: 44, z: -170 });
        gsap.set(sb, { x: 0, y: 0, z: -170 });
        gsap.set(ag, { x: 0, y: -4, z: 150 });
        gsap.set(fd, { x: 0, y: 0, z: 110 });
        gsap.set(rp, { x: 120, y: 8, z: 100 });
        gsap.set(pr, { x: prX, y: -190, z: 210 });
        gsap.set(cm, { x: cmX, y: 206, z: 210 });
        gsap.set(world, { rotationX: 20, rotationY: -26 });
        gsap.set(qa(".sb-step"), { autoAlpha: 0, x: -10 });
        gsap.set(qa(".app > *"), { autoAlpha: 0 });
        gsap.set(qa(".lane"), { autoAlpha: 0, x: -14 });
        gsap.set(qa("[data-chip]"), { autoAlpha: 0, scale: 0.7 });
        gsap.set(qa(".file"), { autoAlpha: 0, y: 12 });
        gsap.set(qa("[data-probe]"), { autoAlpha: 0 });
        gsap.set(qa("[data-merge]"), { autoAlpha: 0, scale: 0.7 });
        gsap.set(qa("[data-fix]"), { autoAlpha: 0, y: 6 });
        gsap.set(qa(".torn"), { autoAlpha: 0 });
        gsap.set(qa("[data-probe]"), { xPercent: -50, yPercent: -50 });

        // path lengths for the connector draw-on (no plugin needed)
        qa<SVGPathElement>(".conn").forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

        /* ── 1 · trigger ─────────────────────────────────────────────── */
        tl.to(prod, { autoAlpha: 0.55, duration: 0.4 }, 0)
          .fromTo(pr, { autoAlpha: 0, y: -330, z: 380, rotationZ: -10 }, { autoAlpha: 1, y: -190, z: 210, rotationZ: 0, duration: 0.75, ease: "back.out(1.5)" }, 0.08)
          .fromTo(qa(".pr-line"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", stagger: 0.05, duration: 0.3 }, 0.5)
          .fromTo(qa(".pr-ring"), { scale: 0.5, autoAlpha: 0.8 }, { scale: 2.2, autoAlpha: 0, duration: 0.7, ease: "power2.out" }, 0.55);

        /* ── 2 · sandbox ─────────────────────────────────────────────── */
        tl.to(prod, { autoAlpha: 0.32, duration: 0.5 }, 1)
          .to(sb, { autoAlpha: 1, z: -40, duration: 0.9 }, 1)
          .fromTo(qa(".sb-edge"), { scale: 0.96, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7 }, 1.05)
          .to(qa(".sb-step"), { autoAlpha: 1, x: 0, stagger: 0.17, duration: 0.4 }, 1.3)
          .fromTo(qa(".sb-bar i"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 0.7, ease: "power1.inOut" }, 1.3)
          .to(qa(".app > *"), { autoAlpha: 1, stagger: 0.07, duration: 0.45 }, 1.55)
          .to(pr, { z: 170, duration: 0.5 }, 1.1);

        /* ── 3 · agents ──────────────────────────────────────────────── */
        tl.to(ag, { autoAlpha: 1, z: 80, duration: 0.7 }, 2)
          .to(qa(".lane"), { autoAlpha: 1, x: 0, stagger: 0.09, duration: 0.45 }, 2.1)
          .to(qa(".sb-step, .sb-bar"), { autoAlpha: 0.0, duration: 0.3 }, 2.15);

        const probeEls = qa("[data-probe]");
        PROBES.forEach((p, i) => {
          const el = probeEls[i];
          const laneY = -70 + p.lane * 44;
          const startX = 250 - (i % 3) * 14;
          const at = 2.35 + i * 0.045;
          tl.set(el, { x: startX, y: laneY, z: 80 }, at - 0.01)
            .to(el, { autoAlpha: 1, duration: 0.06 }, at)
            .to(el, { x: p.tx, y: p.ty, z: -34, duration: 0.5, ease: "power2.in" }, at)
            .to(el, { autoAlpha: 0, duration: 0.08 }, at + 0.5);
          const rip = qa(".ripple")[i];
          if (rip) {
            tl.fromTo(rip, { autoAlpha: 0.9, scale: 0.2 }, { autoAlpha: 0, scale: 1.5, duration: 0.55, ease: "power2.out" }, at + 0.48);
          }
        });
        // app elements take hits
        tl.to(qa('[data-hit="search"]'), { "--hit": 1, duration: 0.3 }, 2.95)
          .to(qa('[data-hit="login"]'), { "--hit": 1, duration: 0.3 }, 3.05)
          .to(qa('[data-hit="api"]'), { "--hit": 1, duration: 0.3 }, 3.15);

        /* ── 4 · enrich ──────────────────────────────────────────────── */
        tl.to(ag, { autoAlpha: 0, z: 30, duration: 0.45 }, 3.15)
          .to(fd, { autoAlpha: 1, duration: 0.3 }, 3.2)
          .to(qa("[data-chip]"), { autoAlpha: 1, scale: 1, stagger: 0.11, duration: 0.5, ease: "back.out(1.6)" }, 3.3)
          .to(qa(".conn"), { strokeDashoffset: 0, stagger: 0.14, duration: 0.7, ease: "power2.inOut" }, 3.55)
          .to(qa("[data-dup]"), { x: (i: number) => (i === 0 ? 55 : -55), y: (i: number) => (i === 0 ? 16 : -16), duration: 0.6, ease: "power3.inOut" }, 3.75)
          .to(qa("[data-dup='b']"), { autoAlpha: 0, duration: 0.2 }, 4.2)
          .to(qa("[data-merge]"), { autoAlpha: 1, scale: 1, duration: 0.35 }, 4.1)
          .to(qa("[data-fix]"), { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.4 }, 3.95);

        /* ── 5 · report ──────────────────────────────────────────────── */
        tl.to(fd, { autoAlpha: 0, z: 40, duration: 0.5 }, 4.25)
          .to(rp, { autoAlpha: 1, z: 150, x: isSmall ? 0 : 40, duration: 0.7 }, 4.3)
          .to(qa(".file"), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.4 }, 4.5)
          .to(sb, { scaleY: 0.02, autoAlpha: 0, duration: 0.55, ease: "power3.in" }, 4.35)
          .to(ag, { autoAlpha: 0, duration: 0.3 }, 4.3)
          .fromTo(cm, { autoAlpha: 0, y: 260, z: 300 }, { autoAlpha: 1, y: 206, z: 210, duration: 0.7, ease: "back.out(1.3)" }, 4.55)
          .to(pr, { z: 210, duration: 0.4 }, 4.5)
          .fromTo(qa(".torn"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 4.5)
          .to({}, { duration: 0.2 }, 4.9);

        // slow orbit while the story runs
        tl.to(world, { rotationY: -10, rotationX: 10, duration: 5, ease: "none" }, 0);

        const total = tl.duration();
        const rect = () => window.innerHeight;
        let current = -1;
        const moods = [
          { alert: 0, energy: 0.6, portal: 0.45 },
          { alert: 0, energy: 0.55, portal: 0.4 },
          { alert: 0.85, energy: 0.8, portal: 0.35 },
          { alert: 0.35, energy: 0.6, portal: 0.4 },
          { alert: 0, energy: 0.65, portal: 0.6 },
        ];

        const st = ScrollTrigger.create({
          trigger: q(".pipe-pin"),
          start: "top top",
          end: () => `+=${rect() * (isSmall ? 4.2 : 5)}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // pins refresh first so later triggers (nav spy, CTA ink) measure past the pin spacers
          refreshPriority: 1,
          animation: tl,
          onUpdate: (self) => {
            const t = self.progress * total;
            const idx = Math.min(PIPELINE_STEPS.length - 1, Math.floor(t + 0.001));
            const within = Math.min(1, Math.max(0, t - idx));
            list.style.setProperty("--prog", String(within));
            if (idx !== current) {
              current = idx;
              items.forEach((li, i) =>
                li.setAttribute("data-state", i < idx ? "done" : i === idx ? "active" : "todo"),
              );
              list.setAttribute("data-idx", String(idx));
              setMood(moods[idx], 1.2);
            }
          },
        });

        // the chapter opens on a calmer light than the statement ends on, so its heading and lede read
        // over the corridor; scrolling back up restores the statement's final glow
        const head = ScrollTrigger.create({
          trigger: q(".pipe-head"),
          start: "top 88%",
          onEnter: () => setMood(moods[0], 1),
          onLeaveBack: () => setMood({ alert: 0, energy: 1, portal: 0.85 }, 1),
        });

        // pointer parallax on a wrapper so it composes with the scroll orbit
        let off: (() => void) | undefined;
        if (!isSmall && !window.matchMedia("(hover: none)").matches) {
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
            const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
            ry(Math.max(-1, Math.min(1, nx)) * 7);
            rx(Math.max(-1, Math.min(1, ny)) * -5);
          };
          stage.addEventListener("pointermove", move);
          off = () => stage.removeEventListener("pointermove", move);
        }

        return () => {
          off?.();
          head.kill();
          st.kill();
          tl.kill();
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
      <div className="wrap pipe-head">
        <h2 id="pipe-title" className="t-h2" data-split>
          From pull request to proof.
        </h2>
        <p className="t-lede pipe-lede" data-reveal>
          Code review, security testing, and interaction testing: fully automated, fully sandboxed.
        </p>
      </div>

      <div className="pipe-pin">
        <div className="wrap pipe-grid">
          <ol className="pipe-steps" data-idx="0">
            {PIPELINE_STEPS.map((s, i) => (
              <li key={s.id} data-step data-state={i === 0 ? "active" : "todo"} className="pipe-step">
                <span className="pipe-bar" aria-hidden>
                  <i />
                </span>
                <div>
                  <p className="pipe-tag">{s.tag}</p>
                  <h3 className="t-h3 pipe-title">{s.title}</h3>
                  <div className="pipe-body">
                    <p className="t-body">{s.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="stage-col">
            <div className="stage" aria-hidden>
              <div className="stage-fit">
                <div className="stage-tilt">
                  <div className="stage-world">
                    {/* production — never touched */}
                    <div className="pane pane--prod">
                      <div className="pane-title">
                        <Lock size={15} /> Production
                        <span className="pane-sub">untouched</span>
                      </div>
                      <div className="prod-grid" />
                    </div>

                    {/* sandbox */}
                    <div className="pane pane--sandbox">
                      <div className="sb-edge" />
                      <div className="pane-title">
                        <ShieldCheck size={16} /> Sandbox
                        <span className="chip chip--ok">
                          <i /> Isolated from production
                        </span>
                      </div>
                      <div className="sb-steps">
                        {["Clone", "Build", "Deploy"].map((t) => (
                          <div key={t} className="sb-step">
                            <Check size={13} strokeWidth={3} />
                            {t}
                          </div>
                        ))}
                        <div className="sb-bar">
                          <i />
                        </div>
                      </div>
                      <div className="app">
                        <div className="app-top">
                          <b />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="app-login" data-hit="login">
                          <u />
                          <em />
                          <em />
                          <s />
                        </div>
                        <div className="app-search" data-hit="search">
                          <span />
                        </div>
                        <div className="app-table" data-hit="api">
                          {[0, 1, 2, 3].map((r) => (
                            <div key={r}>
                              <span />
                              <span />
                              <span />
                            </div>
                          ))}
                        </div>
                      </div>
                      {PROBES.map((_, i) => (
                        <i key={i} className="ripple" style={{ left: `calc(50% + ${PROBES[i].tx}px)`, top: `calc(50% + ${PROBES[i].ty}px)`, ["--c" as string]: `var(--k-${PROBES[i].kind})` }} />
                      ))}
                    </div>

                    {/* agent lanes */}
                    <div className="pane pane--agents">
                      {LANES.map((l) => (
                        <div key={l.k} className="lane" style={{ ["--c" as string]: `var(--k-${l.k})` }}>
                          <span className="lane-label">{l.label}</span>
                          <span className="lane-n">{l.n}</span>
                          <span className="lane-track" />
                        </div>
                      ))}
                    </div>

                    {/* probes (3D: they fly from the agent plane into the sandbox) */}
                    {PROBES.map((p, i) => (
                      <i key={i} data-probe className="probe" style={{ ["--c" as string]: `var(--k-${p.kind})` }} />
                    ))}

                    {/* findings */}
                    <div className="pane pane--findings">
                      <svg className="conns" viewBox="-270 -170 540 340" fill="none">
                        <path className="conn" d="M -140 8 C -90 -40, 20 -60, 110 -52" />
                        <path className="conn" d="M 110 -52 C 140 -10, 80 40, -10 62" />
                        <path className="conn conn--red" d="M -140 8 C -150 40, -170 60, -150 90" />
                      </svg>
                      <div data-chip className="fchip fchip--crit" style={{ left: "calc(50% + 70px)", top: "calc(50% - 98px)" }}>
                        <i /> SQL injection
                        <span data-fix className="fix">fix</span>
                      </div>
                      <div data-chip className="fchip fchip--high" style={{ left: "calc(50% - 205px)", top: "calc(50% - 6px)" }}>
                        <i /> Broken auth
                        <span data-fix className="fix">fix</span>
                      </div>
                      <div data-chip data-dup="a" className="fchip fchip--med" style={{ left: "calc(50% - 40px)", top: "calc(50% + 62px)" }}>
                        <i /> Missing rate limit
                      </div>
                      <div data-chip data-dup="b" className="fchip fchip--med" style={{ left: "calc(50% + 70px)", top: "calc(50% + 94px)" }}>
                        <i /> Missing rate limit
                      </div>
                      <div data-merge className="merge" style={{ left: "calc(50% + 6px)", top: "calc(50% + 48px)" }}>
                        merged ×2
                      </div>
                    </div>

                    {/* proof bundle */}
                    <div className="pane pane--report">
                      <div className="pane-title">
                        <FileText size={16} /> Proof bundle
                      </div>
                      <ul>
                        {FILES.map((f) => (
                          <li key={f.label} className="file">
                            <f.icon size={16} />
                            {f.label}
                            <Check size={14} strokeWidth={3} className="file-ok" />
                          </li>
                        ))}
                      </ul>
                      <p className="torn">Sandbox torn down</p>
                    </div>

                    {/* the PR */}
                    <div className="pane pane--pr">
                      <i className="pr-ring" />
                      <div className="pane-title">
                        <GitPullRequest size={16} /> Pull request #247
                      </div>
                      <div className="pr-diff">
                        <div className="pr-line pr-line--add" />
                        <div className="pr-line pr-line--add" />
                        <div className="pr-line pr-line--del" />
                        <div className="pr-line" />
                      </div>
                    </div>
                    <div className="pane pane--comment">
                      <div className="comment-head">
                        <span className="comment-av" /> infiniview
                        <span className="pane-sub">commented</span>
                      </div>
                      <p>Findings with proof attached.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="stage-cap t-small">Illustration with sample data.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
