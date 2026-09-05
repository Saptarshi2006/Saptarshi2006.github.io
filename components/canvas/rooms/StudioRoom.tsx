"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";
import { skills } from "@/lib/content";

function Monitor({ label, accent, index, offset }: { label: string; accent: string; index: number; offset: number }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const hover = useRef(false);
  const mat = useMemo(() => {
    if (typeof document === "undefined") return null;
    const sk = createSketchTexture(label, { w: 512, h: 340, accent });
    const pt = createPaintedTexture(label, { w: 512, h: 340, accent });
    const m = createPaintRevealMaterial(sk, pt, { progress: 0 });
    matRef.current = m;
    return m;
  }, [label, accent]);

  useFrame(() => {
    if (!matRef.current) return;
    const t = hover.current ? 1 : 0;
    matRef.current.uniforms.uProgress.value += (t - matRef.current.uniforms.uProgress.value) * 0.09;
    if (group.current) {
      group.current.position.y += (Math.sin(Date.now() * 0.001 + index) * 0.0005);
      group.current.rotation.y = Math.sin(Date.now() * 0.0006 + index) * 0.03;
    }
  });

  // vertical wrap layout: index flows Y, offset scrolls
  const y = 1.2 - (index * 1.4 - offset);
  // infinite Y wrap (like studio vertical infinite)
  const wrappedY = ((y + 6) % 6) - 3;

  return (
    <group ref={group} position={[0, wrappedY, 0]}>
      {/* monitor body */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[1.95, 1.25, 0.12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh material={mat ?? undefined} position={[0, 0, 0.01]} onPointerEnter={() => (hover.current = true)} onPointerLeave={() => (hover.current = false)}>
        <planeGeometry args={[1.78, 1.08]} />
      </mesh>
      {/* stand */}
      <mesh position={[0, -0.85, 0]}>
        <planeGeometry args={[0.18, 0.4]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.22]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

export default function StudioRoom({ scrollOffset = 0 }: { scrollOffset?: number }) {
  // Perfect itom STUDIO is content — not a skill list. Show your actual work as floating screens (like itom's blog/video/phone).
  const items = useMemo(
    () => [
      { label: "GITHUB\n3 SHIPPED →", accent: "#1a1a1a" },
      { label: "LINKEDIN\nBUILD LOG →", accent: "#0a66c2" },
      { label: "YOUTUBE\nDEMO →", accent: "#ff0000" },
      { label: "WRITING\nNOTES →", accent: "#c82924" },
      { label: "CODE\nRUST • TS →", accent: "#dfaf49" },
    ],
    []
  );

  // double for infinite but keep it airy (not 3x crowded)
  const list = useMemo(() => [...items, ...items], [items]);

  return (
    <group position={[0, 0, -32]}>
      {/* floating in void */}
      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[18, 12]} />
        <meshBasicMaterial color="#faf8f3" transparent opacity={0.9} />
      </mesh>
      {/* grid paper lines */}
      <group position={[0, 0, -2.9]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, -1.2 + i * 0.7, 0]}>
            <planeGeometry args={[14, 0.01]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.06} />
          </mesh>
        ))}
      </group>

      {/* title */}
      <group position={[0, 2.3, 0]}>
        <mesh>
          <planeGeometry args={[2.8, 0.5]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      <group>
        {list.map((it, i) => (
          <Monitor key={i} label={it.label} accent={it.accent} index={i} offset={scrollOffset} />
        ))}
      </group>

      {/* side floating phones */}
      <group position={[3.2, 0, 1.2]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[0.75, 1.35, 0.08]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh>
          <planeGeometry args={[0.68, 1.2]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
      </group>
      <group position={[-3.2, 0.4, 1.1]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[0.75, 1.35, 0.08]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh>
          <planeGeometry args={[0.68, 1.2]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
      </group>
    </group>
  );
}
