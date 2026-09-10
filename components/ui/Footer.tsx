"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { socials, identity } from "@/lib/content";

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 90%" },
      }
    );
  }, []);

  return (
    <footer
      ref={rootRef}
      className="relative z-10 flex flex-col gap-[120px] px-6 pb-10 pt-16 text-paper sm:px-10"
    >
      <div className="flex flex-col items-start justify-between gap-12 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-4">
          <div className="heading-display text-5xl">SM</div>
          <p className="text-body-light max-w-sm text-sm text-white/50">
            Full-Stack Engineer — Rust, TypeScript, WebGL. Building AI-native products at Kolkata. Open to internships & collaborations.
          </p>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0a66c2] px-5 py-2 text-techno text-xs tracking-widest text-white transition hover:bg-[#084e96]"
          >
            ↗ LinkedIn — Let’s connect
          </a>
        </div>
        <nav className="flex flex-col gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`text-techno text-sm tracking-wide transition-colors duration-200 hover:text-crimson ${s.label === "LinkedIn" ? "text-[#0a66c2] !opacity-100" : ""}`}
            >
              {s.label} →
            </a>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2 border-t border-white/10 pt-8 text-xs text-white/40">
        <div className="flex flex-wrap justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {identity.name}</span>
          <span>{identity.location}</span>
          <a href={`mailto:${identity.email}`} className="underline-link">
            {identity.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
