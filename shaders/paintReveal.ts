"use client";

import * as THREE from "three";

// PaintReveal: sketch -> painted blend with organic noise edge
// Inspired by itomdev's PaintRevealMaterial but rewritten for Next/R3F

export const paintRevealVertex = /* glsl */ `
  varying vec2 vMapUv;
  void main() {
    vMapUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const paintRevealFragment = /* glsl */ `
  uniform sampler2D uMapSketch;
  uniform sampler2D uMapPainted;
  uniform float uProgress;
  uniform float uOpacity;
  varying vec2 vMapUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float paintNoise(vec2 uv) {
    return noise(uv) * 0.5 + noise(uv*2.0)*0.25 + noise(uv*4.0)*0.25;
  }

  void main() {
    vec4 sketch = texture2D(uMapSketch, vMapUv);
    vec4 painted = texture2D(uMapPainted, vMapUv);
    
    vec4 color = sketch;
    if (uProgress > 0.001) {
      float rn = paintNoise(vMapUv * 12.0) * 0.18;
      // Reveal from bottom, with diagonal bias for organic feel
      float maskValue = (1.0 - vMapUv.y) * 0.85 + vMapUv.x * 0.15 + rn;
      float threshold = uProgress * 1.35;
      // soft edge: smoothstep over 0.12
      float edge = smoothstep(threshold - 0.08, threshold + 0.08, maskValue);
      // edge < threshold => show painted, else sketch. Invert for blend:
      // If maskValue < threshold => painted already reached
      float isPainted = 1.0 - edge;
      // Actually we want maskValue < threshold = painted
      // So mix: sketch -> painted by (1-edge)
      // edge=0 when mask < thresh (far), edge=1 when mask > thresh (not yet)
      // so painted amount = 1-edge
      color = mix(sketch, painted, 1.0 - edge);
      // Alternative hard threshold保留 for crisp line, but smooth is prettier:
      // if (maskValue < threshold) color = painted;
    }
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
  }
`;

export function createPaintRevealMaterial(
  sketchTex: THREE.Texture,
  paintedTex: THREE.Texture,
  opts?: { progress?: number; opacity?: number }
) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMapSketch: { value: sketchTex },
      uMapPainted: { value: paintedTex },
      uProgress: { value: opts?.progress ?? 0 },
      uOpacity: { value: opts?.opacity ?? 1 },
    },
    vertexShader: paintRevealVertex,
    fragmentShader: paintRevealFragment,
    transparent: true,
    side: THREE.DoubleSide,
  });
  // Ensure textures correct colorspace
  sketchTex.colorSpace = THREE.SRGBColorSpace;
  paintedTex.colorSpace = THREE.SRGBColorSpace;
  sketchTex.needsUpdate = true;
  paintedTex.needsUpdate = true;
  return mat;
}

// Helper to extend existing MeshStandardMaterial via onBeforeCompile (closer to original ITOM approach)
// Useful when you want to keep standard lighting but inject paint logic
export function applyPaintRevealOnBeforeCompile(
  material: THREE.MeshStandardMaterial,
  sketchTex: THREE.Texture,
  paintedTex: THREE.Texture,
  progressRef: { value: number }
) {
  sketchTex.colorSpace = THREE.SRGBColorSpace;
  paintedTex.colorSpace = THREE.SRGBColorSpace;
  // @ts-ignore inject custom uniforms
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uProgress = { value: progressRef.value };
    shader.uniforms.uMapPainted = { value: paintedTex };
    shader.uniforms.uMapSketch = { value: sketchTex };
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <common>`,
      `#include <common>
       uniform float uProgress;
       uniform sampler2D uMapPainted;
       uniform sampler2D uMapSketch;
       varying vec2 vMapUv;
       float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123);}
       float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
       float paintNoise(vec2 uv){ return noise(uv)*0.5+noise(uv*2.0)*0.25+noise(uv*4.0)*0.25;}
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      `#include <common>`,
      `#include <common>\nvarying vec2 vMapUv;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      `#include <uv_vertex>`,
      `#include <uv_vertex>\n vMapUv = uv;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <map_fragment>`,
      `
      #ifdef USE_MAP
        vec4 sCol = texture2D(map, vMapUv);
        if(uProgress > 0.001){
          vec4 pCol = texture2D(uMapPainted, vMapUv);
          float rn = paintNoise(vMapUv*15.0)*0.15;
          float maskValue = (1.0 - vMapUv.y) + rn;
          float threshold = uProgress * 1.5;
          if(maskValue < threshold){
            diffuseColor = vec4(pCol.rgb, 1.0);
          } else {
            diffuseColor = vec4(sCol.rgb, 1.0);
          }
        } else {
          diffuseColor *= sCol;
        }
      #endif
      `
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (material as any).__paintShader = shader;
  };
  return material;
}
