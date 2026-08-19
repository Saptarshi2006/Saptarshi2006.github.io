"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function GazeCamera({
  intensity = 0.4,
  lookAt = 1.2,
  lerp = 0.055,
}: {
  intensity?: number;
  lookAt?: number;
  lerp?: number;
}) {
  const base = useRef<{ x: number; y: number; z: number } | null>(null);
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(({ camera, pointer }) => {
    if (!base.current) {
      base.current = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    }
    const b = base.current;

    const tx = b.x + pointer.x * intensity;
    const ty = b.y + pointer.y * intensity;

    camera.position.x += (tx - camera.position.x) * lerp;
    camera.position.y += (ty - camera.position.y) * lerp;

    lookTarget.current.set(pointer.x * lookAt, pointer.y * lookAt, camera.position.z - 6);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
