"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { identity } from "@/lib/content";

export default function Loader() {
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const setEntered = useUI((s) => s.setEntered);
  const reducedMotion = useUI((s) => s.reducedMotion);

  useEffect(() => {
    const bar = barRef.current;
    const num = numRef.current;
    const root = rootRef.current;
    if (!bar || !num || !root) return;

    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallback);
      setEntered(true);
      if (reducedMotion) {
        setHidden(true);
        return;
      }
      gsap
        .timeline()
        .to(num, { yPercent: -120, opacity: 0, duration: 0.5, ease: "power3.in" }, 0)
        .to(bar.parentElement, { opacity: 0, duration: 0.4 }, 0.05)
        .to(".loader-word", { yPercent: -120, opacity: 0, duration: 0.6, ease: "power3.in", stagger: 0.03 }, 0.08)
        .to(root, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, 0.25);
      // Guaranteed unmount on wall-clock time, so the loader can never trap
      // the user even if requestAnimationFrame is throttled or paused.
      setTimeout(() => setHidden(true), 2900);
    };

    const counter = { v: 0 };
    const tween = gsap.to(counter, {
      v: 100,
      duration: reducedMotion ? 0.01 : 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(counter.v);
        num.textContent = String(v).padStart(3, "0");
        bar.style.transform = `scaleX(${v / 100})`;
      },
      onComplete: finish,
    });

    // Safety net: never leave the user stuck behind the loader, even if
    // requestAnimationFrame is throttled (background tab, low-power mode).
    const fallback = setTimeout(finish, 5000);

    return () => {
      clearTimeout(fallback);
      tween.kill();
    };
  }, [setEntered, reducedMotion]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-10">
        <div className="flex overflow-hidden">
          {identity.monogram.split("").map((c, i) => (
            <span
              key={i}
              className="loader-word heading-display block text-[72px] leading-none text-paper"
              style={{ display: "inline-block", transform: "translateY(0)" }}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="h-px w-64 overflow-hidden bg-white/20">
          <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-white" />
        </div>
        <span ref={numRef} className="text-techno text-xs tracking-[0.3em] text-white/60">
          000
        </span>
      </div>
    </div>
  );
}
