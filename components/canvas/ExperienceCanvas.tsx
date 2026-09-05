"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useScene } from "@/context/SceneContext";
import { usePerformance } from "@/context/PerformanceContext";
import useInfiniteCamera from "@/hooks/useInfiniteCamera";
import InfiniteCorridorManager from "./corridor/InfiniteCorridorManager";
import EntranceDoors from "./entrance/EntranceDoors";
import GalleryRoom from "./rooms/GalleryRoom";
import StudioRoom from "./rooms/StudioRoom";
import AboutRoom from "./rooms/AboutRoom";
import ContactRoom from "./rooms/ContactRoom";

function SceneBackground() {
  const { scene } = useThree();
  const paperTex = (() => {
    try {
      // cloned paper texture for perfect itom fidelity; fallback to color if not loaded
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const t = new THREE.TextureLoader().load("/textures/paper-texture.webp");
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 3);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    } catch {
      return null;
    }
  })();
  useEffect(() => {
    if (paperTex) {
      scene.background = paperTex;
    } else {
      scene.background = new THREE.Color("#faf8f3");
    }
    scene.fog = new THREE.Fog("#faf8f3", 22, 58);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, paperTex]);
  return null;
}

function RoomRenderer({
  room,
  scrollOffset,
}: {
  room: string | null;
  scrollOffset: number;
}) {
  if (room === "gallery") return <GalleryRoom scrollOffset={scrollOffset} />;
  if (room === "studio") return <StudioRoom scrollOffset={scrollOffset} />;
  if (room === "about") return <AboutRoom scrollOffset={scrollOffset} />;
  if (room === "contact") return <ContactRoom />;
  return null;
}

