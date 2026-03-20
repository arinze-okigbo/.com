import { AboutSection } from "@/components/sections/AboutSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { CurrentWorkSection } from "@/components/sections/CurrentWorkSection";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { HeroSection } from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <CurrentWorkSection />
      <FeaturedProjectsSection />
      <ExperienceTimeline />
      <AchievementsSection />
      <ContactSection />
    </>
  );
}
