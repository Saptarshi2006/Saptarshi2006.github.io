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

      <div className="flex flex-wrap items-center justify-center gap-4">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`rounded-full border px-5 py-2.5 text-techno text-sm tracking-[0.2em] transition ${
              s.label === "LinkedIn"
                ? "border-[#0a66c2] bg-[#0a66c2] text-white hover:bg-[#084e96]"
                : s.label === "GitHub"
                  ? "border-white/15 bg-white/5 text-white hover:bg-white hover:text-ink"
                  : "border-white/10 text-white/70 hover:border-white/30 hover:text-paper"
            }`}
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
