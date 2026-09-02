"use client";

import { useState, useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CorridorSegment, { SEGMENT_LENGTH } from "./CorridorSegment";

function SegmentVisibilityWrapper({ children, segmentIndex }: { children: React.ReactNode; segmentIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const startZ = 10 - segmentIndex * SEGMENT_LENGTH;
  const endZ = startZ - SEGMENT_LENGTH;

  useFrame(() => {
    if (!groupRef.current) return;
    const isBehind = camera.position.z < endZ - 5;
    const isFarAhead = camera.position.z > startZ + 30;
    const visible = !(isBehind || isFarAhead);
    if (groupRef.current.visible !== visible) groupRef.current.visible = visible;
  });

  return <group ref={groupRef as any}>{children}</group>;
}

export default function InfiniteCorridorManager({
  onDoorEnter,
  hideDoorsForSegments = [],
  setCameraOverride,
}: {
  onDoorEnter: (id: string) => void;
  hideDoorsForSegments?: number[];
  setCameraOverride?: (v: boolean) => void;
}) {
  const { camera } = useThree();
  const [activeSegments, setActiveSegments] = useState([0, 1]);

  const getSegment = useCallback((z: number) => Math.floor((10 - z) / SEGMENT_LENGTH), []);

  useFrame(() => {
    const cur = getSegment(camera.position.z);
    const should = [cur - 1, cur, cur + 1];
    const needs = should.some((s) => !activeSegments.includes(s)) || activeSegments.some((s) => !should.includes(s));
    if (needs) setActiveSegments(should);
  });

  return (
    <group>
      {activeSegments.map((idx) => (
        <SegmentVisibilityWrapper key={`wrap-${idx}`} segmentIndex={idx}>
          <CorridorSegment
            key={`seg-${idx}`}
            segmentIndex={idx}
            onDoorEnter={onDoorEnter as any}
            hideSegmentDoors={hideDoorsForSegments.includes(idx)}
            setCameraOverride={setCameraOverride}
          />
        </SegmentVisibilityWrapper>
      ))}
    </group>
  );
}