function InsideExperience({ onReady }: { onReady: () => void }) {
  const { hasEntered, markEntered, currentRoom, isInRoom, isTeleporting, enterRoom, exitRoom } = useScene();
  const { settings } = usePerformance();
  const { camera } = useThree();
  const [roomScroll, setRoomScroll] = useState(0);
  const readyFired = useRef(false);

  // warmup delay to simulate shader compile
  useEffect(() => {
    const t = setTimeout(() => {
      if (!readyFired.current) {
        readyFired.current = true;
        onReady();
      }
    }, 900);
    return () => clearTimeout(t);
  }, [onReady]);

  const { setCameraOverride } = useInfiniteCamera({
    segmentLength: 80,
    scrollSpeed: 0.025,
    parallaxIntensity: 0.45,
    smoothing: 0.06,
    scrollEnabled: hasEntered && !isInRoom && !isTeleporting,
    parallaxEnabled: hasEntered && !isInRoom && !isTeleporting,
  });

  // Handle room scroll when inside room (About parallax, Gallery etc)
  useEffect(() => {
    if (!isInRoom) return;
    const onWheel = (e: WheelEvent) => {
      setRoomScroll((s) => {
        const ns = s + e.deltaY * 0.015;
        return Math.max(0, Math.min(ns, 40));
      });
    };
    const onTouch = (() => {
      let lastY = 0;
      return {
        start(e: TouchEvent) { lastY = e.touches[0].clientY; },
        move(e: TouchEvent) {
          const dy = lastY - e.touches[0].clientY;
          lastY = e.touches[0].clientY;
          setRoomScroll((s) => Math.max(0, Math.min(s + dy * 0.035, 40)));
        },
      };
    })();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouch.start, { passive: true });
    window.addEventListener("touchmove", onTouch.move, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch.start);
      window.removeEventListener("touchmove", onTouch.move);
    };
  }, [isInRoom]);

  // Keyboard exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isInRoom) handleExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isInRoom]);

  const handleEntranceComplete = useCallback(() => {
    markEntered();
    // slight camera push forward as if walking through
    gsap.to(camera.position, { z: 8, duration: 1.1, ease: "power3.inOut" });
  }, [markEntered, camera]);

  const handleDoorEnter = useCallback(
    (id: string) => {
      setCameraOverride(true);
      // flight anim: nudge towards door then to room pos
      const doorZ = camera.position.z - 6; // approx
      gsap.to(camera.position, {
        z: doorZ,
        x: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          enterRoom(id as any);
          // then fly into room offset
          gsap.to(camera.position, {
            z: -18,
            x: 0,
            y: 1.6,
            duration: 0.85,
            ease: "power3.inOut",
            onComplete: () => {
              setCameraOverride(false);
              // reset camera to room roaming (room scroll will be wheel-driven)
              // For rooms, we keep camera static at z=-18 looking forward, room content moves via scrollOffset
              gsap.set(camera.rotation, { x: 0, y: 0, z: 0 });
            },
          });
          gsap.to(camera.rotation, { y: 0, x: 0, duration: 0.5 });
        },
      });
    },
    [camera, enterRoom, setCameraOverride]
  );

  const handleExit = useCallback(() => {
    setCameraOverride(true);
    // fade out, fly back to corridor roughly where you entered
    gsap.to(camera.position, {
      z: 6,
      x: 0,
      y: 1.6,
      duration: 0.85,
      ease: "power3.inOut",
      onComplete: () => {
        exitRoom();
        setRoomScroll(0);
        // place back near last door approx
        gsap.to(camera.position, { z: 2, duration: 0.5, ease: "power2.out", onComplete: () => setCameraOverride(false) });
      },
    });
  }, [camera, exitRoom, setCameraOverride]);

  return (
    <>
      <SceneBackground />
      {/* lighting: baked -> just ambient */}
      <ambientLight intensity={1.15} />

      {/* Entrance */}
      {!hasEntered && <EntranceDoors position={[0, 0, 22]} onComplete={handleEntranceComplete} />}

      {/* Corridor */}
      <InfiniteCorridorManager
        onDoorEnter={handleDoorEnter}
        hideDoorsForSegments={hasEntered ? [] : [-1]}
        setCameraOverride={setCameraOverride}
      />

      {/* Rooms - only when in room or teleporting */}
      {(isInRoom || isTeleporting) && (
        <group>
          <RoomRenderer room={currentRoom} scrollOffset={roomScroll} />
        </group>
      )}

      {/* exit hotspot handled via DOM button, not 3D */}
      {isInRoom && (
        <mesh position={[0, 0.9, -2]} onClick={handleExit} visible={false}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </>
  );
}

export default function ExperienceCanvas({ onSceneReady }: { onSceneReady?: () => void }) {
  const { tier, settings } = usePerformance();
  const [ready, setReady] = useState(false);
  const { hasEntered, isInRoom } = useScene();

  const handleReady = useCallback(() => {
    setReady(true);
    onSceneReady?.();
  }, [onSceneReady]);

  return (
    <div className="fixed inset-0 h-[100svh] w-screen bg-[#faf8f3]">
      <Canvas
        dpr={settings.dpr as any}
        camera={{ fov: 58, position: [0, 1.6, 28], near: 0.1, far: 100 }}
        gl={{
          antialias: settings.antialias,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <InsideExperience onReady={handleReady} />
        </Suspense>
      </Canvas>

      {/* Exit button when in room */}
      {isInRoom && (
        <button
          onClick={() => {
            // trigger via DOM event that InsideExperience listens? For simplicity reload exit logic via custom event
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-ink/15 bg-paper px-6 py-3 text-techno text-xs tracking-[0.25em] text-ink shadow-lg transition hover:bg-ink hover:text-paper"
        >
          ← BACK TO CORRIDOR [ESC]
        </button>
      )}

      {/* Minimal HUD when not entered */}
      {!hasEntered && ready && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-30 -translate-x-1/2 text-center">
          <span className="text-techno text-[10px] tracking-[0.3em] text-ink/50">CLICK DOORS TO ENTER • SCROLL TO WALK • HOVER TO PAINT</span>
        </div>
      )}

      {/* Corridor HUD when entered */}
      {hasEntered && !isInRoom && (
        <div className="pointer-events-none fixed bottom-6 left-6 z-30 hidden sm:block">
          <div className="rounded-full border border-ink/10 bg-paper/90 px-4 py-2 text-[10px] tracking-[0.28em] text-ink/60 backdrop-blur">WALK ↓ SCROLL • LOOK ↔ MOVE MOUSE • TILT PHONE</div>
        </div>
      )}
    </div>
  );
}
