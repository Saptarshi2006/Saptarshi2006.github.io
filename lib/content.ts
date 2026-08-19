export const identity = {
  name: "Saptarshi Mukherjee",
  monogram: "SM",
  role: "Full-Stack Engineer",
  tagline: "Full-Stack Engineer building AI-native products",
  location: "Kolkata, India",
  email: "saptarshi.mukherjee.dev@gmail.com",
  github: "https://github.com/Saptarshi2006",
  linkedin: "https://www.linkedin.com/in/saptarshi-mukherjee-6a2b20280/",
};

export type Project = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  tagline: string;
  description: string;
  stack: string[];
  url: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: "cartis",
    index: "01",
    title: "Cartis",
    eyebrow: "AI FINANCIAL COACH",
    tagline: "See the future of your money.",
    description:
      "An AI financial coaching platform that reads your real money — wallet, budget, spending pace, business health — and delivers a buy-or-wait verdict before every financial decision. A browser extension watches product pages as you shop; a full-stack dashboard tracks budget, cashflow, goals, portfolio and taxes with an AI Financial Advisor at its core.",
    stack: ["Rust", "Axum", "Cloudflare Workers", "Next.js", "React", "Gleam", "Python", "PostgreSQL", "GraphQL"],
    url: "https://cartis.dpdns.org",
    accent: "#dfaf49",
  },
  {
    id: "fitmentor",
    index: "02",
    title: "FitMentor",
    eyebrow: "AI FITNESS COACH",
    tagline: "Your pocket fitness coach.",
    description:
      "An AI-powered fitness coach built for Indian beginners. Personalized workout plans, affordable Indian meal plans, daily habit tracking, and a real-time AI coach chat streamed over WebSockets — wrapped in a PWA and a native Android app.",
    stack: ["TanStack Start", "Vite", "React", "Rust", "Axum", "SQLx", "Gleam", "Mist", "Redis", "React Native"],
    url: "https://fitmentor-7lx.pages.dev",
    accent: "#6dd993",
  },
  {
    id: "synapse",
    index: "03",
    title: "Synapse",
    eyebrow: "CAMPUS PORTAL",
    tagline: "One campus. Every connection.",
    description:
      "A complete campus platform for Adamas University — verified department chat rooms, an AI campus assistant with RAG over campus docs, a Canvas/WebGL campus map with AI navigation and live bus tracking, punch-in location tracking, notices and a photobooth. A product-design and systems-architecture case study.",
    stack: ["Next.js", "Expo", "NestJS", "PostgreSQL", "Redis", "Prisma", "Socket.io", "OpenAI", "WebGL", "Razorpay"],
    url: "",
    accent: "#6fccfb",
  },
];

export const skills = [
  { name: "Rust", note: "AXUM · SQLX · GRAPHQL · TOKIO" },
  { name: "TypeScript", note: "NEXT.JS · REACT · NODE" },
  { name: "WebGL", note: "THREE.JS · R3F · GLSL" },
  { name: "Python", note: "FASTAPI · PANDAS · SCIKIT" },
  { name: "Gleam", note: "MIST · WEBSOCKETS" },
  { name: "Cloud", note: "WORKERS · FLY.IO · PAGES" },
  { name: "DB", note: "POSTGRES · REDIS · D1 · TIGERBEETLE" },
  { name: "GraphQL", note: "ASYNC-GRAPHQL · APOLLO" },
];

export const marquee = ["BUILD", "SHIP", "LEARN", "REPEAT"];

export const socials = [
  { label: "GitHub", href: "https://github.com/Saptarshi2006" },
  { label: "LinkedIn", href: identity.linkedin },
  { label: "Email", href: `mailto:${identity.email}` },
];

export const nav = [
  { label: "About", target: "about" },
  { label: "Stack", target: "skills" },
  { label: "Work", target: "works" },
  { label: "Contact", target: "contact" },
];
