"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";

function Balloon({ label, accent, x, y, z, scale = 1 }: { label: string; accent: string; x: number; y: number; z: number; scale?: number }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const hover = useRef(false);
  const mat = useMemo(() => {
    if (typeof document === "undefined") return null;
    const sk = createSketchTexture(label, { w: 420, h: 420, accent });
    const pt = createPaintedTexture(label, { w: 420, h: 420, accent });
    const m = createPaintRevealMaterial(sk, pt, { progress: 0 });
    matRef.current = m;
    return m;
  }, [label, accent]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = hover.current ? 1 : 0;
    matRef.current.uniforms.uProgress.value += (t - matRef.current.uniforms.uProgress.value) * 0.09;
    if (group.current) {
      group.current.position.y = y + Math.sin(clock.elapsedTime * 0.7 + x) * 0.12;
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.4 + x) * 0.04;
    }
  });

  return (
    <group ref={group} position={[x, y, z]} scale={scale}>
      {/* string */}
      <mesh position={[0, -0.9, -0.02]}>
        <planeGeometry args={[0.02, 1.2]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.6} />
      </mesh>
      {/* balloon body */}
      <mesh material={mat ?? undefined} onPointerEnter={() => (hover.current = true)} onPointerLeave={() => (hover.current = false)}>
        <circleGeometry args={[0.75, 32]} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.CircleGeometry(0.75, 32)]} />
        <lineBasicMaterial color="#1a1a1a" />
      </lineSegments>
      {/* knot */}
      <mesh position={[0, -0.78, 0.02]}>
        <circleGeometry args={[0.07, 10]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  );
}

function Cloud({ x, y, z, s }: { x: number; y: number; z: number; s: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(clock.elapsedTime * 0.2 + y) * 0.3;
  });
  return (
    <group ref={ref} position={[x, y, z]} scale={s}>
      {[0, 0.4, -0.35].map((ox, i) => (
        <mesh key={i} position={[ox, 0, 0]}>
          <circleGeometry args={[0.5 + Math.random() * 0.2, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      ))}
      {/* sketch outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.CircleGeometry(0.6, 16)]} />
        <lineBasicMaterial color="#1a1a1a" opacity={0.14} transparent />
      </lineSegments>
    </group>
  );
}

function Island({ x, z, label }: { x: number; z: number; label: string }) {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createSketchTexture(label, { w: 512, h: 256 });
  }, [label]);
  return (
    <group position={[x, -1.1, z]}>
      {/* island base */}
      <mesh>
        <planeGeometry args={[2.2, 1.1]} />
        <meshBasicMaterial color="#e8e2d6" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.2, 1.1)]} />
        <lineBasicMaterial color="#1a1a1a" />
      </lineSegments>
      {tex && (
        <mesh position={[0, 0.25, 0.02]}>
          <planeGeometry args={[1.9, 0.9]} />
          <meshBasicMaterial map={tex} transparent />
        </mesh>
      )}
    </group>
  );
}

export default function AboutRoom({ scrollOffset = 0 }: { scrollOffset?: number }) {
  // scrollOffset moves airplane forward through sky (z)
  const planeZ = -scrollOffset * 0.08; // airplane flies forward

  // Edit: less personal skill-spam, more story — like itom's balloons were tech but curated, now keep only 3 hero tech + story
  const balloons = useMemo(
    () => [
      { label: "CARTIS\nSHIPPED", accent: "#dfaf49", x: -2.2, y: 0.9, z: -2, s: 1.25 },
      { label: "FITMENTOR\nSHIPPED", accent: "#6dd993", x: 2.1, y: 1.3, z: -4, s: 1.3 },
      { label: "SYNAPSE\nCAMPUS", accent: "#6fccfb", x: -0.6, y: 1.6, z: -7, s: 1.15 },
    ],
    []
  );

  return (
    <group position={[0, 0.3, -30]}>
      {/* sky */}
      <mesh position={[0, 0.6, -8]} scale={[22, 12, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#eef6ff" />
      </mesh>
      {/* paper sky texture lines */}
      <group position={[0, 0.6, -7.9]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 1.5 - i * 0.9, 0]}>
            <planeGeometry args={[18, 0.01]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.04} />
          </mesh>
        ))}
      </group>

      {/* infinite clouds every -4 z */}
      {Array.from({ length: 8 }).map((_, i) => {
        const z = -i * 4 - (scrollOffset * 0.06) % 4;
        return <Cloud key={i} x={Math.sin(i * 1.9) * 2.2} y={0.8 + Math.cos(i) * 0.6} z={z} s={0.9 + (i % 3) * 0.2} />;
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const z = -i * 4 - 2 - (scrollOffset * 0.06) % 4;
        return <Cloud key={`b-${i}`} x={Math.cos(i * 2.1) * 2.8} y={1.2 + Math.sin(i) * 0.5} z={z} s={0.7} />;
      })}

      {/* airplane */}
      <group position={[0, 0.9, planeZ]} rotation={[0.12, 0, -0.08]}>
        {/* body */}
        <mesh>
          <planeGeometry args={[0.9, 0.42]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.9, 0.42)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
        {/* nose */}
        <mesh position={[0.45, 0, 0.01]} rotation={[0, 0, Math.PI / 6]}>
          <planeGeometry args={[0.35, 0.25]} />
          <meshBasicMaterial color="#dfaf49" />
        </mesh>
        {/* avatar on plane (sketch) */}
        <mesh position={[0, 0.18, 0.02]}>
          <circleGeometry args={[0.14, 16]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.18, 0.03]}>
          <circleGeometry args={[0.11, 16]} />
          <meshBasicMaterial color="#e8c9a8" />
        </mesh>
      </group>

      {/* wind lines behind plane */}
      <group position={[0, 0.9, planeZ - 0.6]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <mesh key={i} position={[0, (i - 1) * 0.18, -i * 0.25]}>
            <planeGeometry args={[0.6 - i * 0.12, 0.02]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.22 - i * 0.06} />
          </mesh>
        ))}
      </group>

      {/* balloons relative to scroll */}
      <group position={[0, 0, -scrollOffset * 0.06]}>
        {balloons.map((b, i) => (
          <Balloon key={i} {...b} />
        ))}
      </group>

      {/* islands below (journey) */}
      <group position={[0, 0, -scrollOffset * 0.04]}>
        <Island x={-3} z={-6} label="UO\n2024 — NOW" />
        <Island x={2.8} z={-12} label="FREELANCE\n2023 →" />
      </group>

      {/* awards floating like SOTD */}
      <group position={[0, -0.2, -scrollOffset * 0.05]}>
        {[0, 1].map((i) => (
          <group key={i} position={[i === 0 ? -2 : 2, 0.2, -10 - i * 6]}>
            <mesh>
              <planeGeometry args={[0.9, 0.68]} />
              <meshBasicMaterial color="#faf8f3" />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(0.9, 0.68)]} />
              <lineBasicMaterial color="#1a1a1a" />
            </lineSegments>
          </group>
        ))}
      </group>
    </group>
  );
}
