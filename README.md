# Portfolio — Saptarshi Mukherjee

An immersive, scroll-driven 3D portfolio inspired by the interactive storytelling of
[santionispirits.com](https://santionispirits.com/) (Active Theory's Hydrax engine).

Dark, cinematic scenes walk through three shipped products — **Cartis**, **FitMentor** and
**Synapse** — with a gaze-following camera, custom GLSL shaders (noise, moon, portal),
procedural 3D objects, particle systems, split-character typography reveals, and a custom cursor.

## Stack

- **Next.js 16** (App Router) — static export
- **Three.js** via `@react-three/fiber` + `@react-three/drei`
- **GSAP** + **ScrollTrigger** + **SplitText** — story engine
- **Lenis** — smooth scrolling
- **Zustand** — UI state
- **Tailwind CSS v4** — styling
- Fonts: Fraunces (Google), Clash Display + General Sans (Fontshare)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → ./out
npm run lint
```

## Deploying to GitHub Pages

This repo is designed to deploy as a **user site** (a repo named `<username>.github.io`)
served from the root — no `basePath` is required.

1. Push this repo to a repository named `Saptarshi2006.github.io`.
2. In repo **Settings → Pages**, set **Source → GitHub Actions** (the workflow
   `.github/workflows/deploy.yml` handles the rest on every push to `main`).

The `.nojekyll` file is included so GitHub Pages doesn't skip the `_next` build directory.

## Structure

```
app/            layout, metadata, root page (renders <Experience />)
components/
  Experience.tsx    client root — Lenis + GSAP boot, section tracking
  scenes/           Hero, About, Stack, Work index, 3 case studies, marquee, contact
  three/            procedural 3D objects (moon, coin, dumbbell, portal)
  fx/               GazeCamera, CanvasStage, shaders, particles, RevealText
  ui/               Loader, custom cursor, header menu, footer
lib/            content, zustand store, GSAP/Lenis bootstrap, hooks
```

## Notes

- The eslint config disables the React Compiler-era `react-hooks/refs`, `immutability`,
  `purity` and `set-state-in-effect` rules — they produce false positives for the imperative
  Three.js/GSAP mutation patterns this site intentionally uses.
