"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Lenis drives the page scroll; GSAP's ticker drives Lenis so ScrollTrigger
// and the smooth scroll share one clock. Lenis honours reduced motion itself
// (lerp becomes 1), and touch devices keep native scrolling.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () =>
      document.documentElement.classList.toggle("reduce-motion", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, []);

  // New route: land at the top without an inherited glide.
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { immediate: true, offset: -80 });
        return;
      }
    }
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.11,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -80 },
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
