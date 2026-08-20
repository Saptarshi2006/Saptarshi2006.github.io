"use client";

import CanvasStage from "@/components/fx/CanvasStage";
import Backdrop from "@/components/fx/Backdrop";
import RevealText from "@/components/fx/RevealText";

export default function AboutScene() {
  return (
    <section
      id="about"
      data-scene
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-14 overflow-hidden px-6 py-28 sm:px-10"
    >
      <CanvasStage className="absolute inset-0">
        <Backdrop colorA="#1d1d1d" colorB="#26231d" opacity={0.55} z={-6} />
      </CanvasStage>
      <RevealText
        text="01 — ABOUT"
        as="span"
        className="relative z-10 text-techno text-xs tracking-[0.35em] text-crimson"
      />

      <RevealText
        text="I build AI-native products from kernel to UI."
        className="heading-display max-w-5xl text-center text-[9vw] leading-[1.02] text-paper sm:text-[6vw] md:text-[4.5vw]"
        stagger={0.02}
      />

      <RevealText
        text="I'm a full-stack engineer from Kolkata who ships end-to-end systems — Rust services, distributed backends, realtime WebSockets, and the interfaces that make them feel inevitable. Everything I build goes live; everything I build teaches me something."
        className="text-body-light max-w-xl text-center text-base text-white/60"
        stagger={0.008}
        as="p"
      />

      <div className="flex flex-wrap items-center justify-center gap-10">
        {[
          { n: "03", l: "SHIPPED PRODUCTS" },
          { n: "6+", l: "LANGUAGES IN PRODUCTION" },
          { n: "∞", l: "CURIOSITY" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="heading-display text-5xl text-paper">{s.n}</span>
            <span className="text-techno text-[10px] tracking-[0.25em] text-white/40">
              {s.l}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
