"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useUI } from "@/lib/store";

export default function BloomFx({
  intensity = 0.55,
  luminanceThreshold = 0.65,
  radius = 0.6,
}: {
  intensity?: number;
  luminanceThreshold?: number;
  radius?: number;
}) {
  const reducedMotion = useUI((s) => s.reducedMotion);
  if (reducedMotion) return null;
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom intensity={intensity} luminanceThreshold={luminanceThreshold} radius={radius} mipmapBlur />
    </EffectComposer>
  );
}