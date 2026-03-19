/**
 * HOME PAGE — Arinze Okigbo Portfolio
 * 
 * Design: Noir Editorial
 * Swiss International Typographic Style meets Film Noir.
 * 
 * Structure:
 * 1. Navigation (scroll-aware)
 * 2. Hero (cinematic entrance)
 * 3. Animated line transition
 * 4. Projects (premium cards)
 * 5. Animated line transition
 * 6. Experience (timeline)
 * 7. Featured Moment (scroll-driven)
 * 8. About (asymmetric layout)
 * 9. Animated line transition
 * 10. Contact & Footer
 * 11. Grain overlay (global texture)
 */

import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { FeaturedMoment } from "@/components/FeaturedMoment";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { AnimatedLine } from "@/components/AnimatedLine";
import { GrainOverlay } from "@/components/GrainOverlay";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <Hero />
      <AnimatedLine />
      <Projects />
      <AnimatedLine />
      <Experience />
      <FeaturedMoment />
      <About />
      <AnimatedLine />
      <Contact />
      <GrainOverlay />
    </div>
  );
}
