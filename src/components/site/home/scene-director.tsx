"use client";

// Decides where the glass block sits and when the scene renders at all.
// The scene is visible behind the hero, the run and the guarantees, and
// again behind the closing section; between them opaque sections cover it
// and the render loop is paused.

import { scene, setSceneActive, IDLE } from "../scene/store";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../motion/gsap";

export function SceneDirector() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" }, (ctx) => {
      const { wide } = ctx.conditions as { wide: boolean };
      gsap.set(scene, wide ? { x: 0.2, y: 0.08, scale: 1 } : { x: 0, y: 0.25, scale: 0.78 });
    });

    const regions = { top: true, close: false };
    const sync = () => setSceneActive(regions.top || regions.close);

    // These are measured after the run's pin (refreshPriority -1), which adds
    // several screens of scroll above them.
    ScrollTrigger.create({
      refreshPriority: -1,
      start: 0,
      endTrigger: "#arsenal",
      end: "top top",
      onToggle: (self) => {
        regions.top = self.isActive;
        sync();
      },
    });

    ScrollTrigger.create({
      refreshPriority: -1,
      trigger: "#closing",
      start: "top bottom",
      end: "max",
      onToggle: (self) => {
        regions.close = self.isActive;
        sync();
      },
      // The block is rebuilt for the closing section while it's offscreen,
      // then seals as the section arrives.
      onEnter: () => {
        const reduced = prefersReducedMotion();
        gsap.killTweensOf(scene);
        gsap.set(scene, {
          ...IDLE,
          x: scene.x,
          y: scene.y,
          scale: scene.scale,
          assemble: reduced ? 1 : 0,
          pointerX: scene.pointerX,
          pointerY: scene.pointerY,
        });
        if (!reduced) gsap.to(scene, { assemble: 1, duration: 2.4, ease: "power3.out", delay: 0.2 });
      },
    });

    return () => mm.revert();
  });

  return null;
}
