"use client";

// The fixed WebGL layer behind the home page, loaded once the page is idle.
// Without WebGL, a still of the same scene stands in. Opaque sections simply
// cover it, and while they do the render loop is paused (setSceneActive).

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { scene } from "../scene/store";
import { gsap, prefersReducedMotion } from "../motion/gsap";

const SandboxScene = dynamic(() => import("../scene/sandbox-scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneLayer() {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasWebGL()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check
      setFallback(true);
      return;
    }
    // The block opens as scattered voxels and seals itself on arrival.
    if (!prefersReducedMotion()) scene.assemble = 0;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setMount(true), { timeout: 600 })
      : window.setTimeout(() => setMount(true), 200);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) {
      scene.assemble = 1;
      return;
    }
    const tw = gsap.to(scene, { assemble: 1, duration: 2.2, ease: "power3.out", delay: 0.1 });
    return () => {
      tw.kill();
    };
  }, [ready]);

  return (
    <div ref={wrap} className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* Without WebGL, a still of the same scene stands in. */}
      {fallback && (
        <div
          className="absolute inset-0 bg-void bg-cover bg-no-repeat [background-position:72%_42%] max-md:[background-position:50%_18%] max-md:[background-size:auto_62%]"
          style={{ backgroundImage: "url(/scene/poster.jpg)" }}
        />
      )}
      {mount && (
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
          <SandboxScene onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
