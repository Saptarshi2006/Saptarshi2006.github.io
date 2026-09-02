"use client";

import React, { createContext, useContext, useCallback, useState } from "react";

type AchievementKey =
  | "corridor_enter"
  | "corridor_explore"
  | "about_fly"
  | "studio_interact"
  | "gallery_inspect"
  | "contact_choose";

const ACHIEVEMENTS: Record<AchievementKey, { label: string; title: string }> = {
  corridor_enter: { label: "Click a door to enter", title: "Explorer" },
  corridor_explore: { label: "Scroll to explore the corridor", title: "Wanderer" },
  about_fly: { label: "Scroll to fly through my story", title: "Sky Walker" },
  studio_interact: { label: "Drag to rotate and browse", title: "Director" },
  gallery_inspect: { label: "Click project to inspect", title: "Art Critic" },
  contact_choose: { label: "Find a contact method", title: "Sociable" },
};

type Ctx = {
  unlocked: Set<AchievementKey>;
  unlockAchievement: (k: AchievementKey) => void;
  achievements: typeof ACHIEVEMENTS;
};

const AchievementsContext = createContext<Ctx>({
  unlocked: new Set(),
  unlockAchievement: () => {},
  achievements: ACHIEVEMENTS,
});

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<AchievementKey>>(new Set());

  const unlockAchievement = useCallback((k: AchievementKey) => {
    setUnlocked((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      try {
        localStorage.setItem("achievements", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return (
    <AchievementsContext.Provider value={{ unlocked, unlockAchievement, achievements: ACHIEVEMENTS }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementsContext);
}
