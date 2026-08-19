"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { nav } from "@/lib/content";
import { scrollToSection } from "@/lib/smooth";

export default function HeaderMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const active = useUI((s) => s.active);
  const entered = useUI((s) => s.entered);

  useEffect(() => {
    if (!entered) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
    );
  }, [entered]);

  const onHover = (on: boolean) => {
    gsap.to(bgRef.current, {
      scaleX: on ? 1.08 : 1,
      opacity: on ? 0.14 : 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={rootRef}
      className="fixed right-6 top-5 z-[100] opacity-0 mix-blend-difference"
    >
      <div className="relative flex h-10 items-center overflow-hidden rounded-full border border-white/10 bg-ink/60 backdrop-blur-sm">
        <div ref={bgRef} className="absolute inset-0 rounded-full bg-paper" />
        <div className="relative z-10 flex items-center gap-6 px-6">
          {nav.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollToSection(item.target)}
              onMouseEnter={() => onHover(true)}
              onMouseLeave={() => onHover(false)}
              className={`text-techno text-xs tracking-wider transition-opacity duration-300 ${
                active === item.target ? "opacity-100" : "opacity-50 hover:opacity-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
