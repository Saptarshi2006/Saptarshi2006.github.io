"use client";

import { Canvas } from "@react-three/fiber";
import { useInView } from "@/lib/useInView";

type CanvasStageProps = {
  children: React.ReactNode;
  className?: string;
  camera?: Partial<{
    fov: number;
    position: [number, number, number];
    near: number;
    far: number;
  }>;
  dpr?: [number, number];
};

export default function CanvasStage({
  children,
  className = "",
  camera,
  dpr = [1, 1.75],
}: CanvasStageProps) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "30% 0px 30% 0px",
    threshold: 0,
  });

  return (
    <div ref={ref} className={className}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={dpr}
        camera={{ fov: 35, position: [0, 0, 9], near: 0.1, far: 100, ...camera }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </Canvas>
    </div>
  );
}
