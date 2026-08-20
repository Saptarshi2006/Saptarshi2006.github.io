"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Particles from "@/components/fx/Particles";
import StudioEnv from "@/components/fx/StudioEnv";

function makeCoinTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, "#f7e29a");
  g.addColorStop(0.7, "#d9a942");
  g.addColorStop(1, "#a97c1f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "#7a5410";
  ctx.lineWidth = 18;
  ctx.strokeRect(20, 20, 472, 472);
  ctx.strokeStyle = "#7a5410";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 416, 416);
  ctx.fillStyle = "#6b4a0e";
  ctx.font = "700 260px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("₹", 256, 200);
  ctx.font = "800 72px sans-serif";
  ctx.fillText("CARTIS", 256, 380);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export default function CartisCoin3D() {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeCoinTexture(), []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.5;
    g.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <group>
      <StudioEnv />
      <group ref={group}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.16, 64]} />
          <meshStandardMaterial color="#d9a942" metalness={0.95} roughness={0.22} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.09]}>
          <cylinderGeometry args={[1.05, 1.05, 0.03, 64]} />
          <meshBasicMaterial map={tex} />
        </mesh>
      </group>
      <Particles count={260} spread={[4, 4, 2]} size={0.035} color="#f7e29a" opacity={0.5} />
    </group>
  );
}
