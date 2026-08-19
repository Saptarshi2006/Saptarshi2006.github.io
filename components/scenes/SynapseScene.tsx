"use client";

import { useEffect, useRef, useState } from "react";
import CaseStudy from "@/components/scenes/CaseStudy";
import CanvasStage from "@/components/fx/CanvasStage";
import SynapsePortal3D from "@/components/three/SynapsePortal3D";
import { projects } from "@/lib/content";

const features = [
  "DEPARTMENT VERIFIED CHAT ROOMS",
  "AI CAMPUS ASSISTANT WITH RAG",
  "WEBGL CAMPUS MAP + AI NAVIGATION",
  "LIVE BUS TRACKING",
  "PUNCH-IN LOCATION TRACKING",
  "NOTICES WITH PUSH",
];

export default function SynapseScene() {
  const project = projects[2];
  const [index, setIndex] = useState(0);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % features.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!textRef.current) return;
    const el = textRef.current;
    el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const t = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 30);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <CaseStudy project={project} id="synapse">
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <CanvasStage className="h-[60%] w-full" dpr={[1, 1.5]}>
          <ambientLight intensity={0.4} />
          <SynapsePortal3D />
        </CanvasStage>
        <div className="flex flex-col items-center gap-3">
          <span className="text-techno text-[10px] tracking-[0.3em] text-white/30">
            WHAT IT PLANS
          </span>
          <p ref={textRef} className="text-techno text-sm tracking-[0.15em] text-paper">
            {features[index]}
          </p>
          <div className="flex gap-2">
            {features.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-4 transition-colors duration-300 ${
                  i === index ? "bg-paper" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </CaseStudy>
  );
}
