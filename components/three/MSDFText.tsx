"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import createLayout from "layout-bmfont-text";

const msdfVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const msdfFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D map;
  uniform vec3 color;
  uniform float opacity;
  float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
  }
  void main() {
    vec3 sample = texture2D(map, vUv).rgb;
    float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
    float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha * opacity);
  }
`;

type MSDFTextProps = {
  children: string;
  color?: string;
  opacity?: number;
  position?: [number, number, number];
  width?: number;
  letterSpacing?: number;
  maxWidth?: number;
};

export default function MSDFText({
  children,
  color = "#ffffff",
  opacity = 0.22,
  position = [0, 0, -3],
  width = 6,
  letterSpacing = 0,
  maxWidth,
}: MSDFTextProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atlas = useLoader(THREE.TextureLoader, "/msdf/nikkei-ultra.png");
  const fontData = useLoader(THREE.FileLoader, "/msdf/nikkei-ultra.json");

  const font = useMemo(() => JSON.parse(fontData as string), [fontData]);

  const { geometry, scale } = useMemo(() => {
    const layout = createLayout({
      font,
      text: children,
      size: font.info.size,
      letterSpacing,
      align: "center",
      ...(maxWidth != null ? { maxWidth } : {}),
    });

    const glyphs = layout.glyphs.filter((g) => g.data && g.data.width * g.data.height > 0);
    const texW = font.common.scaleW;
    const texH = font.common.scaleH;

    const positions = new Float32Array(glyphs.length * 4 * 2);
    const uvs = new Float32Array(glyphs.length * 4 * 2);
    const indices: number[] = [];
    let pi = 0;
    let ui = 0;
    let vi = 0;

    glyphs.forEach((g) => {
      const b = g.data;
      const x = g.position[0] + b.xoffset;
      const y = g.position[1] + b.yoffset;
      const w = b.width;
      const h = b.height;

      positions.set([x, y, x, y + h, x + w, y + h, x + w, y], pi);
      pi += 8;

      const u0 = b.x / texW;
      const u1 = (b.x + w) / texW;
      const v1 = (texH - b.y) / texH;
      const v0 = (texH - b.y - h) / texH;
      uvs.set([u0, v1, u0, v0, u1, v0, u1, v1], ui);
      ui += 8;

      indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      vi += 4;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 2));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    const bb = geo.boundingBox!;
    const cx = (bb.min.x + bb.max.x) / 2;
    const cy = (bb.min.y + bb.max.y) / 2;
    geo.translate(-cx, -cy, 0);
    geo.computeBoundingSphere();

    const textWidth = bb.max.x - bb.min.x;
    const s = textWidth > 0 ? width / textWidth : 1;

    return { geometry: geo, scale: s };
  }, [font, children, letterSpacing, maxWidth, width]);

  const material = useMemo(() => {
    atlas.colorSpace = THREE.NoColorSpace;
    atlas.needsUpdate = true;
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: atlas },
        color: { value: new THREE.Color(color) },
        opacity: { value: opacity },
      },
      vertexShader: msdfVertex,
      fragmentShader: msdfFragment,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.01,
    });
  }, [atlas, color, opacity]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.y = Math.sin(t * 0.15) * 0.08;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
    />
  );
}