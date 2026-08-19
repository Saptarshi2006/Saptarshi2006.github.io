import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saptarshi Mukherjee — Full-Stack Engineer",
  description:
    "Saptarshi Mukherjee is a full-stack engineer building AI-powered products. Cartis, FitMentor and Synapse — built to ship, shipped to learn.",
  openGraph: {
    title: "Saptarshi Mukherjee — Full-Stack Engineer",
    description:
      "Immersive portfolio of Saptarshi Mukherjee. AI financial coaching, fitness coaching and campus platform case studies.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@200,300,400,500,600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231d1d1d'/%3E%3Ctext x='50' y='68' font-size='56' font-family='Georgia,serif' fill='%23ffffff' text-anchor='middle'%3ESM%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
