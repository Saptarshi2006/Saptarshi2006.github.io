"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Backdrop from "@/components/fx/Backdrop";
import BloomFx from "@/components/fx/BloomFx";
import Particles from "@/components/fx/Particles";
import StudioEnv from "@/components/fx/StudioEnv";

function Plate({ x, radius, color }: { x: number; radius: number; color: string }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[radius, radius, 0.28, 32]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.3} />
    </mesh>
  );
}

export default function FitDumbbell3D() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.12;
    g.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.12;
  });

  const steel = "#cfd4d9";
  const accent = "#6dd993";

  return (
    <group>
      <StudioEnv />
      <Backdrop colorA="#0f1a14" colorB="#1d1d1d" opacity={0.9} z={-7} />
      <group ref={group} rotation={[0.15, 0.4, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 2.9, 24]} />
          <meshStandardMaterial color={steel} metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 2.6, 24]} />
          <meshStandardMaterial color="#3a3f44" metalness={0.9} roughness={0.25} />
        </mesh>
        <Plate x={-1.1} radius={0.72} color={accent} />
        <Plate x={-1.4} radius={0.62} color={steel} />
        <Plate x={1.1} radius={0.72} color={accent} />
        <Plate x={1.4} radius={0.62} color={steel} />
      </group>
      <Particles count={200} spread={[4, 3, 2]} size={0.035} color={accent} opacity={0.4} />
      <BloomFx intensity={0.5} luminanceThreshold={0.65} />
    </group>
  );
}
