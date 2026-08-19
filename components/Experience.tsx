"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { initLenis } from "@/lib/smooth";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useUI } from "@/lib/store";

import CustomCursor from "@/components/ui/CustomCursor";
import HeaderMenu from "@/components/ui/HeaderMenu";
import Loader from "@/components/ui/Loader";
import Footer from "@/components/ui/Footer";
import HeroScene from "@/components/scenes/HeroScene";
import AboutScene from "@/components/scenes/AboutScene";
import SkillsScene from "@/components/scenes/SkillsScene";
import WorksScene from "@/components/scenes/WorksScene";
import CartisScene from "@/components/scenes/CartisScene";
import FitMentorScene from "@/components/scenes/FitMentorScene";
import SynapseScene from "@/components/scenes/SynapseScene";
import CaseStudiesCard from "@/components/scenes/CaseStudiesCard";
import MarqueeScene from "@/components/scenes/MarqueeScene";
import ContactScene from "@/components/scenes/ContactScene";

export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const setActive = useUI((s) => s.setActive);
  const setReducedMotion = useUI((s) => s.setReducedMotion);

  useEffect(() => {
    setReducedMotion(reduced);
    if (reduced) return;

    initLenis();

    const triggers: ScrollTrigger[] = [];
    const sections = rootRef.current?.querySelectorAll<HTMLElement>("[data-scene]");
    sections?.forEach((section) => {
      const t = ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) setActive(section.id);
        },
      });
      triggers.push(t);
    });

    const onRefresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", onRefresh);
    return () => {
      window.removeEventListener("load", onRefresh);
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.lagSmoothing(1);
    };
  }, [setActive, setReducedMotion, reduced]);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-ink text-paper">
      <Loader />
      <CustomCursor />
      <HeaderMenu />
      <main className="relative">
        <HeroScene />
        <AboutScene />
        <SkillsScene />
        <WorksScene />
        <CartisScene />
        <FitMentorScene />
        <SynapseScene />
        <CaseStudiesCard />
        <MarqueeScene />
        <ContactScene />
      </main>
      <Footer />
    </div>
  );
}
