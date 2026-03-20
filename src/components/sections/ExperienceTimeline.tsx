"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ExperienceCard } from "@/components/ExperienceCard";

const experiences = [
  {
    role: "Co-Founder & CEO",
    company: "Splita",
    period: "Aug 2025 - Present",
    description:
      "Leading vision, product strategy, fundraising, and go-to-market for a social fintech platform that makes group payments simple, fair, and seamless.",
    tags: ["Fintech", "Founder", "Product", "Fundraising"],
    details: [
      "Oversee user research, product development, branding, and strategic partnerships.",
      "Built Splita around an upfront-share model where each user pays first and the platform pays vendors in full.",
      "Driving launch strategy, growth initiatives, and long-term company direction.",
    ],
    logo: "/logos/splita.png",
  },
  {
    role: "Software Developer Intern",
    company: "Queralt Inc.",
    period: "Jun 2025 - Present",
    description:
      "Led R&D on browser-native, selectable authentication across Microsoft Entra ID and internet-integrated identity environments.",
    tags: ["Cybersecurity", "FIDO2", "PKI", "Zero Trust"],
    details: [
      "Analyzed integration pathways across Entra ID CBA, WHfB credential providers, Graph API, WebAuthn/FIDO2, and Windows Hello APIs.",
      "Mapped credential enrollment, activation, and passwordless login journeys for Chrome and Edge on Windows and macOS.",
      "Developed proof-of-concept browser-based certificate authentication workflows and deployment flows with Intune, PKCS/SCEP, and Conditional Access.",
    ],
    logo: "/logos/queralt.jpeg",
  },
  {
    role: "AI Expert Contributor (DevOps)",
    company: "Snorkel AI",
    period: "Dec 2025 - Present",
    description:
      "Supporting model development and evaluation pipelines through structured validation of AI-generated outputs across DevOps and infrastructure workflows.",
    tags: ["AI", "LLMs", "DevOps", "Evaluation"],
    details: [
      "Evaluate output quality, failure modes, and correctness in engineering-adjacent workflows.",
      "Provide structured feedback used to improve reliability, robustness, and performance.",
      "Contribute within production-oriented pipelines used to refine large-scale AI systems.",
    ],
    logo: "/logos/snorkel.jpeg",
  },
  {
    role: "Web Developer",
    company: "AFRIG Mag",
    period: "Jul 2025 - Present",
    description:
      "Designed and developed the official site for AFRIG Mag from concept to launch with a focus on UX, performance, and accessibility.",
    tags: ["Web Dev", "Frontend", "Performance", "UX"],
    details: [
      "Built a responsive and visually engaging platform for a global audience.",
      "Managed architecture, multimedia integration, and frontend implementation.",
      "Optimized performance while preserving editorial brand identity.",
    ],
    logo: "/logos/afrig.avif",
  },
  {
    role: "AI Trainer",
    company: "Alignerr & Outlier",
    period: "Jun 2024 - Present",
    description:
      "Evaluating AI-generated code and real-world software workflows across enterprise and coding contexts.",
    tags: ["AI", "Copilot", "Code Eval", "Systems"],
    details: [
      "Worked on Microsoft Copilot video GenAI-related tasks through screen-shared workflow evaluation.",
      "Assessed generated code quality and wrote human-readable rationale summaries.",
      "Contributed to model improvement through practical software and systems judgment.",
    ],
    logo: "/logos/alignerr.jpeg",
  },
  {
    role: "Student Leadership",
    company: "Trinity College",
    period: "Aug 2024 - Present",
    description:
      "Serving across technology, athletics, entrepreneurship, and computer science communities while studying Computer Science.",
    tags: ["Leadership", "CS", "Athletics", "Campus"],
    details: [
      "Student Advisory Board Member for Library Information and Technology Services (LITS).",
      "Track & Field Representative on the Student-Athlete Advisory Committee (SAAC).",
      "Member of the Entrepreneurship Club, Computer Science Club, and Varsity Track & Field team.",
    ],
    logo: "/logos/trinity.jpeg",
  },
  {
    role: "2025 Youth Delegate",
    company: "World Bank Group Youth Summit",
    period: "May 2025",
    description:
      "Represented youth-led innovation through public speaking, policy discussion, and collaborative development work.",
    tags: ["Global", "Policy", "Innovation", "Speaking"],
    details: [
      "Delivered a speech on the role of Africa’s youth in building a global hub for innovation and technology.",
      "Participated in a fireside chat on crypto and digital currencies in development.",
      "Co-led a team presenting a sustainable fashion and SME initiative in the Innovation Lab.",
    ],
    logo: "/logos/worldbank.jpeg",
  },
  {
    role: "Founder & CEO",
    company: "TechBuzz",
    period: "Feb 2022 - Jul 2024",
    description:
      "Built and led a media platform focused on the intersection of technology and society.",
    tags: ["Founder", "Media", "Content", "Leadership"],
    details: [
      "Developed, built and updated the website, ensuring a seamless user experience.",
      "Led writers, editorial direction, website development, communications, and growth.",
      "Managed technical and operational execution across the platform.",
      "Built a strong foundation in storytelling, audience-building, and digital product execution.",
    ],
    logo: "/logos/techbuzz.jpeg",
  },
  {
    role: "Volunteer",
    company: "Zooniverse (NASA AI4Mars)",
    period: "May 2020 - Jun 2023",
    description:
      "Contributed to machine learning training efforts supporting Mars rover terrain understanding.",
    tags: ["AI", "NASA", "ML", "Data"],
    details: [
      "Helped train AI systems through large-scale data labeling and analysis.",
      "Gained early exposure to practical machine learning workflows in space exploration contexts.",
    ],
    logo: "/logos/zooniverse.jpeg",
  },
  {
    role: "Intern",
    company: "Ventures Platform Fund",
    period: "Apr 2018 - May 2018",
    description:
      "Gained early exposure to startup operations, cybersecurity, and venture-backed innovation in Nigeria.",
    tags: ["Startups", "Cybersecurity", "Africa", "Operations"],
    details: [
      "Worked with startup teams on data security, server management, and operational support.",
      "Learned directly inside a fast-paced African tech incubator environment.",
    ],
    logo: "/logos/venturesplatform.jpeg",
  },
];

export function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 20%", "end 80%"],
  });

  const lineHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  });

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative overflow-x-clip py-24"
    >
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
            Experience
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Building across fintech, AI, security, media, and leadership.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-foreground/70 md:text-base">
            A curated timeline of founder, engineering, research, and leadership work across startups,
            AI systems, cybersecurity, education, and global innovation.
          </p>
        </div>

        <div className="relative">
          {/* timeline rail */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-white/10 md:block" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-4 top-0 hidden w-px bg-gradient-to-b from-white/80 via-white/40 to-transparent md:block"
          />

          <div className="space-y-6 md:space-y-8">
            {experiences.map((item, index) => (
              <div key={`${item.company}-${item.role}-${index}`} className="relative md:pl-12">
                <div className="absolute left-[9px] top-8 hidden h-3 w-3 rounded-full border border-white/20 bg-black md:block" />
                <div className="absolute left-[9px] top-8 hidden h-3 w-3 rounded-full bg-white/70 blur-[6px] md:block" />

                <ExperienceCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}