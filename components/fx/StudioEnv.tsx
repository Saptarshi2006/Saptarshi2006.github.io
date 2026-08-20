"use client";

import { Environment } from "@react-three/drei";

export default function StudioEnv() {
  return <Environment files="/env/studio.hdr" environmentIntensity={0.5} />;
}