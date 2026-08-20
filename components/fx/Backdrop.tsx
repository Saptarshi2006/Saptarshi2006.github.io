"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { baseVertex, noiseFragment } from "@/components/fx/Shaders";

export default function Backdrop({
  colorA = "#1d1d1d",
  colorB = "#2a2722",
  opacity = 1,
  z = -6,
}: {
  colorA?: string;
  colorB?: string;
  opacity?: number;
  z?: number;
}) {
  const { viewport } = useThree();
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const tex = useLoader(THREE.TextureLoader, "/fx/cell_noise.png");

  if (!matRef.current) {
    matRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uOpacity: { value: opacity },
        uTex: { value: null },
        uTexStrength: { value: 0 },
      },
      vertexShader: baseVertex,
      fragmentShader: noiseFragment,
      transparent: true,
      depthWrite: false,
    });
  }

  const material = matRef.current;

  useEffect(() => {
    if (!tex) return;
    material.uniforms.uTex.value = tex;
    material.uniforms.uTexStrength.value = 0.18;
  }, [tex, material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  const w = useMemo(() => viewport.width * 1.6, [viewport.width]);
  const h = useMemo(() => viewport.height * 1.6, [viewport.height]);

  return (
    <mesh position={[0, 0, z]} material={material}>
      <planeGeometry args={[w, h, 1, 1]} />
    </mesh>
  );
}
