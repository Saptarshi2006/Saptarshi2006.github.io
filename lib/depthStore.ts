// Tiny external store for the "next door" HUD readout so the UI can
// subscribe without re-rendering the whole canvas tree.
export type DepthInfo = { next: string; dist: number };

// cached — useSyncExternalStore requires stable snapshot identity
export const INITIAL_DEPTH: DepthInfo = { next: "GALLERY", dist: 0 };
let value: DepthInfo = INITIAL_DEPTH;
const listeners = new Set<() => void>();

export const depthStore = {
  get: () => value,
  set(next: string, dist: number) {
    if (next === value.next && dist === value.dist) return;
    value = { next, dist };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
