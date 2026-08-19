"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useUI } from "@/lib/store";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const variant = useUI((s) => s.cursorVariant);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const quickX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const quickY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2" });

    const onMove = (e: PointerEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!ring || !dot || !label) return;

    gsap.to(ring, {
      scale: variant === "default" ? 1 : variant === "drag" ? 1.6 : 1.35,
      borderColor: variant === "hover" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
      duration: 0.35,
      ease: "power3.out",
    });
    gsap.to(dot, {
      scale: variant === "default" ? 1 : 0,
      opacity: variant === "default" ? 1 : 0,
      duration: 0.25,
    });
    label.textContent = variant === "drag" ? "DRAG" : variant === "hover" ? "OPEN" : "";
  }, [variant]);

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-only pointer-events-none fixed left-0 top-0 z-[200] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 mix-blend-difference"
        aria-hidden
      >
        <span ref={labelRef} className="text-techno text-[8px] tracking-widest text-white" />
      </div>
      <div
        ref={dotRef}
        className="cursor-only pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
        aria-hidden
      />
    </>
  );
}
