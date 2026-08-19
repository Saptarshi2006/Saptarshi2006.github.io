"use client";

import RevealText from "@/components/fx/RevealText";
import { identity, socials } from "@/lib/content";

export default function ContactScene() {
  return (
    <section
      id="contact"
      data-scene
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-16 px-6 py-28 text-center sm:px-10"
    >
      <RevealText
        text="04 — GET IN TOUCH"
        as="span"
        className="text-techno text-xs tracking-[0.35em] text-crimson"
      />

      <RevealText
        text="Let's build."
        className="heading-display text-[15vw] leading-[0.95] text-paper sm:text-[10vw]"
        stagger={0.03}
      />

      <a
        href={`mailto:${identity.email}`}
        className="text-techno group flex flex-col items-center gap-4 text-lg tracking-[0.2em] text-paper transition-colors hover:text-crimson"
      >
        <span className="underline-link text-xl">{identity.email}</span>
        <span className="text-xs text-white/40">OPEN TO INTERNSHIPS, COLLABS & COFFEE</span>
      </a>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="underline-link text-techno text-sm tracking-[0.25em] text-white/70 transition-colors hover:text-paper"
          >
            {s.label}
          </a>
        ))}
      </div>

      <p className="text-body-light text-xs text-white/30">
        {identity.location} · GMT+5:30 · Always shipping
      </p>
    </section>
  );
}
