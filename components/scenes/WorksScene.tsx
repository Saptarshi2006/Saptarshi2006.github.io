"use client";

import CanvasStage from "@/components/fx/CanvasStage";
import Backdrop from "@/components/fx/Backdrop";
import RevealText from "@/components/fx/RevealText";
import { projects } from "@/lib/content";
import { scrollToSection } from "@/lib/smooth";

export default function WorksScene() {
  return (
    <section
      id="works"
      data-scene
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-14 overflow-hidden px-6 py-28 sm:px-10"
    >
      <CanvasStage className="absolute inset-0">
        <Backdrop colorA="#1d1d1d" colorB="#221e1d" opacity={0.45} z={-6} />
      </CanvasStage>
      <RevealText
        text="03 — SELECTED WORK"
        as="span"
        className="text-techno text-xs tracking-[0.35em] text-crimson"
      />

      <div className="flex w-full max-w-5xl flex-col">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => scrollToSection(p.id)}
            className="group flex items-baseline justify-between gap-4 border-b border-white/10 py-8 text-left transition-colors duration-300 hover:border-white/40"
          >
            <span className="text-techno text-xs tracking-[0.3em] text-white/30">
              {p.index}
            </span>
            <span
              className="heading-display text-5xl leading-none transition-transform duration-300 group-hover:translate-x-3 sm:text-7xl"
              style={{ color: p.accent }}
            >
              {p.title}
            </span>
            <span className="hidden text-techno text-[10px] tracking-[0.25em] text-white/40 sm:block">
              {p.eyebrow}
            </span>
            <span className="text-2xl text-white/40 transition-all duration-300 group-hover:translate-x-2 group-hover:text-paper">
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
