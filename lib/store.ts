"use client";

import { create } from "zustand";

type CursorVariant = "default" | "hover" | "drag" | "hidden";

interface UIState {
  entered: boolean;
  active: string | null;
  cursorVariant: CursorVariant;
  reducedMotion: boolean;
  setEntered: (v: boolean) => void;
  setActive: (v: string | null) => void;
  setCursorVariant: (v: CursorVariant) => void;
  setReducedMotion: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  entered: false,
  active: null,
  cursorVariant: "default",
  reducedMotion: false,
  setEntered: (entered) => set({ entered }),
  setActive: (active) => set({ active }),
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
