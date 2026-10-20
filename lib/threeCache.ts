import * as THREE from "three";

// Shared geometry cache. R3F reference-compares `args`, so passing the SAME
// geometry instance across renders avoids recreating (and disposing) GPU
// buffers every time a component re-renders.
const cache = new Map<string, THREE.BufferGeometry>();

function memo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const g = make();
  cache.set(key, g);
  return g;
}

export const planeGeom = (w: number, h: number) =>
  memo(`p:${w}:${h}`, () => new THREE.PlaneGeometry(w, h));

export const circleGeom = (r: number, seg: number) =>
  memo(`c:${r}:${seg}`, () => new THREE.CircleGeometry(r, seg));

export const cylinderGeom = (rt: number, rb: number, h: number, seg: number) =>
  memo(`y:${rt}:${rb}:${h}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));

export const planeEdges = (w: number, h: number) =>
  memo(`pe:${w}:${h}`, () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)));

export const circleEdges = (r: number, seg: number) =>
  memo(`ce:${r}:${seg}`, () => new THREE.EdgesGeometry(new THREE.CircleGeometry(r, seg)));

export const cylinderEdges = (rt: number, rb: number, h: number, seg: number) =>
  memo(`ye:${rt}:${rb}:${h}:${seg}`, () => new THREE.EdgesGeometry(new THREE.CylinderGeometry(rt, rb, h, seg)));
