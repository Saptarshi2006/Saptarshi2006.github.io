"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenis: Lenis | null = null;

export function initLenis(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToSection(target: string) {
  if (!lenis) return;
  const el = document.getElementById(target);
  if (!el) return;
  lenis.scrollTo(el, { offset: 0, duration: 1.4 });
}
