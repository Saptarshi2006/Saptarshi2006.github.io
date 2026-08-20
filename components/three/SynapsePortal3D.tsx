"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Particles from "@/components/fx/Particles";
import StudioEnv from "@/components/fx/StudioEnv";
import { baseVertex, portalFragment } from "@/components/fx/Shaders";

export default function SynapsePortal3D() {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial | null>(null);

  if (!material.current) {
    material.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color("#1a2a5e") },
        uColorB: { value: new THREE.Color("#6fccfb") },
      },
      vertexShader: baseVertex,
      fragmentShader: portalFragment,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mat = material.current;
    if (mat) mat.uniforms.uTime.value = t;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
    }
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.7) * 0.12;
    }
  });

  return (
    <group>
      <StudioEnv />
      <group ref={group}>
        <mesh material={material.current} position={[0, 0, 0.1]}>
          <circleGeometry args={[1.5, 64]} />
        </mesh>
        <mesh ref={ringRef} position={[0, 0, -0.1]}>
          <torusGeometry args={[1.55, 0.05, 16, 96]} />
          <meshStandardMaterial color="#6fccfb" emissive="#12385e" emissiveIntensity={1.2} metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, -0.3]} rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[1.85, 0.015, 8, 128]} />
          <meshBasicMaterial color="#6fccfb" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.4]} rotation={[0, 0, -Math.PI / 5]}>
          <torusGeometry args={[2.1, 0.012, 8, 128]} />
          <meshBasicMaterial color="#9ad8ff" transparent opacity={0.35} />
        </mesh>
      </group>
      <Particles count={320} spread={[4.5, 4.5, 2.5]} size={0.03} color="#9ad8ff" opacity={0.55} />
    </group>
  );
}
