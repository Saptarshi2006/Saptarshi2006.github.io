"use client";

import { marquee } from "@/lib/content";

export default function MarqueeScene() {
  const items = Array.from({ length: 4 }, () => marquee).flat();

  return (
    <section
      id="marquee"
      data-scene
      className="relative flex h-[45svh] items-center overflow-hidden bg-crimson"
    >
      <div className="pointer-events-none flex w-max animate-marquee items-center whitespace-nowrap">
        {items.map((word, i) => (
          <span key={i} className="flex items-center">
            <span className="heading-display px-6 text-[16vw] leading-none text-paper sm:text-[9vw]">
              {word}
            </span>
            <span className="heading-display text-[16vw] text-ink/40 sm:text-[9vw]">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
