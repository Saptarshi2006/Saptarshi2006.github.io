"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

type AudioContextType = {
  enabled: boolean;
  enableAudio: () => void;
  play: (key: string, opts?: { volume?: number; loop?: boolean }) => void;
  stop: (key: string) => void;
};

const AudioContext = createContext<AudioContextType>({
  enabled: false,
  enableAudio: () => {},
  play: () => {},
  stop: () => {},
});

// Simple WebAudio stub — uses <audio> elements for simplicity in Next export
const SOUNDS: Record<string, string> = {
  open: "/sounds/otwarciedrzwi.mp3",
  close: "/sounds/zamknieciedrzwi.mp3",
  creak: "/sounds/uchyleniedrzwi.mp3",
  wind: "/sounds/szumwiatru.mp3",
  city: "/sounds/szummiasta.mp3",
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const enableAudio = useCallback(() => setEnabled(true), []);

  useEffect(() => {
    if (!enabled) return;
    Object.entries(SOUNDS).forEach(([k, src]) => {
      if (!audiosRef.current.has(k)) {
        const a = new Audio(src);
        a.preload = "auto";
        a.crossOrigin = "anonymous";
        audiosRef.current.set(k, a);
      }
    });
  }, [enabled]);

  const play = useCallback(
    (key: string, opts?: { volume?: number; loop?: boolean }) => {
      if (!enabled) return;
      const a = audiosRef.current.get(key);
      if (!a) return;
      a.volume = opts?.volume ?? 0.6;
      a.loop = opts?.loop ?? false;
      a.currentTime = 0;
      a.play().catch(() => {});
    },
    [enabled]
  );

  const stop = useCallback((key: string) => {
    const a = audiosRef.current.get(key);
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);

  return (
    <AudioContext.Provider value={{ enabled, enableAudio, play, stop }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

export function initAudio() {
  // preload stub - actual init happens on user interaction via enableAudio
}
