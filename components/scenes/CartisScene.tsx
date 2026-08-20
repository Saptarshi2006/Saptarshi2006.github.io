"use client";

import CaseStudy from "@/components/scenes/CaseStudy";
import CanvasStage from "@/components/fx/CanvasStage";
import CartisCoin3D from "@/components/three/CartisCoin3D";
import FloatText from "@/components/three/FloatText";
import { projects } from "@/lib/content";

export default function CartisScene() {
  const project = projects[0];
  return (
    <CaseStudy project={project} id="cartis">
      <CanvasStage className="h-full w-full" dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 4]} intensity={20} color="#ffe9b0" />
        <CartisCoin3D />
        <FloatText
          position={[0, 0.1, -2.6]}
          size={1.15}
          color="#dfaf49"
          opacity={0.18}
          letterSpacing={0.14}
        >
          CARTIS
        </FloatText>
      </CanvasStage>
    </CaseStudy>
  );
}
