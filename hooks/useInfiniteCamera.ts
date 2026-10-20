"use client";

import { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAchievements } from "@/context/AchievementsContext";
import { depthStore } from "@/lib/depthStore";

gsap.registerPlugin(Observer);

const DOOR_POSITIONS = [
  { z: -18, side: "left" as const },
  { z: -32, side: "right" as const },
  { z: -48, side: "left" as const },
  { z: -62, side: "right" as const },
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
  const velocity = useRef(0); // glide momentum (z units / s)
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
      velocity.current = 0;
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

  // wheel / touch observer
  useEffect(() => {
    if (!scrollEnabled) return;
    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: 1,
      onChangeY(self) {
        if (cameraOverride.current || !scrollEnabledRef.current) return;
        // wheel/touch down (positive deltaY) moves camera forward (z decreases)
        const impulse = -self.deltaY * scrollSpeed * 0.12;
        targetZ.current = THREE.MathUtils.clamp(targetZ.current + impulse, -2000, 30);
        // glide momentum: keeps coasting briefly after the wheel stops
        velocity.current += impulse * 0.9;
        if (Math.abs(self.deltaY) > 1) unlockAchievement("corridor_explore");
      },
    });
    // keyboard
    const onKey = (e: KeyboardEvent) => {
      if (cameraOverride.current || !scrollEnabledRef.current) return;
      if (["ArrowUp", "ArrowDown", " ", "PageUp", "PageDown"].includes(e.key)) {
        e.preventDefault();
      }
      const step = 6;
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        targetZ.current += step;
        velocity.current += 3;
      }
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        targetZ.current -= step;
        velocity.current -= 3;
      }
      targetZ.current = THREE.MathUtils.clamp(targetZ.current, -2000, 30);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.kill();
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

    // glide momentum — coast briefly after input stops (Lenis-like)
    if (Math.abs(velocity.current) > 0.004) {
      targetZ.current = THREE.MathUtils.clamp(targetZ.current + velocity.current * dt, -2000, 30);
      velocity.current *= Math.exp(-3.4 * dt);
    } else {
      velocity.current = 0;
    }

    // frame-rate independent damping (feels identical at 60 vs 120 Hz)
    const kZ = 1 - Math.exp(-smoothing * dt);
    currentZ.current += (targetZ.current - currentZ.current) * kZ;
    const z = currentZ.current;
    camera.position.z = z;
    depthStore.set(Math.max(0, Math.round(28 - z)));

    // segment
    const seg = Math.floor((10 - z) / segmentLength);
    if (seg !== currentSegment.current) currentSegment.current = seg;

    // parallax lerp
    const kP = 1 - Math.exp(-5.2 * dt);
    parallax.current.x += (targetParallax.current.x - parallax.current.x) * kP;
    parallax.current.y += (targetParallax.current.y - parallax.current.y) * kP;

    // subtle walking bob, amplitude tied to current speed
    const speed = Math.abs(targetZ.current - z) + Math.abs(velocity.current);
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
