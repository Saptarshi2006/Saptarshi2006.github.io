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
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <CanvasStage className="h-[55%] w-full" dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 3, 4]} intensity={20} color="#ffffff" />
          <FitDumbbell3D />
          <MSDFText
            position={[0, 0.15, -2.8]}
            color="#6dd993"
            opacity={0.16}
            letterSpacing={16}
          >
            FITMENTOR
          </MSDFText>
        </CanvasStage>
        <div className="flex flex-col items-center gap-3">
          {variants.map((v, i) => (
            <button
              key={v.key}
              onClick={() => setActive(i)}
              className={`text-techno text-[11px] tracking-[0.3em] transition-all duration-300 ${
                active === i
                  ? "text-paper"
                  : "text-white/30 hover:text-white/70"
              }`}
            >
              {v.label}
            </button>
          ))}
          <p className="text-body-light mt-2 max-w-xs text-center text-xs text-white/50">
            {variants[active].copy}
          </p>
        </div>
      </div>
    </CaseStudy>
  );
}
