"use client";

import { useState, useCallback } from "react";
import { SceneProvider } from "@/context/SceneContext";
import { PerformanceProvider } from "@/context/PerformanceContext";
import { AudioProvider } from "@/context/AudioManager";
import { AchievementsProvider } from "@/context/AchievementsContext";
import CustomCursor from "@/components/ui/CustomCursor";
import Preloader from "@/components/canvas/Preloader";
import ExperienceCanvas from "@/components/canvas/ExperienceCanvas";
import { NavigationUI, GlobalOverlay } from "@/components/canvas/OverlayUI";

export default function Experience() {
  const [sceneReady, setSceneReady] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handlePreloaderComplete = useCallback(() => setPreloaderDone(true), []);

  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <AudioProvider>
          <SceneProvider>
            <div className="relative min-h-[100svh] bg-[#faf8f3] text-ink">
              {/* SEO fallback - visible to crawlers, sr-only */}
              <div className="sr-only">
                <h1>Saptarshi Mukherjee — Full-Stack Engineer</h1>
                <p>
                  Full-stack engineer building AI-native products. Cartis AI financial coach, FitMentor AI fitness coach, Synapse campus platform.
                </p>
                <section>
                  <h2>Projects</h2>
                  <ul>
                    <li>Cartis — AI Financial Coach (Rust, Axum, Next.js)</li>
                    <li>FitMentor — AI Fitness Coach (TanStack Start, Rust)</li>
                    <li>Synapse — Campus Portal (Next.js, NestJS, WebGL)</li>
                  </ul>
                </section>
              </div>

              <Preloader onComplete={handlePreloaderComplete} ready={sceneReady} />
              <CustomCursor />
              <ExperienceCanvas onSceneReady={handleSceneReady} />
              <NavigationUI />
              <GlobalOverlay />

              {/* sr-only helpers */}
              <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
            </div>
          </SceneProvider>
        </AudioProvider>
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
