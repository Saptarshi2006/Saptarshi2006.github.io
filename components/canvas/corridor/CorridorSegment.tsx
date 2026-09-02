"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createWallSketchTexture, createWallPaintedTexture, createFloorTexture, createCeilingTexture, createSketchTexture, createPaintedTexture } from "@/lib/sketchTexture";
import { createPaintRevealMaterial } from "@/shaders/paintReveal";

export const SEGMENT_LENGTH = 80;

type DoorDef = { id: "gallery" | "studio" | "about" | "contact"; side: "left" | "right"; z: number; label: string; sub: string; accent: string };

const DOORS: DoorDef[] = [
  { id: "gallery", side: "left", z: -18, label: "GALLERY", sub: "01 — WORK", accent: "#dfaf49" },
  { id: "studio", side: "right", z: -32, label: "STUDIO", sub: "02 — SKILLS", accent: "#6dd993" },
  { id: "about", side: "left", z: -48, label: "ABOUT", sub: "03 — STORY", accent: "#6fccfb" },
  { id: "contact", side: "right", z: -62, label: "CONTACT", sub: "04 — TALK", accent: "#c82924" },
];

function Wall({ z, w, h, isLeft }: { z: number; w: number; h: number; isLeft: boolean }) {
  const tex = useMemo(() => createWallSketchTexture(), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }), [tex]);
  // sawtooth angled walls like itom: rotate slightly
  const rot = isLeft ? 0.08 : -0.08;
  const x = isLeft ? -2.9 : 2.9;
  return (
    <mesh position={[x, h / 2 - 0.2, z]} rotation={[0, rot, 0]} material={mat}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

function Floor({ z }: { z: number }) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : createFloorTexture()), []);
  if (!tex) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, z]}>
      <planeGeometry args={[6.2, SEGMENT_LENGTH]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}
function Ceiling({ z }: { z: number }) {
  const tex = useMemo(() => (typeof document === "undefined" ? null : createCeilingTexture()), []);
  if (!tex) return null;
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.8, z]}>
      <planeGeometry args={[6.2, SEGMENT_LENGTH]} />
      <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0.9} />
    </mesh>
  );
}

function Door({ def, globalZ, onEnter, setCameraOverride }: { def: DoorDef; globalZ: number; onEnter: (id: DoorDef["id"]) => void; setCameraOverride?: (v: boolean) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const hoverRef = useRef(false);
  const doorMeshRef = useRef<THREE.Mesh>(null);

  const { sketch, painted, mat } = useMemo(() => {
    if (typeof document === "undefined") return { sketch: null, painted: null, mat: null } as any;
    const sk = createSketchTexture(`${def.label}\n${def.sub}`, { w: 512, h: 640, accent: def.accent });
    const pt = createPaintedTexture(`${def.label}\n${def.sub}`, { w: 512, h: 640, accent: def.accent });
    const m = createPaintRevealMaterial(sk, pt, { progress: 0 });
    return { sketch: sk, painted: pt, mat: m };
  }, [def.label, def.sub, def.accent]);

  // keep ref
  if (mat && !matRef.current) matRef.current = mat;

  useFrame(() => {
    if (!matRef.current) return;
    const target = hoverRef.current ? 1 : 0;
    matRef.current.uniforms.uProgress.value += (target - matRef.current.uniforms.uProgress.value) * 0.09;
    // subtle tilt on hover
    if (groupRef.current) {
      const tilt = hoverRef.current ? (def.side === "left" ? -0.06 : 0.06) : 0;
      groupRef.current.rotation.y += (tilt - groupRef.current.rotation.y) * 0.08;
    }
  });

  const sideX = def.side === "left" ? -2.55 : 2.55;
  const sideRot = def.side === "left" ? 0.18 : -0.18; // angled into wall

  const handleClick = () => {
    hoverRef.current = false;
    // door open anim then enter
    if (doorMeshRef.current) {
      // simple handle swing, then call onEnter
      const tl = { progress: 0 };
      // GSAP-like manual?
      // Use import gsap dynamically to avoid SSR issues
      import("gsap").then(({ gsap }) => {
        // door swing
        if (groupRef.current) {
          gsap.to(groupRef.current.rotation, { y: def.side === "left" ? -0.65 : 0.65, duration: 0.55, ease: "power2.inOut" });
          gsap.to(groupRef.current.position, { x: sideX + (def.side === "left" ? -0.3 : 0.3), duration: 0.55, ease: "power2.inOut" });
        }
        setTimeout(() => onEnter(def.id), 600);
      });
    } else {
      onEnter(def.id);
    }
  };

  return (
    <group ref={groupRef} position={[sideX, 0.45, globalZ]} rotation={[0, sideRot, 0]}>
      {/* door frame sketch */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.45, 2.4]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.45, 2.4)]} />
        <lineBasicMaterial color="#1a1a1a" />
      </lineSegments>

      {/* main door plane with paint reveal */}
      <mesh
        ref={doorMeshRef}
        material={mat ?? undefined}
        onPointerEnter={() => (hoverRef.current = true)}
        onPointerLeave={() => (hoverRef.current = false)}
        onClick={handleClick}
      >
        <planeGeometry args={[1.28, 2.2]} />
      </mesh>

      {/* handle */}
      <mesh position={[def.side === "left" ? 0.45 : -0.45, -0.15, 0.06]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color={def.accent} />
      </mesh>
      {/* small plate */}
      <mesh position={[def.side === "left" ? 0.45 : -0.45, -0.05, 0.05]}>
        <planeGeometry args={[0.12, 0.22]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* floating label arrow */}
      <group position={[def.side === "left" ? 0.9 : -0.9, 0.35, 0.15]}>
        <mesh>
          <planeGeometry args={[0.55, 0.18]} />
          <meshBasicMaterial color="#faf8f3" transparent opacity={0.95} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.55, 0.18)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
      </group>

      {/* above door small sign */}
      <group position={[0, 1.38, 0.01]}>
        <mesh>
          <planeGeometry args={[0.9, 0.22]} />
          <meshBasicMaterial color="#faf8f3" />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.9, 0.22)]} />
          <lineBasicMaterial color="#1a1a1a" opacity={0.6} transparent />
        </lineSegments>
      </group>
    </group>
  );
}

