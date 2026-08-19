"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { identity } from "@/lib/content";
import { scrollToSection } from "@/lib/smooth";
import CanvasStage from "@/components/fx/CanvasStage";
import Hero3D from "@/components/three/Hero3D";

export default function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const entered = useUI((s) => s.entered);
  const reducedMotion = useUI((s) => s.reducedMotion);
  const setCursorVariant = useUI((s) => s.setCursorVariant);

  useEffect(() => {
    if (!entered) return;
    const root = rootRef.current;
    if (!root) return;

    if (reducedMotion) {
      gsap.set(".hero-eyebrow, .hero-scroll, .hero-char", { opacity: 1, yPercent: 0 });
      return;
    }

    const lines = root.querySelectorAll<HTMLElement>(".hero-line");
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ delay: 0.2 });
      lines.forEach((line) => {
        const split = new SplitText(line, { type: "chars", charsClass: "hero-char" });
        gsap.set(split.chars, { yPercent: 130, opacity: 0 });
        timeline.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.04,
          ease: "power4.out",
        });
      });
      timeline
        .fromTo(
          ".hero-eyebrow",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.2
        )
        .fromTo(
          ".hero-scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          1
        );
    }, root);

    return () => ctx.revert();
  }, [entered, reducedMotion]);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative flex h-[100svh] items-center justify-center overflow-hidden"
    >
      <CanvasStage className="absolute inset-0 z-0">
        <Hero3D />
      </CanvasStage>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="hero-eyebrow text-techno mb-6 text-xs tracking-[0.35em] text-white/50">
          {identity.role} · {identity.location}
        </div>
        <h1 className="heading-display text-[13vw] leading-[0.95] text-paper sm:text-[11vw] md:text-[9vw]">
          <span className="hero-line block">Saptarshi</span>
          <span className="hero-line block text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.6)" }}>
            Mukherjee
          </span>
        </h1>
        <div className="hero-scroll mt-14 flex flex-col items-center gap-3 opacity-0">
          <span className="text-techno text-[10px] tracking-[0.3em] text-white/40">SCROLL</span>
          <span className="block h-12 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>

      <button
        className="absolute bottom-8 left-6 text-techno text-xs tracking-[0.25em] text-white/60 transition-colors hover:text-crimson z-10"
        onMouseEnter={() => setCursorVariant("hover")}
        onMouseLeave={() => setCursorVariant("default")}
        onClick={() => scrollToSection("about")}
      >
        WORK
      </button>
    </section>
  );
}
