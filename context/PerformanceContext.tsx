"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Tier = "HIGH" | "LOW";

type PerfContext = {
  tier: Tier;
  settings: { dpr: [number, number]; antialias: boolean; warmup: boolean };
  downgradeTier: () => void;
};

const PerformanceContext = createContext<PerfContext>({
  tier: "HIGH",
  settings: { dpr: [1, 1.8], antialias: true, warmup: true },
  downgradeTier: () => {},
});

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>("HIGH");

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");
    const isWeakCPU =
      typeof navigator.hardwareConcurrency !== "undefined" && navigator.hardwareConcurrency <= 4;
    // @ts-ignore
    const isLowRAM = typeof navigator.deviceMemory !== "undefined" && navigator.deviceMemory <= 4;
    const isSmall = typeof window !== "undefined" && window.innerWidth < 450;
    const low = isMobile || isWeakCPU || isLowRAM || isSmall;
    if (low) setTier("LOW");
  }, []);

  const downgradeTier = useCallback(() => setTier("LOW"), []);

  const settings =
    tier === "LOW"
      ? { dpr: [1, 1] as [number, number], antialias: false, warmup: false }
      : { dpr: [1, 1.8] as [number, number], antialias: true, warmup: true };

  return (
    <PerformanceContext.Provider value={{ tier, settings, downgradeTier }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  return useContext(PerformanceContext);
}
