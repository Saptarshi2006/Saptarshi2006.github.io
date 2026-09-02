"use client";

import { useEffect, useState } from "react";
import { useScene } from "@/context/SceneContext";
import { identity, socials, projects } from "@/lib/content";

export function NavigationUI() {
  const { hasEntered, currentRoom } = useScene();
  if (!hasEntered) return null;

  const mapLabel = currentRoom ? currentRoom.toUpperCase() : "CORRIDOR";

  return (
    <div className="pointer-events-none fixed left-6 top-6 z-30 flex items-center gap-3">
      <div className="rounded-full border border-ink/10 bg-paper px-4 py-2 text-techno text-[10px] tracking-[0.3em] text-ink">
        SM • {mapLabel}
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[10px] tracking-widest text-ink/40">
        <span className="h-px w-6 bg-ink/15" />
        <span>SAPTARSHI 2026</span>
      </div>
    </div>
  );
}

export function GlobalOverlay() {
  const { hasEntered, isInRoom, currentRoom } = useScene();
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4200);
    return () => clearTimeout(t);
  }, [hasEntered, currentRoom]);

  if (!hasEntered) return null;

  return (
    <>
      {/* top right mini map */}
      <div className="fixed right-6 top-6 z-30 hidden md:block">
        <div className="rounded-2xl border border-ink/10 bg-paper/90 p-3 backdrop-blur shadow-sm">
          <div className="text-techno text-[9px] tracking-[0.3em] text-ink/50">MAP</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { id: "gallery", label: "GALLERY", sub: "Work" },
              { id: "studio", label: "STUDIO", sub: "Skills" },
              { id: "about", label: "ABOUT", sub: "Story" },
              { id: "contact", label: "CONTACT", sub: "Talk" },
            ].map((r) => (
              <div
                key={r.id}
                className={`rounded-lg border px-3 py-2 text-center transition ${
                  currentRoom === r.id ? "bg-ink text-paper border-ink" : "bg-paper border-ink/10 text-ink/70"
                }`}
              >
                <div className="text-techno text-[10px] tracking-[0.2em]">{r.label}</div>
                <div className="text-[9px] opacity-60">{r.sub}</div>
              </div>
            ))}
          </div>
          {!isInRoom && <div className="mt-2 text-center text-[9px] tracking-[0.2em] text-ink/40">● CORRIDOR</div>}
        </div>
      </div>

      {/* achievement hint */}
      {showHint && !isInRoom && (
        <div className="pointer-events-none fixed left-1/2 top-[68%] z-30 -translate-x-1/2 rounded-full border border-ink/10 bg-paper px-5 py-3 text-center shadow-lg">
          <div className="text-techno text-[10px] tracking-[0.3em] text-ink">SCROLL TO EXPLORE</div>
          <div className="text-[11px] text-ink/50">Hover doors to paint them — click to enter</div>
        </div>
      )}

      {/* footer always */}
      <div className="fixed bottom-4 right-6 z-30 hidden sm:flex items-center gap-4 text-[10px] tracking-[0.2em] text-ink/40">
        <span>© {new Date().getFullYear()} {identity.name}</span>
        <span className="h-3 w-px bg-ink/15" />
        <div className="flex gap-3">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-ink transition">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export function RoomOverlay({ scrollOffset }: { scrollOffset?: number }) {
  const { isInRoom, currentRoom } = useScene();
  if (!isInRoom) return null;

  if (currentRoom === "gallery") {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center">
        <div className="rounded-full bg-paper border border-ink/10 px-5 py-2.5 text-techno text-[10px] tracking-[0.25em] text-ink shadow-lg">
          DRAG / SCROLL CARDS ← → • CLICK TO OPEN LIVE SITE
        </div>
      </div>
    );
  }
  if (currentRoom === "studio") {
    return (
      <div className="pointer-events-none fixed left-6 top-1/2 z-30 -translate-y-1/2 hidden lg:block">
        <div className="rounded-2xl bg-paper border border-ink/10 p-4 shadow-lg max-w-[220px]">
          <div className="text-techno text-[10px] tracking-[0.3em] text-ink">STUDIO</div>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">Floating monitors — each one a tech I ship with. Hover to paint, scroll to browse infinite stack.</p>
        </div>
      </div>
    );
  }
  if (currentRoom === "about") {
    return (
      <div className="pointer-events-none fixed left-1/2 top-10 z-30 -translate-x-1/2 rounded-full bg-paper border border-ink/10 px-5 py-2.5 shadow-lg">
        <span className="text-techno text-[10px] tracking-[0.3em] text-ink">FLY WITH SCROLL — YOUR STORY AS A FLIGHT PATH ✈︎</span>
      </div>
    );
  }
  if (currentRoom === "contact") {
    return (
      <div className="pointer-events-none fixed left-1/2 bottom-[88px] z-30 -translate-x-1/2 text-center">
        <div className="text-techno text-xs tracking-[0.3em] text-ink">{identity.email}</div>
        <div className="text-[11px] tracking-[0.2em] text-ink/50">CLICK A BARREL TO CONNECT</div>
      </div>
    );
  }
  return null;
}
