"use client";

import RevealText from "@/components/fx/RevealText";
import { projects } from "@/lib/content";

export default function CaseStudiesCard() {
  return (
    <section
      id="casecard"
      data-scene
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-16 px-6 py-28 sm:px-10"
    >
      <RevealText
        text="Built to ship. Shipped to learn."
        className="heading-display max-w-5xl text-center text-[10vw] leading-[1.0] text-paper sm:text-[7vw] md:text-[5.5vw]"
        stagger={0.02}
      />

      <div className="grid w-full max-w-4xl grid-cols-1 gap-px bg-white/10 sm:grid-cols-3">
        {projects.map((p) => (
          <a
            key={p.id}
            href={p.url || `#${p.id}`}
            target={p.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-8 bg-ink p-6 transition-colors duration-300 hover:bg-white/[0.04]"
          >
            <span className="text-techno text-[10px] tracking-[0.3em] text-white/30">
              {p.index}
            </span>
            <span
              className="heading-display text-3xl uppercase"
              style={{ color: p.accent }}
            >
              {p.title}
            </span>
            <span className="text-body-light text-xs text-white/40">{p.tagline}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
