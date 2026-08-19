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
        <div className="heading-display text-5xl">SM</div>
        <nav className="flex flex-col gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-techno text-sm tracking-wide transition-colors duration-200 hover:text-crimson"
            >
              {s.label}
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
