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
      className="relative flex h-[100svh] items-center overflow-hidden bg-ink"
    >
      <div
        data-cs-inner
        className={`grid w-full grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16 ${
          reversed ? "lg:[direction:rtl]" : ""
        }`}
      >
        <div className="relative h-[42svh] lg:h-[70svh]" data-cs-3d>
          <div
            className="absolute inset-0"
            onMouseEnter={() => setCursorVariant("drag")}
            onMouseLeave={() => setCursorVariant("default")}
          >
            {children}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:[direction:ltr]">
          <span className="text-techno text-[11px] tracking-[0.35em] text-white/40">
            CASE STUDY {project.index} — {project.eyebrow}
          </span>
          <h3
            className="heading-display text-[13vw] leading-none sm:text-[8vw]"
            style={{ color: project.accent }}
          >
            {project.title}
          </h3>
          <p className="heading-display text-2xl text-paper">{project.tagline}</p>
          <p className="text-body-light text-sm text-white/60">{project.description}</p>

          <div className="flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <span
                key={t}
                className="border border-white/15 px-3 py-1 text-techno text-[10px] tracking-widest text-white/50"
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
              onMouseLeave={() => setCursorVariant("default")}
              className="text-techno group mt-2 flex w-fit items-center gap-3 text-sm tracking-[0.25em] text-paper transition-colors hover:text-crimson"
            >
              VISIT LIVE SITE
              <span className="transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
