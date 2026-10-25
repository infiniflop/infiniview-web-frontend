"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/site/gsap";
import { scene } from "@/lib/site/scene";
import { FRAG, VERT } from "@/components/site/corridor-shader";

/**
 * Full-bleed WebGL background. One fullscreen triangle, one fragment shader,
 * driven by the shared GSAP ticker so it never fights the scroll engine.
 * Resolution is scaled adaptively: the scene is soft light behind glass, so we
 * trade pixels for a steady frame rate before we ever trade motion.
 */
export function Corridor() {
  const hostRef = useRef<HTMLDivElement>(null);
  // bumped to rebuild the canvas (and a fresh GL context) after a lost context
  const [generation, setGeneration] = useState(0);
  const retries = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per mount. A released WebGL context can never be reused, so
    // the canvas has to live exactly as long as this effect run (StrictMode
    // remounts and route changes included).
    const canvas = document.createElement("canvas");
    canvas.className = "corridor";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const cleanups: Array<() => void> = [() => canvas.remove()];
    const dispose = () => {
      for (const fn of cleanups.reverse()) {
        try {
          fn();
        } catch {
          /* context may already be gone */
        }
      }
    };

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return dispose; // the CSS backdrop underneath carries the page

    cleanups.push(() => gl.getExtension("WEBGL_lose_context")?.loseContext());

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      cleanups.push(() => gl.deleteShader(sh));
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[corridor] shader error", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return dispose;

    const prog = gl.createProgram()!;
    cleanups.push(() => gl.deleteProgram(prog));
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[corridor] link error", gl.getProgramInfoLog(prog));
      return dispose;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    cleanups.push(() => gl.deleteBuffer(buf));
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      depth: gl.getUniformLocation(prog, "uDepth"),
      ptr: gl.getUniformLocation(prog, "uPtr"),
      vel: gl.getUniformLocation(prog, "uVel"),
      mood: gl.getUniformLocation(prog, "uMood"),
      vp: gl.getUniformLocation(prog, "uVP"),
      still: gl.getUniformLocation(prog, "uStill"),
    };

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mqReduce.matches;

    // adaptive resolution
    const maxScale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.72;
    let scale = window.innerWidth < 760 ? maxScale * 0.8 : maxScale;
    const minScale = 0.34;
    let frameCount = 0;
    let slow = 0;
    let ema = 16; // smoothed frame time (ms)
    let probe: { prevScale: number; dt: number; left: number } | null = null;
    let locked = false; // frame time is not GPU-bound (capped refresh, busy main thread): stop shedding pixels
    let last = performance.now();
    let sizedW = 0;
    let sizedH = 0;

    const applySize = () => {
      const w = Math.max(2, Math.floor(window.innerWidth * scale));
      const h = Math.max(2, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      sizedW = window.innerWidth;
      sizedH = window.innerHeight;
    };
    applySize();

    const t0 = performance.now();
    let lostContext = false;

    const render = () => {
      if (lostContext) return;
      // nothing to see: the mobile menu or the full-screen finale covers the canvas
      if (scene.occluded || document.documentElement.dataset.menuOpen === "true") {
        last = performance.now();
        return;
      }
      const now = performance.now();
      const t = (now - t0) / 1000;
      const aspect = window.innerWidth / window.innerHeight;

      // vanishing point: right of centre on wide screens, high centre on phones
      const vpx = aspect > 1.15 ? 0.17 * Math.min(aspect, 2) : 0;
      const vpy = aspect > 1.15 ? 0.015 : 0.1;

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, reduced ? 4.2 : t);
      gl.uniform1f(
        U.depth,
        reduced ? 0.35 : scene.depth + scene.intro + t * 0.045,
      );
      gl.uniform2f(U.ptr, scene.px, scene.py);
      gl.uniform1f(U.vel, scene.velocity);
      // Stacked layouts (phones, portrait tablets) put the copy right over the vanishing point, so
      // the portal is a soft glow there; the finale's peak (> 0.8) still comes through in full.
      const p = scene.mood.portal;
      const portal = aspect > 1.15 ? p : p * 0.5 + Math.max(0, p - 0.8);
      gl.uniform4f(
        U.mood,
        scene.mood.alert,
        scene.mood.energy,
        portal,
        scene.mood.width,
      );
      gl.uniform2f(U.vp, vpx, vpy);
      gl.uniform1f(U.still, reduced ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // frame-time governor: shed pixels if we are consistently slow — but verify it helps. If a
      // lower resolution does not speed frames up, the limit is elsewhere (a capped refresh rate
      // such as Low Power Mode, or the main thread), so restore quality and stop trying.
      const dt = now - last;
      last = now;
      frameCount++;
      ema += (Math.min(dt, 100) - ema) * 0.1;
      if (frameCount > 40 && !reduced && !locked) {
        if (probe) {
          if (--probe.left <= 0) {
            if (ema > probe.dt * 0.88) {
              scale = probe.prevScale;
              applySize();
              locked = true;
            }
            probe = null;
            slow = 0;
          }
        } else {
          if (dt > 24) slow++;
          else slow = Math.max(0, slow - 1);
          if (slow > 18) {
            if (scale > minScale) {
              probe = { prevScale: scale, dt: ema, left: 40 };
              scale = Math.max(minScale, scale * 0.82);
              applySize();
              slow = 0;
            } else if (document.documentElement.dataset.perf !== "low") {
              // pixels are already minimal and frames are still slow: shed the glass blur too
              document.documentElement.dataset.perf = "low";
              slow = 0;
            }
          }
        }
      }
      if (frameCount > 120) retries.current = 0; // a healthy context: forgive earlier losses
    };

    let tick: (() => void) | null = null;
    const start = () => {
      if (tick) return;
      tick = () => render();
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      tick = null;
    };

    const apply = () => {
      reduced = mqReduce.matches;
      if (reduced) {
        stop();
        render();
      } else {
        start();
      }
    };
    apply();
    mqReduce.addEventListener("change", apply);

    // Debounced; and a height-only change of under 20% (the mobile URL bar collapsing while you
    // scroll) is ignored so the drawing buffer is not reallocated mid-scroll. The corridor is soft
    // light, so a slightly stretched buffer is invisible.
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const widthChanged = window.innerWidth !== sizedW;
        const heightJump = Math.abs(window.innerHeight - sizedH) > sizedH * 0.2;
        if (widthChanged || heightJump) {
          applySize();
          if (reduced) render();
        }
      }, 140);
    };
    window.addEventListener("resize", onResize);

    // A lost context is not restored in place: the canvas is rebuilt from scratch (a fresh
    // context), a few times at most, and the CSS backdrop underneath carries the page meanwhile.
    let rebuildTimer: number | undefined;
    const onLost = () => {
      lostContext = true;
      stop();
      canvas.style.opacity = "0";
      if (retries.current < 3) {
        retries.current += 1;
        rebuildTimer = window.setTimeout(() => setGeneration((g) => g + 1), 400);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);

    cleanups.push(() => {
      stop();
      window.clearTimeout(resizeTimer);
      window.clearTimeout(rebuildTimer);
      mqReduce.removeEventListener("change", apply);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
    });
    return dispose;
  }, [generation]);

  return (
    <>
      <div className="corridor-fallback" aria-hidden />
      <div ref={hostRef} className="corridor-host" aria-hidden />
    </>
  );
}
