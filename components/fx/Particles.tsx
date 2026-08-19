"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 32, 32);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("01", 16, 16);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function Particles({
  count = 1200,
  spread = [14, 8, 4] as [number, number, number],
  speed = 0.15,
  size = 0.05,
  color = "#ffffff",
  opacity = 0.35,
}: {
  count?: number;
  spread?: [number, number, number];
  speed?: number;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const base = useRef<Float32Array | null>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread[0];
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    }
    base.current = arr.slice();
    return arr;
  }, [count, spread]);

  const sprite = useMemo(() => makeTexture(), []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const b = base.current!;
      arr[i * 3] = b[i * 3] + Math.sin(t * speed * 2 + i) * 0.6;
      arr[i * 3 + 1] = b[i * 3 + 1] + ((t * speed * 0.4 + i * 0.001) % 4) - 2;
      arr[i * 3 + 2] = b[i * 3 + 2] + Math.cos(t * speed * 1.4 + i) * 0.5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={size}
        sizeAttenuation
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
