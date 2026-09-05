"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useTexture } from "@react-three/drei";
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

  // Perfect clone: use real itom entrance door sketches, but label via Saptarshi's initials implicitly via hover paint (keeps hand-drawn fidelity)
  const leftPair = useTexture(["/textures/doors/door_left_sketch.webp", "/textures/doors/door_right_sketch.webp"]) as unknown as [THREE.Texture, THREE.Texture];
  // reuse door_left/right as left/right enter — both paint to wooden texture on hover via our reveal (second = warm)
  const rightPair = useTexture(["/textures/corridor/doors/doorrleft.webp", "/textures/corridor/doors/dorright.webp"]) as unknown as [THREE.Texture, THREE.Texture];
  // Actually use door_left_sketch as sketch, dorright as painted for contrast
  const leftSketch = leftPair[0];
  const leftPainted = leftPair[1];
  const rightSketch = rightPair[0];
  const rightPainted = rightPair[1];
  leftSketch.colorSpace = THREE.SRGBColorSpace;
  leftPainted.colorSpace = THREE.SRGBColorSpace;
  rightSketch.colorSpace = THREE.SRGBColorSpace;
  rightPainted.colorSpace = THREE.SRGBColorSpace;

  const leftMat = useMemo(() => {
    const m = createPaintRevealMaterial(leftSketch, leftPainted, { progress: 0 });
    leftMatRef.current = m;
    return m;
  }, [leftSketch, leftPainted]);
  const rightMat = useMemo(() => {
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

  // Perfect clone: real brick + stone path textures
  const wallTex = useTexture("/textures/entrance/wall_bricks_2.webp");
  wallTex.colorSpace = THREE.SRGBColorSpace;
  const stoneTex = useTexture("/textures/entrance/stone-path.webp");
  stoneTex.colorSpace = THREE.SRGBColorSpace;
  stoneTex.wrapS = THREE.RepeatWrapping;
  stoneTex.wrapT = THREE.RepeatWrapping;
  stoneTex.repeat.set(1, 1);

  return (
    <group position={position}>
      {/* back wall — cloned brick */}
      <mesh position={[0, 1.2, -0.35]}>
        <planeGeometry args={[7, 3.6]} />
        <meshBasicMaterial map={wallTex} transparent opacity={0.97} />
      </mesh>
      {/* floor — cloned stone path + paper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0.6]}>
        <planeGeometry args={[7, 4]} />
        <meshBasicMaterial map={stoneTex} />
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
