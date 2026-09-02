import type { NextConfig } from "next";

// On GitHub Pages project site (saptarshi.portfolio), assets must be served under /saptarshi.portfolio/
// User site Saptarshi2006.github.io is served at root, so no basePath.
const isProjectPages = process.env.GITHUB_REPOSITORY === "Saptarshi2006/saptarshi.portfolio";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isProjectPages
    ? {
        basePath: "/saptarshi.portfolio",
        assetPrefix: "/saptarshi.portfolio/",
      }
    : {}),
};

export default nextConfig;
