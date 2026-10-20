"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer, CustomEase, SplitText);

gsap.defaults({ ease: "power3.out" });

export { gsap, ScrollTrigger, ScrollToPlugin, Observer, CustomEase, SplitText };
