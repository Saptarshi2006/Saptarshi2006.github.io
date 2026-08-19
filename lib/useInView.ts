"use client";

import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {
    rootMargin: "15% 0px 15% 0px",
    threshold: 0.15,
  }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
