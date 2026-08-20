"use client";

import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
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
      <Vignette eskil={false} offset={0.35} darkness={0.42} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.035} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
      <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0006)} />
    </EffectComposer>
  );
}