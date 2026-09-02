"use client";

import * as THREE from "three";

// Procedural sketch vs painted textures — no external WebPs needed
// Paper base + ink hatching for sketch, warm color wash for painted

function makeCanvas(w = 512, h = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // warm eggshell paper
  ctx.fillStyle = "#faf8f3";
  ctx.fillRect(0, 0, w, h);
  // subtle grain noise
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = Math.random() * 1.2;
    ctx.fillStyle = Math.random() > 0.5 ? "#c9c2b5" : "#fff";
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;
  // border vignette fiber
  ctx.strokeStyle = "rgba(26,26,26,0.06)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function drawHatch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = "rgba(26,26,26,0.85)";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  // cross-hatch
  for (let y = 20; y < h - 20; y += 18) {
    ctx.beginPath();
    ctx.moveTo(12 + Math.random() * 6, y + Math.random() * 4);
    ctx.lineTo(w - 12 - Math.random() * 6, y + Math.random() * 4);
    ctx.stroke();
  }
  // vertical light hatching
  ctx.strokeStyle = "rgba(26,26,26,0.18)";
  ctx.lineWidth = 0.7;
  for (let x = 24; x < w; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, h - 18);
    ctx.stroke();
  }
  // torn edge wobble
  ctx.strokeStyle = "rgba(26,26,26,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < w; x += 8) {
    const y = 10 + Math.sin(x * 0.04) * 3 + Math.random() * 2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let x = 0; x < w; x += 8) {
    const y = h - 10 + Math.sin(x * 0.05) * 3 + Math.random() * 2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function createSketchTexture(
  label: string,
  opts?: { w?: number; h?: number; accent?: string }
): THREE.CanvasTexture {
  const w = opts?.w ?? 512;
  const h = opts?.h ?? 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  drawPaper(ctx, w, h);
  drawHatch(ctx, w, h);

  // centered label as hand-drawn
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // hand-drawn faux font via stroke + fill
  ctx.font = `700 ${Math.floor(w * 0.09)}px Georgia, serif`;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(26,26,26,0.9)";
  const lines = label.split("\n");
  const lh = Math.floor(w * 0.11);
  const startY = h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((line, i) => {
    const y = startY + i * lh;
    // sketch shadow offset
    ctx.fillStyle = "rgba(26,26,26,0.12)";
    ctx.fillText(line, w / 2 + 2, y + 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.strokeText(line, w / 2, y);
    ctx.fillText(line, w / 2, y);
  });

  // small corner doodle
  ctx.strokeStyle = "rgba(26,26,26,0.45)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(18, h - 28);
  ctx.quadraticCurveTo(w * 0.25, h - 18, w * 0.45, h - 30);
  ctx.stroke();
  ctx.fillStyle = "rgba(26,26,26,0.5)";
  ctx.font = `400 ${Math.floor(w * 0.035)}px monospace`;
  ctx.fillText("✎ sketch", w * 0.22, h - 14);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function createPaintedTexture(
  label: string,
  opts?: { w?: number; h?: number; accent?: string }
): THREE.CanvasTexture {
  const accent = opts?.accent ?? "#c82924";
  const w = opts?.w ?? 512;
  const h = opts?.h ?? 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  // paper base
  drawPaper(ctx, w, h);
  // color wash
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.8);
  grad.addColorStop(0, accent + "22");
  grad.addColorStop(0.45, accent + "18");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // warm paint bleed blobs
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = accent;
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 40 + Math.random() * 90;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // ink outline still visible under paint
  ctx.strokeStyle = "rgba(26,26,26,0.55)";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  // label in accent + paper
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.floor(w * 0.095)}px sans-serif`;
  const lines = label.split("\n");
  const lh = Math.floor(w * 0.11);
  const startY = h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((line, i) => {
    const y = startY + i * lh;
    // painted label: white with accent shadow for punch
    ctx.fillStyle = accent;
    ctx.fillText(line, w / 2 + 1.5, y + 1.5);
    ctx.fillStyle = "#ffffff";
    // subtle paper texture under text via composite
    ctx.fillText(line, w / 2, y);
    // thin ink outline
    ctx.strokeStyle = "rgba(26,26,26,0.85)";
    ctx.lineWidth = 1.2;
    ctx.strokeText(line, w / 2, y);
  });
  // accent corner tag
  ctx.fillStyle = accent;
  ctx.font = `700 ${Math.floor(w * 0.032)}px monospace`;
  ctx.fillText("● painted", w * 0.23, h - 14);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

// Specific generators for corridor elements
export function createWallSketchTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  drawPaper(ctx, 1024, 512);
  // plank lines
  ctx.strokeStyle = "rgba(26,26,26,0.14)";
  ctx.lineWidth = 1;
  for (let y = 32; y < 512; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 4);
    ctx.lineTo(1024, y + Math.random() * 4);
    ctx.stroke();
  }
  // nail dots
  ctx.fillStyle = "rgba(26,26,26,0.12)";
  for (let x = 80; x < 1024; x += 160) {
    for (let y = 60; y < 512; y += 120) {
      ctx.beginPath();
      ctx.arc(x + Math.random() * 6, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createWallPaintedTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  drawPaper(ctx, 1024, 512);
  // warm light wash
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "rgba(223,175,73,0.08)");
  g.addColorStop(1, "rgba(200,41,36,0.06)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  // plank hint
  ctx.strokeStyle = "rgba(26,26,26,0.08)";
  for (let y = 32; y < 512; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createFloorTexture(): THREE.CanvasTexture {
  const c = makeCanvas(512, 512);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#e8e2d6";
  ctx.fillRect(0, 0, 512, 512);
  // wood planks sketch
  ctx.strokeStyle = "rgba(26,26,26,0.18)";
  ctx.lineWidth = 1.2;
  for (let x = 40; x < 512; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.random() * 4, 512);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(26,26,26,0.08)";
  for (let y = 0; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 4);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createCeilingTexture(): THREE.CanvasTexture {
  const c = makeCanvas(512, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fdfcf8";
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = "rgba(26,26,26,0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
