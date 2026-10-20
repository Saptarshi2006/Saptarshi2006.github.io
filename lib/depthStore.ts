// Tiny external store for corridor depth (meters walked) so the HUD can
// subscribe without re-rendering the whole canvas tree.
let value = 0;
const listeners = new Set<() => void>();

export const depthStore = {
  get: () => value,
  set(next: number) {
    if (next === value) return;
    value = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
