"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";

export default function EntranceDoors({
  position = [0, 0, 22] as [number, number, number],
  onComplete,
}: {
  position?: [number, number, number];
  onComplete: () => void;
}) {
  const leftMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const rightMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const leftGroup = useRef<THREE.Group>(null);
  const rightGroup = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);

  const { sketch: leftSketch, painted: leftPainted } = useMemo(() => {
    if (typeof document === "undefined") return { sketch: null, painted: null } as any;
    return {
      sketch: createSketchTexture("ENTER", { w: 512, h: 640 }),
      painted: createPaintedTexture("ENTER", { w: 512, h: 640, accent: "#c82924" }),
    };
  }, []);
  const { sketch: rightSketch, painted: rightPainted } = useMemo(() => {
    if (typeof document === "undefined") return { sketch: null, painted: null } as any;
    return {
      sketch: createSketchTexture("HERE", { w: 512, h: 640 }),
      painted: createPaintedTexture("HERE", { w: 512, h: 640, accent: "#dfaf49" }),
    };
  }, []);

  const leftMat = useMemo(() => {
    if (!leftSketch || !leftPainted) return null;
    const m = createPaintRevealMaterial(leftSketch, leftPainted, { progress: 0 });
    leftMatRef.current = m;
    return m;
  }, [leftSketch, leftPainted]);
  const rightMat = useMemo(() => {
    if (!rightSketch || !rightPainted) return null;
    const m = createPaintRevealMaterial(rightSketch, rightPainted, { progress: 0 });
    rightMatRef.current = m;
    return m;
  }, [rightSketch, rightPainted]);

  useFrame(() => {
    if (!leftMatRef.current || !rightMatRef.current) return;
    const target = hovered ? 1 : 0;
    leftMatRef.current.uniforms.uProgress.value += (target - leftMatRef.current.uniforms.uProgress.value) * 0.08;
    rightMatRef.current.uniforms.uProgress.value += (target - rightMatRef.current.uniforms.uProgress.value) * 0.08;
  });

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    // animate doors opening
    if (leftGroup.current && rightGroup.current) {
      const tl = gsap.timeline({ onComplete });
      tl.to(leftGroup.current.rotation, { y: Math.PI * 0.52, duration: 0.85, ease: "power3.inOut" }, 0);
      tl.to(rightGroup.current.rotation, { y: -Math.PI * 0.52, duration: 0.85, ease: "power3.inOut" }, 0);
      tl.to(leftGroup.current.position, { x: -0.4, duration: 0.85, ease: "power3.inOut" }, 0);
      tl.to(rightGroup.current.position, { x: 0.4, duration: 0.85, ease: "power3.inOut" }, 0);
    } else {
      onComplete();
    }
  };

  // brick wall behind doors (paper sketch)
  const wallTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f0ece2";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.strokeStyle = "rgba(26,26,26,0.12)";
    ctx.lineWidth = 1.2;
    for (let y = 0; y < 512; y += 64) {
      for (let x = (y % 128 === 0 ? 0 : 64); x < 1024; x += 128) {
        ctx.strokeRect(x + 1, y + 1, 126, 62);
      }
    }
    ctx.fillStyle = "rgba(26,26,26,0.07)";
    ctx.fillRect(0, 0, 1024, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={position}>
      {/* back wall */}
      {wallTex && (
        <mesh position={[0, 1.2, -0.35]}>
          <planeGeometry args={[7, 3.6]} />
          <meshBasicMaterial map={wallTex} transparent opacity={0.95} />
        </mesh>
      )}
      {/* floor paper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0.6]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial color="#e8e2d6" />
      </mesh>
      {/* Sign above doors: SM 2026 */}
      <group position={[0, 2.05, 0.02]}>
        <mesh>
          <planeGeometry args={[1.6, 0.5]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
        {/* sketch sign border */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.6, 0.5)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
      </group>

      {/* Double doors */}
      <group
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* left door */}
        <group ref={leftGroup} position={[-0.66, 0.3, 0]}>
          <mesh material={leftMat ?? undefined} position={[0, 0, 0]}>
            <planeGeometry args={[1.28, 2.55]} />
          </mesh>
          {/* handle */}
          <mesh position={[0.48, -0.1, 0.06]}>
            <circleGeometry args={[0.07, 16]} />
            <meshBasicMaterial color={hovered ? "#c82924" : "#1a1a1a"} />
          </mesh>
          {/* frame edge */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.28, 2.55)]} />
            <lineBasicMaterial color="#1a1a1a" />
          </lineSegments>
        </group>
        {/* right door */}
        <group ref={rightGroup} position={[0.66, 0.3, 0]}>
          <mesh material={rightMat ?? undefined} position={[0, 0, 0]}>
            <planeGeometry args={[1.28, 2.55]} />
          </mesh>
          <mesh position={[-0.48, -0.1, 0.06]}>
            <circleGeometry args={[0.07, 16]} />
            <meshBasicMaterial color={hovered ? "#dfaf49" : "#1a1a1a"} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.28, 2.55)]} />
            <lineBasicMaterial color="#1a1a1a" />
          </lineSegments>
        </group>
        {/* top beam */}
        <mesh position={[0, 1.68, 0.02]}>
          <boxGeometry args={[2.8, 0.18, 0.12]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* instruction */}
      {/* 3D text via plane is enough; DOM overlay handles details */}
    </group>
  );
}
