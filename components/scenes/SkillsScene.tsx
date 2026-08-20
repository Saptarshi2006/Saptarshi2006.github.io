"use client";

import CanvasStage from "@/components/fx/CanvasStage";
import Backdrop from "@/components/fx/Backdrop";
import RevealText from "@/components/fx/RevealText";
import { skills } from "@/lib/content";

export default function SkillsScene() {
  return (
    <section
      id="skills"
      data-scene
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-16 overflow-hidden px-6 py-28 sm:px-10"
    >
      <CanvasStage className="absolute inset-0">
        <Backdrop colorA="#1d1d1d" colorB="#1e221e" opacity={0.5} z={-6} />
      </CanvasStage>
      <RevealText
        text="02 — STACK"
        as="span"
        className="text-techno text-xs tracking-[0.35em] text-crimson"
      />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((s, i) => (
          <div
            key={s.name}
            className="group relative flex flex-col justify-between gap-10 bg-ink p-6 transition-colors duration-300 hover:bg-white/[0.03]"
            style={{ transitionDelay: `${(i % 4) * 20}ms` }}
          >
            <span className="text-techno text-[10px] tracking-[0.3em] text-white/30">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="heading-display text-3xl uppercase text-paper transition-colors duration-300 group-hover:text-crimson">
                {s.name}
              </h3>
              <p className="text-body-light mt-2 text-xs text-white/40">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
