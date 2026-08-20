#!/usr/bin/env node
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
const BASE = "https://santionispirits.com";
const CONCURRENCY = 8;
const TIMEOUT_MS = 60_000;
const MANIFEST = join(OUT, "manifest.json");

const UIL_URL = `${BASE}/assets/data/uil.1782836328290.json`;

const EXTRA = [
  ...["woff2", "woff", "otf"].map((f) => `assets/fonts/CharlesRosie.${f}`),
  ...["woff2", "woff", "otf"].map((f) => `assets/fonts/PPNikkeiMaru-Regular.${f}`),
  ...["woff2", "woff", "otf"].map((f) => `assets/fonts/PPNikkeiMaru-Ultrabold.${f}`),
  ...["woff2", "woff", "otf"].map((f) => `assets/fonts/GT-Era-Text-Light.${f}`),
  "assets/js/app.1782836328290.js",
  "assets/data/uil.1782836328290.json",
  "assets/favicon/favicon.svg",
  "assets/social/og.png",
];

const EXT_RE = /\.(png|jpe?g|bin|json|hdr|ktx2|gltf|glb|webp|svg|mp3|wav|woff2?|otf|ttf)$/i;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { buf, len: buf.length };
  } finally {
    clearTimeout(t);
  }
}

function normalize(path) {
  let p = path.split("?")[0].trim();
  if (p.startsWith("./")) p = p.slice(2);
  if (p.startsWith("assets/")) return p;
  if (EXT_RE.test(p)) return `assets/images/${p}`;
  return null;
}

async function collectPaths() {
  const paths = new Set();
  const uil = await fetchText(UIL_URL);
  for (const m of uil.matchAll(/"((?:src|filename))":"([^"]+)"/g)) {
    const p = normalize(m[2]);
    if (p) paths.add(p);
  }
  for (const p of EXTRA) paths.add(normalize(p));
  return [...paths].sort();
}

async function exists(p) {
  try {
    const s = await stat(p);
    return s.size > 0;
  } catch {
    return false;
  }
}

function rel(path) {
  return path.startsWith("assets/") ? path.slice("assets/".length) : path;
}

async function downloadOne(path, entries) {
  const file = rel(path);
  const dest = join(OUT, file);
  if (await exists(dest)) {
    entries.push({ url: `${BASE}/${path}`, file, status: "skipped" });
    return;
  }
  const { buf } = await fetchBuffer(`${BASE}/${path}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  entries.push({ url: `${BASE}/${path}`, file, bytes: buf.length, status: "ok" });
}

async function pool(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try {
        await fn(item);
      } catch (e) {
        console.error(`FAIL ${item}: ${e.message}`);
      }
    }
  });
  await Promise.all(workers);
}

async function extractTheme() {
  const html = await fetchText(`${BASE}/`);
  const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const dir = join(OUT, "_theme");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html);
  if (css) await writeFile(join(dir, "theme.css"), css);
  return { html: html.length, css: css.length };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const paths = await collectPaths();
  console.log(`collecting ${paths.length} assets -> ${relative(ROOT, OUT)}/`);
  const entries = [];
  await pool(paths, CONCURRENCY, (p) => downloadOne(p, entries));
  const theme = await extractTheme();
  entries.push({ file: "_theme/index.html", bytes: theme.html });
  entries.push({ file: "_theme/theme.css", bytes: theme.css });
  await writeFile(MANIFEST, JSON.stringify(Object.fromEntries(entries.map((e) => [e.file, e])), null, 2));

  const ok = entries.filter((e) => e.status === "ok" || e.file.startsWith("_theme"));
  const skipped = entries.filter((e) => e.status === "skipped");
  const total = entries.reduce((a, e) => a + (e.bytes ?? 0), 0);
  console.log(`downloaded: ${ok.length}  skipped(existing): ${skipped.length}`);
  console.log(`new bytes: ${(total / 1024 / 1024).toFixed(1)} MB  manifest: assets/manifest.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});