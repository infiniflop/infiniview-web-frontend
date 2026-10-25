"use client";

import { useEffect, useRef } from "react";
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
    let last = performance.now();

    const resize = () => {
      const w = Math.max(2, Math.floor(window.innerWidth * scale));
      const h = Math.max(2, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    resize();

    const t0 = performance.now();
    let lostContext = false;

    const render = () => {
      if (lostContext) return;
      // the mobile menu covers the page at ~94% opacity: no need to burn frames under it
      if (document.documentElement.dataset.menuOpen === "true") return;
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
      gl.uniform4f(
        U.mood,
        scene.mood.alert,
        scene.mood.energy,
        scene.mood.portal,
        scene.mood.width,
      );
      gl.uniform2f(U.vp, vpx, vpy);
      gl.uniform1f(U.still, reduced ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // frame-time governor: shed pixels if we are consistently slow
      const dt = now - last;
      last = now;
      frameCount++;
      if (frameCount > 40 && !reduced) {
        if (dt > 24) slow++;
        else slow = Math.max(0, slow - 1);
        if (slow > 18) {
          if (scale > minScale) {
            scale = Math.max(minScale, scale * 0.82);
            slow = 0;
            resize();
          } else if (document.documentElement.dataset.perf !== "low") {
            // pixels are already minimal: shed the blur on glass as well
            document.documentElement.dataset.perf = "low";
            slow = 0;
          }
        }
      }
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

    const onResize = () => {
      resize();
      if (reduced) render();
    };
    window.addEventListener("resize", onResize);

    const onLost = (e: Event) => {
      e.preventDefault();
      lostContext = true;
      stop();
      canvas.style.opacity = "0"; // fall back to the CSS backdrop underneath
    };
    canvas.addEventListener("webglcontextlost", onLost);

    cleanups.push(() => {
      stop();
      mqReduce.removeEventListener("change", apply);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
    });
    return dispose;
  }, []);

  return (
    <>
      <div className="corridor-fallback" aria-hidden />
      <div ref={hostRef} className="corridor-host" aria-hidden />
    </>
  );
}
