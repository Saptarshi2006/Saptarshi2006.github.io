"use client";

import { useState } from "react";
import CaseStudy from "@/components/scenes/CaseStudy";
import CanvasStage from "@/components/fx/CanvasStage";
import FitDumbbell3D from "@/components/three/FitDumbbell3D";
import MSDFText from "@/components/three/MSDFText";
import { projects } from "@/lib/content";

const variants = [
  {
    key: "workouts",
    label: "WORKOUTS",
    copy: "AI-personalized plans for Indian beginners — no gym, no guesswork.",
  },
  {
    key: "meals",
    label: "MEALS",
    copy: "Affordable Indian meal plans — dal, rice, egg — built to your protein goals.",
  },
  {
    key: "habits",
    label: "HABITS",
    copy: "Daily water, sleep, steps and protein tracking with streaks that stick.",
  },
];

export default function FitMentorScene() {
  const project = projects[1];
  const [active, setActive] = useState(0);

  return (
    <CaseStudy project={project} id="fitmentor" reversed>
      <>
        <CanvasStage className="h-full w-full" dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 3, 4]} intensity={20} color="#ffffff" />
          <FitDumbbell3D />
          <MSDFText
            position={[0, 0.15, -2.8]}
            color="#6dd993"
            opacity={0.14}
            letterSpacing={16}
          >
            FITMENTOR
          </MSDFText>
        </CanvasStage>
        <div className="pointer-events-auto absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <div className="flex gap-4">
            {variants.map((v, i) => (
              <button
                key={v.key}
                onClick={() => setActive(i)}
                className={`text-techno text-[10px] tracking-[0.25em] transition-colors duration-300 ${
                  active === i ? "text-paper" : "text-white/30 hover:text-white/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="text-body-light max-w-xs text-center text-[11px] text-white/50">
            {variants[active].copy}
          </p>
        </div>
      </>
    </CaseStudy>
  );
}
