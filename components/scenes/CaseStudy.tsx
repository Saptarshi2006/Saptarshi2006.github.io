"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import type { Project } from "@/lib/content";

export default function CaseStudy({
  project,
  id,
  children,
  reversed = false,
}: {
  project: Project;
  id: string;
  children: React.ReactNode;
  reversed?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const setCursorVariant = useUI((s) => s.setCursorVariant);
  const reducedMotion = useUI((s) => s.reducedMotion);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-cs-inner]",
        { yPercent: 10, opacity: 0.3 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=70%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        }
      );

      gsap.fromTo(
        "[data-cs-3d]",
        { y: 60, scale: 0.94 },
        {
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=70%",
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden bg-ink"
      onMouseEnter={() => setCursorVariant("drag")}
      onMouseLeave={() => setCursorVariant("default")}
    >
      <div data-cs-3d className="absolute inset-0">
        {children}
      </div>

      <div
        data-cs-inner
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      >
        <span className="text-techno text-[11px] tracking-[0.35em] text-white/40">
          CASE STUDY {project.index} — {project.eyebrow}
        </span>
        <h3
          className="heading-display mt-4 text-[16vw] leading-none sm:text-[10vw]"
          style={{ color: project.accent, textShadow: "0 8px 40px rgba(0,0,0,.7)" }}
        >
          {project.title}
        </h3>
        <p className="heading-display mt-3 max-w-xl text-xl text-paper drop-shadow-[0_4px_20px_rgba(0,0,0,.8)] sm:text-2xl">
          {project.tagline}
        </p>
        <p className="text-body-light mt-3 max-w-lg text-sm text-white/70">
          {project.description}
        </p>

        <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-2">
          {project.stack.map((t) => (
            <span
              key={t}
              className="border border-white/20 bg-ink/20 px-3 py-1 text-techno text-[10px] tracking-widest text-white/70 backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setCursorVariant("hover")}
            onMouseLeave={() => setCursorVariant("drag")}
            className="pointer-events-auto text-techno group mt-6 flex w-fit items-center gap-3 border border-white/20 bg-paper px-6 py-3 text-sm tracking-[0.25em] text-ink transition-colors hover:bg-crimson hover:text-paper"
          >
            VISIT LIVE SITE
            <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
          </a>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/35" />
    </section>
  );
}
