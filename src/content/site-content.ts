import { Briefcase, Cpu, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type ContactLink = {
  label: string;
  href: string;
  value: string;
};

export type CurrentWorkItem = {
  org: string;
  role: string;
  period: string;
  summary: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#current-work" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const currentWork: CurrentWorkItem[] = [
  {
    org: "Splita",
    role: "Co-Founder & CEO",
    period: "2025 – Present",
    summary:
      "Building a coordination-first fintech platform that collects each participant’s share upfront to remove friction and risk from group payments. Raised early commitments toward a $200K pre-seed and onboarding initial users.",
    href: "https://splita.co",
    icon: Sparkles,
  },
  {
    org: "Snorkel AI",
    role: "AI Contributor (DevOps)",
    period: "2024 – Present",
    summary:
      "Working on production AI evaluation workflows, improving LLM output quality and reliability through structured feedback and system-level analysis.",
    href: "https://snorkel.ai",
    icon: Cpu,
  },
  {
    org: "Queralt Inc.",
    role: "Software Developer Intern",
    period: "2025 – Present",
    summary:
      "Leading R&D on browser-native authentication using FIDO2, PKI, and Microsoft Entra ID to enable secure, passwordless identity systems.",
    href: "https://www.queraltinc.com",
    icon: ShieldCheck,
  },
  {
    org: "Trinity College",
    role: "B.S. Computer Science",
    period: "2024 – 2028",
    summary:
      "Studying software development while building real systems across AI, security, and fintech.",
    href: "https://www.trincoll.edu",
    icon: Briefcase,
  },
];

export const featuredProjects = [
  {
    title: "Splita",
    summary:
      "A fintech platform that simplifies group payments by collecting everyone’s share upfront and paying vendors in full.",
    tags: ["Fintech", "Payments", "Startup"],
    href: "https://splita.co",
  },
  {
    title: "QX509 Authentication Research",
    summary:
      "Exploration of certificate-based identity, FIDO2, and enterprise PKI to replace password-based authentication systems.",
    tags: ["Security", "PKI", "Authentication"],
    href: "https://github.com/arinze-okigbo",
  },
  {
    title: "AI Systems Evaluation",
    summary:
      "Evaluated and improved AI-generated outputs in real-world workflows, focusing on reliability, consistency, and production readiness.",
    tags: ["AI", "LLMs", "Evaluation"],
    href: "https://github.com/arinze-okigbo",
  },
];

export const achievements = [
  {
    title: "Pre-Seed Fundraising (Splita)",
    detail:
      "Secured early commitments toward a $200K pre-seed round from institutional and fellowship sources.",
  },
  {
    title: "Tyree Innovation & Entrepreneurship Fellow",
    detail:
      "Selected for Trinity’s entrepreneurship fellowship and winner of internal pitch and hackathon competitions.",
  },
  {
    title: "World Bank Youth Summit Delegate (2025)",
    detail:
      "Contributed to global discussions on youth innovation and development.",
  },
  {
    title: "Builder Across AI, Security, and Fintech",
    detail:
      "Hands-on experience spanning AI systems, authentication infrastructure, and startup product development.",
  },
];

export const contactLinks: ContactLink[] = [
  {
    label: "Email",
    href: "mailto:arinze@splita.co",
    value: "arinze@splita.co",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/arinzeokigbo",
    value: "linkedin.com/in/arinzeokigbo",
  },
  {
    label: "GitHub",
    href: "https://github.com/arinze-okigbo",
    value: "github.com/arinze-okigbo",
  },
  {
    label: "X",
    href: "https://x.com/arinzeokigbo",
    value: "x.com/arinzeokigbo",
  },
];