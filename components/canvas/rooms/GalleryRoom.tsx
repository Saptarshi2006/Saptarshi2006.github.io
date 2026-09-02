"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";
import { projects } from "@/lib/content";

function ProjectCard({ project, index, offset }: { project: typeof projects[number]; index: number; offset: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const hover = useRef(false);

  const mat = useMemo(() => {
    if (typeof document === "undefined") return null;
    const sk = createSketchTexture(`${project.title}\n${project.eyebrow}`, { w: 420, h: 560, accent: project.accent });
    const pt = createPaintedTexture(`${project.title}\nVIEW`, { w: 420, h: 560, accent: project.accent });
    const m = createPaintRevealMaterial(sk, pt, { progress: 0 });
    matRef.current = m;
    return m;
  }, [project.title, project.eyebrow, project.accent]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const target = hover.current ? 1 : 0;
    matRef.current.uniforms.uProgress.value += (target - matRef.current.uniforms.uProgress.value) * 0.09;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.6 + index) * 0.06;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3 + index) * 0.015;
    }
  });

  const x = index * 2.4 - offset;

  return (
    <group ref={groupRef} position={[x, 0.2, 0]}>
      {/* clothesline */}
      <mesh position={[0, 1.1, -0.02]}>
        <planeGeometry args={[2.6, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* clip */}
      <mesh position={[0, 0.85, 0.03]}>
        <planeGeometry args={[0.18, 0.16]} />
        <meshBasicMaterial color="#dfaf49" />
      </mesh>
      <lineSegments position={[0, 0.85, 0.031]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(0.18, 0.16)]} />
        <lineBasicMaterial color="#1a1a1a" />
      </lineSegments>

      <mesh
        material={mat ?? undefined}
        onPointerEnter={() => (hover.current = true)}
        onPointerLeave={() => (hover.current = false)}
        onClick={() => {
          if (project.url) window.open(project.url, "_blank");
        }}
      >
        <planeGeometry args={[1.9, 2.45]} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.9, 2.45)]} />
        <lineBasicMaterial color="#1a1a1a" opacity={0.6} transparent />
      </lineSegments>
      {/* stack tags under */}
      <group position={[0, -1.55, 0]}>
        <mesh>
          <planeGeometry args={[1.6, 0.28]} />
          <meshBasicMaterial color="#faf8f3" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

export default function GalleryRoom({ scrollOffset = 0 }: { scrollOffset?: number }) {
  const infiniteOffset = useMemo(() => {
    // wrap offset for infinite clothesline: modulo total width
    const total = projects.length * 2.4;
    return ((scrollOffset % total) + total) % total;
  }, [scrollOffset]);

  // duplicates for seamless loop
  const allProjects = useMemo(() => [...projects, ...projects, ...projects], []);

  return (
    <group position={[0, 0, -30]}>
      {/* floor paper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 2]}>
        <planeGeometry args={[22, 12]} />
        <meshBasicMaterial color="#ebe7dc" />
      </mesh>
      {/* back houses sketch */}
      <mesh position={[0, 1.2, -4]}>
        <planeGeometry args={[14, 3.5]} />
        <meshBasicMaterial color="#faf8f3" transparent opacity={0.9} />
      </mesh>
      <lineSegments position={[0, 1.2, -3.99]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(14, 3.5)]} />
        <lineBasicMaterial color="#1a1a1a" opacity={0.12} transparent />
      </lineSegments>
      {/* title */}
      <group position={[0, 2.1, -2]}>
        <mesh>
          <planeGeometry args={[3.2, 0.6]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* cards infinite */}
      <group position={[0, 0.2, 0]}>
        {allProjects.map((p, i) => (
          <ProjectCard key={`${p.id}-${i}`} project={p} index={i} offset={infiniteOffset} />
        ))}
      </group>

      {/* railing */}
      <mesh position={[0, -0.65, 3]}>
        <planeGeometry args={[14, 0.06]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* instruction */}
      <group position={[0, -1.05, 3.1]}>
        <mesh>
          <planeGeometry args={[2.4, 0.34]} />
          <meshBasicMaterial color="#faf8f3" transparent opacity={0.92} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.4, 0.34)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
      </group>
    </group>
  );
}
