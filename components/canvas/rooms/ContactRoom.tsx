"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";
import { identity, socials } from "@/lib/content";

function Barrel({ label, href, accent, pos }: { label: string; href: string; accent: string; pos: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const hover = useRef(false);
  const mat = useMemo(() => {
    if (typeof document === "undefined") return null;
    const sk = createSketchTexture(label, { w: 420, h: 520, accent });
    const pt = createPaintedTexture(label, { w: 420, h: 520, accent });
    const m = createPaintRevealMaterial(sk, pt, { progress: 0 });
    matRef.current = m;
    return m;
  }, [label, accent]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = hover.current ? 1 : 0;
    matRef.current.uniforms.uProgress.value += (t - matRef.current.uniforms.uProgress.value) * 0.09;
    if (group.current) {
      group.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 0.8 + pos[0]) * 0.05;
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.28 + pos[0]) * 0.07;
    }
  });

  return (
    <group ref={group} position={pos}>
      {/* barrel body */}
      <mesh position={[0, -0.05, -0.02]}>
        <cylinderGeometry args={[0.48, 0.52, 0.95, 14]} />
        <meshBasicMaterial color="#e8ddd0" />
      </mesh>
      <lineSegments position={[0, -0.05, -0.019]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.48, 0.52, 0.95, 14)]} />
        <lineBasicMaterial color="#1a1a1a" opacity={0.22} transparent />
      </lineSegments>
      {/* top lid */}
      <mesh position={[0, 0.43, 0.02]}>
        <circleGeometry args={[0.48, 14]} />
        <meshBasicMaterial color="#d9c7a5" />
      </mesh>
      {/* label plane */}
      <mesh material={mat ?? undefined} position={[0, 0.02, 0.41]} onPointerEnter={() => (hover.current = true)} onPointerLeave={() => (hover.current = false)} onClick={() => window.open(href, "_blank")}>
        <planeGeometry args={[0.78, 0.9]} />
      </mesh>
      <lineSegments position={[0, 0.02, 0.411]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(0.78, 0.9)]} />
        <lineBasicMaterial color="#1a1a1a" />
      </lineSegments>
      {/* hoops */}
      {[ -0.22, 0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.5, 0.015, 6, 14]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

export default function ContactRoom() {
  const barrels = useMemo(
    () => [
      { label: "GitHub\n→", href: socials.find((s) => s.label === "GitHub")!.href, accent: "#1a1a1a", pos: [-2.1, -0.1, 1.2] as [number, number, number] },
      { label: "LinkedIn\n→", href: identity.linkedin, accent: "#0a66c2", pos: [0, -0.2, 1.6] as [number, number, number] },
      { label: "Email\n→", href: `mailto:${identity.email}`, accent: "#c82924", pos: [2.05, -0.08, 1.15] as [number, number, number] },
    ],
    []
  );

  return (
    <group position={[0, 0, -30]}>
      {/* sea */}
      <mesh position={[0, -0.7, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshBasicMaterial color="#cfe7ff" />
      </mesh>
      {/* waves lines */}
      <group position={[0, -0.68, -2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -i * 1.1]}>
            <planeGeometry args={[12 - i * 0.6, 0.02]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.08} />
          </mesh>
        ))}
      </group>
      {/* sand */}
      <mesh position={[0, -0.9, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 6]} />
        <meshBasicMaterial color="#e8e2d6" />
      </mesh>
      {/* paper sand edge torn */}
      <mesh position={[0, -0.88, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 0.18]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.09} />
      </mesh>

      {/* pier */}
      <group position={[0, -0.55, 0.3]}>
        {/* planks */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -i * 0.62]}>
            <boxGeometry args={[2.8, 0.06, 0.58]} />
            <meshBasicMaterial color="#d9c7a5" />
          </mesh>
        ))}
        {/* piles */}
        {[-1.1, 1.1].map((x) =>
          Array.from({ length: 3 }).map((_, i) => (
            <mesh key={`${x}-${i}`} position={[x, -0.35, -i * 1.5]}>
              <cylinderGeometry args={[0.07, 0.07, 1.1, 8]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          ))
        )}
        {/* lighthouse */}
        <group position={[0, 0.7, -2.8]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.32, 1.4, 10]} />
            <meshBasicMaterial color="#faf8f3" />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.CylinderGeometry(0.22, 0.32, 1.4, 10)]} />
            <lineBasicMaterial color="#c82924" />
          </lineSegments>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshBasicMaterial color="#dfaf49" transparent opacity={0.7} />
          </mesh>
        </group>
      </group>

      {/* Barrels */}
      {barrels.map((b, i) => (
        <Barrel key={i} {...b} />
      ))}

      {/* paper form floating */}
      <group position={[0, 1.55, -2.2]}>
        <mesh>
          <planeGeometry args={[1.9, 1.2]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.9, 1.2)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
        {/* lines on paper */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[0, 0.25 - i * 0.2, 0.01]}>
            <planeGeometry args={[1.5, 0.01]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.12} />
          </mesh>
        ))}
      </group>

      {/* title */}
      <group position={[0, 2.15, -2]}>
        <mesh>
          <planeGeometry args={[3.0, 0.55]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}