function FrameArt({ z, side }: { z: number; side: "left" | "right" }) {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const labels = ["✦", "◎", "⬢", "⬣", "✿", "◆"];
    const l = labels[Math.floor(Math.random() * labels.length)];
    const sk = createSketchTexture(l, { w: 256, h: 320 });
    // we just use sketch as basic mat for art
    return sk;
  }, []);
  const x = side === "left" ? -2.2 : 2.2;
  const rot = side === "left" ? 0.12 : -0.12;
  if (!tex) return null;
  return (
    <group position={[x, 0.9, z]} rotation={[0, rot, 0]}>
      <mesh>
        <planeGeometry args={[0.62, 0.78]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(0.62, 0.78)]} />
        <lineBasicMaterial color="#1a1a1a" opacity={0.5} transparent />
      </lineSegments>
      {/* frame border */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.68, 0.84]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function CorridorLights({ z }: { z: number }) {
  // overhead sketch lamps
  return (
    <>
      <group position={[0, 2.45, z]}>
        <mesh>
          <planeGeometry args={[0.42, 0.42]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.09} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.42, 0.42)]} />
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
        {/* bulb */}
        <mesh position={[0, -0.12, 0.02]}>
          <circleGeometry args={[0.07, 12]} />
          <meshBasicMaterial color="#dfaf49" transparent opacity={0.55} />
        </mesh>
      </group>
      {/* beam line */}
      <mesh position={[0, 2.65, z]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6.2, 0.06]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

export default function CorridorSegment({
  segmentIndex,
  onDoorEnter,
  hideSegmentDoors,
  zClip,
  setCameraOverride,
}: {
  segmentIndex: number;
  onDoorEnter: (id: DoorDef["id"]) => void;
  hideSegmentDoors?: boolean;
  zClip?: number;
  setCameraOverride?: (v: boolean) => void;
}) {
  const startZ = 10 - segmentIndex * SEGMENT_LENGTH;
  // center of segment for floor
  const centerZ = startZ - SEGMENT_LENGTH / 2;

  // decorations between doors
  const decorZs = useMemo(() => {
    const arr: { z: number; side: "left" | "right" }[] = [];
    for (let i = 0; i < 3; i++) {
      const z = startZ - 10 - i * 18 - Math.random() * 6;
      arr.push({ z, side: i % 2 === 0 ? "right" : "left" });
    }
    return arr;
  }, [startZ]);

  return (
    <group>
      {/* floor & ceiling */}
      <Floor z={centerZ} />
      <Ceiling z={centerZ} />

      {/* walls - repeated planks */}
      <Wall z={centerZ} w={SEGMENT_LENGTH} h={3.2} isLeft />
      <Wall z={centerZ} w={SEGMENT_LENGTH} h={3.2} isLeft={false} />

      {/* lights every 18 units */}
      {[0, 1, 2, 3].map((i) => (
        <CorridorLights key={i} z={startZ - 8 - i * 18} />
      ))}

      {/* doors */}
      {!hideSegmentDoors &&
        DOORS.map((d) => (
          <Door
            key={`${segmentIndex}-${d.id}`}
            def={d}
            globalZ={startZ + d.z}
            onEnter={onDoorEnter}
            setCameraOverride={setCameraOverride}
          />
        ))}

      {/* frame art between doors */}
      {decorZs.map((d, i) => (
        <FrameArt key={i} z={d.z} side={d.side} />
      ))}

      {/* end double doors (visual) at segment boundary to suggest continuity */}
      <group position={[0, 0.3, startZ - SEGMENT_LENGTH + 0.5]}>
        <mesh>
          <planeGeometry args={[2.2, 2.55]} />
          <meshBasicMaterial color="#faf8f3" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.2, 2.55)]} />
          <lineBasicMaterial color="#1a1a1a" opacity={0.12} transparent />
        </lineSegments>
        <mesh position={[-0.55, 0, 0.02]}>
          <planeGeometry args={[1, 2.3]} />
          <meshBasicMaterial color="#faf8f3" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.55, 0, 0.02]}>
          <planeGeometry args={[1, 2.3]} />
          <meshBasicMaterial color="#faf8f3" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* subtle fog plane at far end to fake infinite depth */}
      <mesh position={[0, 0.8, startZ - SEGMENT_LENGTH]}>
        <planeGeometry args={[6, 3]} />
        <meshBasicMaterial color="#faf8f3" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}
