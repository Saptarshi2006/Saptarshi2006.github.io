"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useScene } from "@/context/SceneContext";
import { identity, socials } from "@/lib/content";
import { depthStore, INITIAL_DEPTH } from "@/lib/depthStore";

const ROOM_INDEX = [
  { id: "gallery", num: "01", label: "GALLERY" },
  { id: "studio", num: "02", label: "STUDIO" },
  { id: "about", num: "03", label: "ABOUT" },
  { id: "contact", num: "04", label: "CONTACT" },
] as const;

const SOCIAL_SHORT: Record<string, string> = {
  GitHub: "GH",
  LinkedIn: "IN",
  "X (Twitter)": "X",
  Instagram: "IG",
  YouTube: "YT",
  Email: "EM",
};

export function EntranceOverlay() {
  const { hasEntered } = useScene();
  if (hasEntered) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-end pb-[10vh] text-center">
      <h1 className="heading-display text-5xl leading-none tracking-[0.05em] text-ink sm:text-6xl md:text-7xl">
        {identity.name}
      </h1>
      <div className="mt-5 h-px w-24 bg-ink/20" />
      <p className="mt-5 text-techno text-[10px] tracking-[0.55em] text-ink/45">{identity.role}</p>
      <p className="mt-1.5 text-techno text-[9px] tracking-[0.4em] text-ink/25">{identity.location}</p>
      <p className="hud-pulse mt-12 text-techno text-[10px] tracking-[0.6em] text-ink/55">
        CLICK A DOOR TO ENTER
      </p>
    </div>
  );
}

export function NavigationUI() {
  const { hasEntered, isInRoom } = useScene();
  const next = useSyncExternalStore(
    depthStore.subscribe,
    depthStore.get,
    () => INITIAL_DEPTH
  );
  if (!hasEntered) return null;

  return (
    <>
      {/* wordmark — bare, top-left */}
      <div className="pointer-events-none fixed left-6 top-5 z-30">
        <div className="heading-display text-[15px] tracking-[0.35em] text-ink">SAPTARSHI</div>
        <div className="mt-1 text-techno text-[8px] tracking-[0.45em] text-ink/35">MUKHERJEE</div>
      </div>

      {/* next-door readout — bare, bottom-left (corridor only) */}
      {!isInRoom && (
        <div className="pointer-events-none fixed bottom-6 left-6 z-30">
          <div className="mb-2 h-px w-8 bg-ink/15" />
          <div
            key={`${next.next}-${next.dist}`}
            className="depth-blip whitespace-nowrap text-techno text-[10px] tracking-[0.4em] text-ink/55 tabular-nums"
          >
            NEXT <span className="text-ink/25">→</span> {next.next} <span className="text-ink/25">·</span> {next.dist}M
          </div>
        </div>
      )}
    </>
  );
}

export function GlobalOverlay() {
  const { hasEntered, isInRoom, currentRoom, enterRoom } = useScene();
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4600);
    return () => clearTimeout(t);
  }, [hasEntered, currentRoom]);

  if (!hasEntered) return null;

  return (
    <>
      {/* room index — bare vertical list, top-right */}
      <div className="pointer-events-none fixed right-6 top-5 z-30 hidden sm:block">
        <div className="flex flex-col items-end gap-1.5">
          {ROOM_INDEX.map((r) => {
            const active = currentRoom === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  if (!isInRoom) enterRoom(r.id);
                }}
                className={`pointer-events-auto flex items-center gap-2 text-techno text-[9px] tracking-[0.4em] transition-colors ${
                  active ? "text-ink" : "text-ink/25 hover:text-ink/60"
                }`}
              >
                <span className="tabular-nums">{r.num}</span>
                <span>{r.label}</span>
                <span className={`h-px transition-all ${active ? "w-5 bg-ink/60" : "w-2 bg-ink/15"}`} />
              </button>
            );
          })}
          {!isInRoom && (
            <div className="mt-2 text-techno text-[8px] tracking-[0.4em] text-ink/25">CORRIDOR</div>
          )}
        </div>
      </div>

      {/* explore hint — bare centered type with flanking rules */}
      {showHint && !isInRoom && (
        <div className="pointer-events-none fixed inset-x-0 top-[66%] z-30 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-ink/15" />
            <span className="text-techno text-[10px] tracking-[0.6em] text-ink/50">SCROLL TO EXPLORE</span>
            <span className="h-px w-10 bg-ink/15" />
          </div>
          <span className="text-techno text-[8px] tracking-[0.4em] text-ink/25">
            HOVER DOORS TO PAINT — CLICK TO ENTER
          </span>
        </div>
      )}

      {/* footer — bare slash-separated links, bottom-right */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-30 flex items-center gap-3">
        <span className="text-techno text-[8px] tracking-[0.4em] text-ink/25">
          © {new Date().getFullYear()}
        </span>
        <span className="h-3 w-px bg-ink/10" />
        <div className="flex items-center gap-2">
          {socials.map((s, i) => (
            <span key={s.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink/15 text-[8px]">/</span>}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-techno text-[8px] tracking-[0.3em] text-ink/35 transition-colors hover:text-ink"
              >
                {SOCIAL_SHORT[s.label] ?? s.label.toUpperCase()}
              </a>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function RoomOverlay() {
  const { isInRoom, currentRoom } = useScene();
  if (!isInRoom || !currentRoom) return null;

  const meta = ROOM_INDEX.find((r) => r.id === currentRoom);

  const hint = (text: string, sub?: string) => (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-30 flex flex-col items-center gap-2">
      <span className="text-techno text-[9px] tracking-[0.5em] text-ink/40">{text}</span>
      {sub && <span className="text-techno text-[8px] tracking-[0.35em] text-ink/20">{sub}</span>}
    </div>
  );

  return (
    <>
      {/* room title — big bare display type */}
      <div className="pointer-events-none fixed left-1/2 top-[14%] z-30 -translate-x-1/2">
        <div key={currentRoom} className="room-title-card text-center">
          {meta && (
            <div className="mb-3 text-techno text-[9px] tracking-[0.6em] text-ink/30">
              {meta.num} <span className="text-ink/15">/</span> {meta.label}
            </div>
          )}
          <div className="heading-display text-7xl leading-none tracking-[0.06em] text-ink md:text-8xl">
            {currentRoom.toUpperCase()}
          </div>
        </div>
      </div>

      {currentRoom === "gallery" && hint("DRAG / SCROLL CARDS", "CLICK TO OPEN LIVE SITE")}
      {currentRoom === "studio" && hint("SCROLL TO BROWSE THE STACK", "HOVER TO PAINT")}
      {currentRoom === "about" && hint("SCROLL TO FLY THE STORY PATH")}
      {currentRoom === "contact" && hint(identity.email.toUpperCase(), "CLICK A BARREL TO CONNECT")}
    </>
  );
}
