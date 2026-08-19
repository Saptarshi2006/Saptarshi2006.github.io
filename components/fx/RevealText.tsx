"use client";

import { useEffect, useRef, createElement } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useUI } from "@/lib/store";

type RevealTextProps = {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  trigger?: string | Element;
  start?: string;
  stagger?: number;
  duration?: number;
  scrub?: boolean;
  delay?: number;
  once?: boolean;
};

export default function RevealText({
  text,
  as: Tag = "h2",
  className,
  trigger,
  start = "top 88%",
  stagger = 0.035,
  duration = 1,
  scrub = false,
  delay = 0,
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useUI((s) => s.reducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) return;

    const split = new SplitText(el, {
      type: "chars",
      charsClass: "reveal-char",
      whitespace: "normal",
    });

    gsap.set(split.chars, { yPercent: 130, opacity: 0 });

    const triggerEl = trigger
      ? (typeof trigger === "string" ? document.querySelector(trigger) : trigger)
      : el;

    const config: gsap.TweenVars = {
      yPercent: 0,
      opacity: 1,
      duration,
      ease: "power4.out",
      stagger,
      delay,
      scrollTrigger: {
        trigger: triggerEl || el,
        start,
        toggleActions: once
          ? "play none none none"
          : "play none none reverse",
        scrub,
      },
    };

    const tween = gsap.to(split.chars, config);

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger, start, once, reducedMotion]);

  const Comp = Tag as React.ElementType;
  return createElement(
    Comp,
    {
      ref: ref as React.Ref<HTMLElement>,
      className,
      "aria-label": text,
    },
    text
  );
}
