"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Backdrop from "@/components/fx/Backdrop";
import Particles from "@/components/fx/Particles";
import GazeCamera from "@/components/fx/GazeCamera";
import { moonFragment } from "@/components/fx/Shaders";

function Moon() {
  const matRef = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial | null>(null);

  if (!material.current) {
    material.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color("#d9d4c8") },
        uColorB: { value: new THREE.Color("#8a8578") },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: moonFragment,
    });
  }

  useFrame(({ clock }) => {
    const mat = material.current;
    if (!mat) return;
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (matRef.current) {
      matRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <mesh
      ref={matRef}
      position={[2.4, 1.7, -2]}
      material={material.current}
      castShadow
    >
      <sphereGeometry args={[1.15, 64, 64]} />
    </mesh>
  );
}

function Mountains() {
  const meshes = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const x = -14 + (i / 24) * 28;
        const h = 0.8 + Math.random() * 2.4;
        const r = 1.1 + Math.random() * 1.6;
        const z = -3 - Math.random() * 2.5;
        return { position: [x, h / 2 - 0.9, z] as [number, number, number], h, r };
      }),
    []
  );

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#141414",
        roughness: 0.9,
        metalness: 0,
        flatShading: true,
      }),
    []
  );

  return (
    <group>
      {meshes.map((m, i) => (
        <mesh key={i} position={m.position} material={mat} castShadow>
          <coneGeometry args={[m.r, m.h, 5, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -4]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <meshStandardMaterial color="#0d0d0d" roughness={1} />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <>
      <GazeCamera intensity={0.5} lookAt={1.4} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 3, 2]} intensity={30} color="#fff3dd" />
      <Backdrop colorA="#1d1d1d" colorB="#26231d" z={-8} />
      <Moon />
      <Ground />
      <Mountains />
      <Particles count={700} spread={[18, 9, 3]} size={0.04} opacity={0.3} />
    </>
  );
}
