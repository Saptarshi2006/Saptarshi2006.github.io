import localFont from "next/font/local";

const charlesRosie = localFont({
  src: "../assets/fonts/CharlesRosie.woff2",
  variable: "--font-charles-rosie",
  weight: "400",
  display: "swap",
});

const nikkeiUltra = localFont({
  src: "../assets/fonts/PPNikkeiMaru-Ultrabold.woff2",
  variable: "--font-nikkei-ultra",
  weight: "800",
  display: "swap",
});

const gtEraLight = localFont({
  src: "../assets/fonts/GT-Era-Text-Light.woff2",
  variable: "--font-gt-era",
  weight: "200",
  display: "swap",
});

export const fontVariables = `${charlesRosie.variable} ${nikkeiUltra.variable} ${gtEraLight.variable}`;