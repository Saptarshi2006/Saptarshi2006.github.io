"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useScene } from "@/context/SceneContext";

export default function Preloader({ onComplete, ready }: { onComplete: () => void; ready: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const { hasEntered } = useScene();

  // tear points for paper split
  const tearPoints = useMemo(() => {
    const pts: [number, number][] = [];
    const segs = 14;
    pts.push([50, 0]);
    for (let i = 1; i < segs; i++) {
      const y = (i / segs) * 100;
      const off = (Math.random() - 0.5) * 7;
      pts.push([50 + off, y]);
    }
    pts.push([50, 100]);
    return pts;
  }, []);

  const svgPath = useMemo(() => tearPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" "), [tearPoints]);
  const leftClip = useMemo(() => {
    let poly = "0% 0%, ";
    tearPoints.forEach((p) => (poly += `${p[0]}% ${p[1]}%, `));
    poly += "0% 100%";
    return `polygon(${poly})`;
  }, [tearPoints]);
  const rightClip = useMemo(() => {
    let poly = "100% 0%, ";
    poly += "100% 100%, ";
    tearPoints.forEach((p) => (poly += `${p[0]}% ${p[1]}%, `));
    // reverse order for right side? keep simple open polygon covering right half
    return `polygon(100% 0%, ${tearPoints.map((p) => `${p[0]}% ${p[1]}%`).join(", ")}, 100% 100%, 100% 0%)`;
  }, [tearPoints]);

  // Unified progress: GSAP fake to 100 + real THREE loader can jump ahead
  useEffect(() => {
    const counter = { v: 0 };
    let raf = 0;

    // GSAP fake progress — always runs to 100, ensures tear even with procedural textures
    const tween = gsap.to(counter, {
      v: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        // only go forward, let real loader override if it's ahead
        setProgress((prev) => Math.max(prev, counter.v));
      },
    });

    // Also track THREE loader — if it reports, jump ahead
    const origProg = THREE.DefaultLoadingManager.onProgress;
    const origLoad = THREE.DefaultLoadingManager.onLoad;
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const pct = (loaded / total) * 100;
        setProgress((prev) => Math.max(prev, pct));
        // if real loader is behind fake, push fake ahead
        if (pct > counter.v) counter.v = pct;
      });
      origProg?.(url, loaded, total);
    };
    THREE.DefaultLoadingManager.onLoad = () => {
      cancelAnimationFrame(raf);
      setProgress(100);
      origLoad?.();
    };

    // Fail-safe: force 100 after 2.8s no matter what (covers the 18% stuck bug)
    const failSafe = setTimeout(() => {
      gsap.killTweensOf(counter);
      setProgress(100);
    }, 2800);

    return () => {
      tween.kill();
      clearTimeout(failSafe);
      cancelAnimationFrame(raf);
      THREE.DefaultLoadingManager.onProgress = origProg;
      THREE.DefaultLoadingManager.onLoad = origLoad;
    };
  }, []);

  // animate tear line dash based on progress
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength?.() ?? 400;
    pathRef.current.style.strokeDasharray = `${len}`;
    pathRef.current.style.strokeDashoffset = `${len - (len * progress) / 100}`;
    if (numRef.current) numRef.current.textContent = `${Math.round(progress).toString().padStart(3, "0")}%`;
  }, [progress]);

  // when ready && progress 100, allow tear open
  useEffect(() => {
    if (progress < 100 || !ready) return;
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => { setHidden(true); onComplete(); }, 300) });
    // pencil scribble sound stub
    tl.to(pathRef.current, { opacity: 0, duration: 0.3 }, 0);
    tl.to(leftRef.current, { xPercent: -102, rotation: -1.5, duration: 1.1, ease: "power4.inOut" }, 0.15);
    tl.to(rightRef.current, { xPercent: 102, rotation: 1.5, duration: 1.1, ease: "power4.inOut" }, 0.15);
    tl.to(containerRef.current, { backgroundColor: "rgba(250,248,243,0)", duration: 0.6 }, 0.4);
    tl.to(numRef.current, { yPercent: -80, opacity: 0, duration: 0.5, ease: "power3.in" }, 0);
    return () => { tl.kill(); };
  }, [progress, ready, onComplete]);

  if (hidden || hasEntered) return null;

  const showEnter = progress >= 100 && ready;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden"
      style={{ background: "#faf8f3" }}
      aria-hidden
    >
      {/* Left paper half */}
      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background: "#faf8f3",
          clipPath: leftClip,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(26,26,26,0.04) 23px)`,
          borderRight: "1px solid rgba(26,26,26,0.06)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.07]" style={{ background: `url(/fx/cell_noise.png)` }} />
        {/* sketched SM monogram left */}
        <div className="absolute left-[32%] top-1/2 -translate-y-1/2 -translate-x-1/2">
          <span className="heading-display text-[72px] leading-none text-ink opacity-15 select-none">S</span>
        </div>
      </div>
      {/* Right paper half */}
      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background: "#faf8f3",
          clipPath: rightClip,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(26,26,26,0.04) 23px)`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.07]" style={{ background: `url(/fx/cell_noise.png)` }} />
        <div className="absolute right-[32%] top-1/2 -translate-y-1/2 translate-x-1/2">
          <span className="heading-display text-[72px] leading-none text-ink opacity-15 select-none">M</span>
        </div>
      </div>

      {/* Tear line SVG */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d={svgPath}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        {/* secondary sketch shadow */}
        <path d={svgPath} fill="none" stroke="rgba(26,26,26,0.18)" strokeWidth="0.9" strokeLinecap="round" opacity={0.4} style={{ transform: "translate(0.35px,0.35px)" }} />
      </svg>

      {/* Center loader */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-techno text-[10px] tracking-[0.4em] text-ink/40">SAPTARSHI — PORTFOLIO</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span ref={numRef} className="text-techno text-sm tracking-[0.3em] text-ink">
              000%
            </span>
            <span className="text-techno text-[9px] tracking-[0.3em] text-ink/50">LOADING SKETCHES</span>
          </div>
          <div className="mt-4 h-px w-56 overflow-hidden bg-ink/10">
            <div className="h-full origin-left bg-ink transition-transform duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>

        <div className="relative mt-2 h-16 w-16">
          {/* ring */}
          <svg width="64" height="64" viewBox="0 0 100 100" className="absolute inset-0 animate-spin" style={{ animationDuration: "10s" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeDasharray="8 12" opacity={0.8} />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#1a1a1a" strokeWidth="0.8" strokeDasharray="4 9" opacity={0.45} style={{ transformOrigin: "50% 50%", animation: "ring-spin-reverse 4s linear infinite" }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[10px] font-bold tracking-widest text-ink">SM</span>
        </div>

        {showEnter && (
          <span className="animate-pulse text-techno text-[10px] tracking-[0.3em] text-ink/60">TEAR TO ENTER →</span>
        )}
      </div>

      <style>{`@keyframes ring-spin-reverse {0%{transform:rotate(360deg)}100%{transform:rotate(0deg)}}`}</style>
    </div>
  );
}
