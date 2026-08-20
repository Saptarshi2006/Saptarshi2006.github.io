import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saptarshi Mukherjee — Full-Stack Engineer",
  description:
    "Saptarshi Mukherjee is a full-stack engineer building AI-powered products. Cartis, FitMentor and Synapse — built to ship, shipped to learn.",
  metadataBase: new URL("https://saptarshi2006.github.io"),
  openGraph: {
    title: "Saptarshi Mukherjee — Full-Stack Engineer",
    description:
      "Immersive portfolio of Saptarshi Mukherjee. AI financial coaching, fitness coaching and campus platform case studies.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Saptarshi Mukherjee — Full-Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saptarshi Mukherjee — Full-Stack Engineer",
    description: "Immersive portfolio of Saptarshi Mukherjee.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
