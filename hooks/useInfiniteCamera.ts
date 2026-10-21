"use client";

import { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import gsap from "gsap";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAchievements } from "@/context/AchievementsContext";
import { depthStore } from "@/lib/depthStore";

const DOOR_POSITIONS = [
  { z: -18, side: "left" as const, label: "GALLERY" },
  { z: -32, side: "right" as const, label: "STUDIO" },
  { z: -48, side: "left" as const, label: "ABOUT" },
  { z: -62, side: "right" as const, label: "CONTACT" },
];

export default function useInfiniteCamera({
  segmentLength = 80,
  scrollSpeed = 0.025,
  parallaxIntensity = 0.4,
  // exponential damping rate (1/s) — frame-rate independent
  smoothing = 4.2,
  glanceIntensity = 0.15,
  scrollEnabled = true,
  parallaxEnabled = true,
}: {
  segmentLength?: number;
  scrollSpeed?: number;
  parallaxIntensity?: number;
  smoothing?: number;
  glanceIntensity?: number;
  scrollEnabled?: boolean;
  parallaxEnabled?: boolean;
} = {}) {
  const { camera } = useThree();
  const targetZ = useRef(28);
  const currentZ = useRef(28);
  const parallax = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });
  const glanceOffset = useRef(0);
  const targetGlance = useRef(0);
  const currentSegment = useRef(0);
  const scrollEnabledRef = useRef(scrollEnabled);
  const parallaxEnabledRef = useRef(parallaxEnabled);
  const cameraOverride = useRef(false);
  const { unlockAchievement } = useAchievements();

  // expose override setter
  const setCameraOverride = useCallback((v: boolean) => {
    cameraOverride.current = v;
  }, []);

  useLayoutEffect(() => {
    const was = scrollEnabledRef.current;
    scrollEnabledRef.current = scrollEnabled;
    parallaxEnabledRef.current = parallaxEnabled;
    if (scrollEnabled && !was) {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera.rotation);
      targetZ.current = camera.position.z;
      currentZ.current = camera.position.z;
      parallax.current = { x: camera.position.x, y: camera.position.y - 0.2 };
      targetParallax.current = { x: camera.position.x, y: camera.position.y - 0.2 };
      // init glance correctly
      const g = calculateGlance(currentZ.current, Math.floor((10 - currentZ.current) / segmentLength));
      glanceOffset.current = g;
      targetGlance.current = g;
      currentSegment.current = Math.floor((10 - currentZ.current) / segmentLength);
    }
  }, [scrollEnabled, parallaxEnabled, camera, segmentLength]);

  function calculateGlance(z: number, segIdx: number): number {
    let total = 0;
    // door positions are relative to segment start (10)
    const START_DIST = 12;
    const PEAK_DIST = 4;
    const END_DIST = -6;
    for (const door of DOOR_POSITIONS) {
      // Actually doors are at z = 10 - seg*80 + offset ; simpler: door.z is offset inside segment (negative forward)
      // So global door Z = 10 - seg*80 + door.z
      // For current segment only, but for glance we want any door in range
      // Let's compute for each door in current segment only
      const gZ = 10 - segIdx * segmentLength + door.z;
      const dist = z - gZ;
      let strength = 0;
      if (dist > PEAK_DIST && dist < START_DIST) {
        strength = (START_DIST - dist) / (START_DIST - PEAK_DIST);
      } else if (dist <= PEAK_DIST && dist > END_DIST) {
        strength = (dist - END_DIST) / (PEAK_DIST - END_DIST);
      }
      if (strength > 0) {
        const eased = strength * (2 - strength);
        const dir = door.side === "left" ? -1 : 1;
        total = dir * eased * glanceIntensity;
        // closest door wins — break after first strong
        break;
      }
    }
    return total;
  }

  // wheel / touch — native listeners with exact deltas.
  // (GSAP Observer was multiplying deltas by its internal deltaFactor,
  // causing ~30x overscroll and runaway motion.)
  useEffect(() => {
    if (!scrollEnabled) return;

    const applyImpulse = (deltaY: number) => {
      if (cameraOverride.current || !scrollEnabledRef.current) return;
      if (!Number.isFinite(deltaY) || deltaY === 0) return;
      // wheel/touch up (negative deltaY) moves forward; clamp per-event
      // magnitude so a single event can never launch the camera
      const raw = -deltaY * scrollSpeed * 0.32;
      const impulse = THREE.MathUtils.clamp(raw, -3, 3);
      targetZ.current = THREE.MathUtils.clamp(targetZ.current + impulse, -2000, 30);
      if (Math.abs(deltaY) > 1) unlockAchievement("corridor_explore");
    };

    const onWheel = (e: WheelEvent) => {
      if (cameraOverride.current || !scrollEnabledRef.current) return;
      e.preventDefault();
      // normalize line-mode deltas (Firefox) to pixels
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      applyImpulse(e.deltaY * scale);
    };

    let lastTouchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (cameraOverride.current || !scrollEnabledRef.current) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouchY == null) return;
      applyImpulse((lastTouchY - y) * 2.2);
      lastTouchY = y;
    };
    const onTouchEnd = () => {
      lastTouchY = null;
    };

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      if (cameraOverride.current || !scrollEnabledRef.current) return;
      if (["ArrowUp", "ArrowDown", " ", "PageUp", "PageDown"].includes(e.key)) {
        e.preventDefault();
      }
      const step = 6;
      if (e.key === "ArrowUp" || e.key === "PageUp") targetZ.current += step;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") targetZ.current -= step;
      targetZ.current = THREE.MathUtils.clamp(targetZ.current, -2000, 30);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [scrollEnabled, scrollSpeed, unlockAchievement]);

  // mouse parallax
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (!parallaxEnabledRef.current || cameraOverride.current) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetParallax.current.x = nx * parallaxIntensity * 0.35;
      targetParallax.current.y = ny * parallaxIntensity * 0.25;
    };
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, [parallaxIntensity]);

  // gyroscope (mobile)
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (!parallaxEnabledRef.current || cameraOverride.current) return;
      if (e.gamma == null || e.beta == null) return;
      const gx = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
      const gy = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
      targetParallax.current.x = gx * parallaxIntensity * 0.4;
      targetParallax.current.y = -gy * parallaxIntensity * 0.2;
    };
    // request permission on iOS
    const maybeRequest = () => {
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        // @ts-ignore
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
      window.addEventListener("deviceorientation", onOrient);
    };
    window.addEventListener("click", maybeRequest, { once: true });
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [parallaxIntensity]);

  useFrame(({ clock }, rawDelta) => {
    if (cameraOverride.current) return;
    if (!scrollEnabledRef.current && !parallaxEnabledRef.current) return;

    const dt = Math.min(rawDelta, 0.08); // clamp tab-switch spikes
    const persp = camera as THREE.PerspectiveCamera;

    // spring toward input target only — no runaway momentum.
    // damping alone gives inertia, and it stops the moment you stop.
    const kZ = 1 - Math.exp(-smoothing * dt);
    currentZ.current += (targetZ.current - currentZ.current) * kZ;
    const z = currentZ.current;
    camera.position.z = z;

    // HUD: meters until the next door (meaningful navigation readout).
    // forward = decreasing z, so a door is AHEAD when doorZ < cameraZ.
    const seg = Math.floor((10 - z) / segmentLength);
    let bestDist = Infinity;
    let bestLabel = "CORRIDOR";
    for (let s = seg; s <= seg + 2; s++) {
      for (const d of DOOR_POSITIONS) {
        const dist = z - (10 - s * segmentLength + d.z); // positive = ahead
        if (dist > 0.5 && dist < bestDist) {
          bestDist = dist;
          bestLabel = d.label;
        }
      }
    }
    if (Number.isFinite(bestDist)) {
      depthStore.set(bestLabel, Math.max(0, Math.ceil(bestDist)));
    }

    if (seg !== currentSegment.current) currentSegment.current = seg;

    // parallax lerp
    const kP = 1 - Math.exp(-5.2 * dt);
    parallax.current.x += (targetParallax.current.x - parallax.current.x) * kP;
    parallax.current.y += (targetParallax.current.y - parallax.current.y) * kP;

    // subtle walking bob, amplitude tied to current speed
    const speed = Math.abs(targetZ.current - z);
    const bobAmp = Math.min(speed * 0.012, 0.03);
    const bob = Math.sin(clock.elapsedTime * 8.5) * bobAmp;

    camera.position.x = parallax.current.x;
    camera.position.y = 1.6 + parallax.current.y + bob;

    // glance
    const ideal = calculateGlance(z, seg);
    targetGlance.current = ideal;
    const kG = 1 - Math.exp(-4 * dt);
    glanceOffset.current += (targetGlance.current - glanceOffset.current) * kG;

    // apply rotations (slight yaw + pitch)
    const yaw = parallax.current.x * 0.28 + glanceOffset.current * 2.2;
    const pitch = parallax.current.y * 0.18 + Math.cos(clock.elapsedTime * 8.5) * bobAmp * 0.35;
    const kR = 1 - Math.exp(-5.5 * dt);
    camera.rotation.y += (yaw - camera.rotation.y) * kR;
    camera.rotation.x += (pitch - camera.rotation.x) * kR;
    camera.rotation.z = -parallax.current.x * 0.04;

    // FOV breathe toward doors (58 base)
    const targetFov = 58 + Math.abs(glanceOffset.current) * 16;
    if (Math.abs(persp.fov - targetFov) > 0.02) {
      persp.fov += (targetFov - persp.fov) * (1 - Math.exp(-3 * dt));
      persp.updateProjectionMatrix();
    }
  });

  return { setCameraOverride, targetZ, currentZ };
}
