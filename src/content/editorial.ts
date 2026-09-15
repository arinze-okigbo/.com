/** Presentation copy grounded in the existing public site and linked public artifacts.
 * Research provenance lives in hive/research; product diagrams are explanatory illustrations.
 */
export type Project = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  problem: string;
  build: string;
  lesson: string;
  stack: string[];
  url: string;
  source: string;
  visual: "splita" | "auth" | "globe" | "hive";
};
export const projects: Project[] = [
  {
    slug: "splita",
    name: "Splita",
    eyebrow: "FINTECH / COMPANY",
    description: "A better beginning for group payments.",
    problem:
      "Organizing a group purchase means coordinating people and money. Splita puts collection before the purchase.",
    build:
      "Each person pays their share first. The platform then pays vendors in full. I lead vision, product strategy, user research, product development, branding, and partnerships.",
    lesson:
      "The product model starts with a clear sequence: collect the shares, then pay together.",
    stack: ["Group payments", "Product strategy", "User research"],
    url: "https://splita.co",
    source: "https://arinzeokigbo.com",
    visual: "splita",
  },
  {
    slug: "browser-authentication",
    name: "Browser-native identity",
    eyebrow: "SECURITY / RESEARCH",
    description: "Making passwordless authentication work across the browser boundary.",
    problem:
      "Browser-based certificate authentication crosses browsers, identity providers, and device credentials.",
    build:
      "At Queralt, I analyzed integration pathways across Microsoft Entra ID CBA, Windows Hello, Microsoft Graph, and WebAuthn/FIDO2. I mapped credential enrollment and passwordless login journeys for Chrome and Edge on Windows and macOS.",
    lesson:
      "The work connects protocol behavior to the enrollment, activation, and authentication journeys people actually use.",
    stack: ["FIDO2 / WebAuthn", "PKI", "Microsoft Entra ID", "Windows Hello"],
    url: "https://www.queraltinc.com",
    source: "https://arinzeokigbo.com",
    visual: "auth",
  },
  {
    slug: "skyview",
    name: "SkyView",
    eyebrow: "GEOSPATIAL / OPEN SOURCE",
    description: "The world, with another layer of context.",
    problem:
      "Flight traffic, airports, landmarks, and environmental feeds make more sense when they share a spatial frame.",
    build:
      "A browser-based 3D globe built with Vite and Cesium over Google Photorealistic 3D Tiles. It layers flight traffic, airports, landmarks, and optional weather and satellite feeds.",
    lesson:
      "The globe gives separate data layers a common interface. The public repository documents the implementation.",
    stack: ["Vite", "Cesium", "3D Tiles", "Live data"],
    url: "https://github.com/arinze-okigbo/sky-view",
    source: "https://github.com/arinze-okigbo/sky-view",
    visual: "globe",
  },
  {
    slug: "astra-hive",
    name: "This site, in public",
    eyebrow: "AI ORCHESTRATION / OPEN SOURCE",
    description: "A personal site. A working demonstration of an agent swarm.",
    problem:
      "A portfolio can describe technical work. It can also make its own construction inspectable.",
    build:
      "Specialist agents divide research, design, motion, implementation, and verification. Shared tasks, decisions, and a public changelog record the build. Next.js server components carry content; client boundaries carry interaction.",
    lesson:
      "Autonomy needs evidence: sourced content, readable changes, and verification recorded alongside the work.",
    stack: ["Next.js", "TypeScript", "Motion", "React Three Fiber"],
    url: "https://github.com/arinze-okigbo/.com",
    source: "https://github.com/arinze-okigbo/.com",
    visual: "hive",
  },
];
export const experience = [
  {
    org: "Splita",
    role: "Co-founder & CEO",
    period: "2025 —",
    body: "Building a commit-first group payments platform. Product vision, user research, development, branding, and partnerships.",
    href: "https://splita.co",
  },
  {
    org: "Queralt Inc.",
    role: "Browser authentication research",
    period: "2025 —",
    body: "Browser-based certificate authentication. Integration pathways across FIDO2, PKI, Microsoft Entra ID, and Windows Hello.",
    href: "https://www.queraltinc.com",
  },
  {
    org: "Snorkel AI",
    role: "AI output evaluation",
    period: "",
    body: "Structured validation of AI-generated outputs across DevOps and infrastructure workflows, with feedback on correctness and failure modes.",
    href: "https://snorkel.ai",
  },
  {
    org: "TechBuzz",
    role: "Founder",
    period: "2022 — 2024",
    body: "Built and maintained a technology-and-society media platform, led writers and editorial direction, and ran technical operations.",
    href: "https://arinzeokigbo.com",
  },
];
export const primarySource = "https://arinzeokigbo.com";

// Additional public builds, verified against cached repository READMEs this round.
projects.push(
  {
    slug: "nyc-live",
    name: "NYC Live",
    eyebrow: "CIVIC DATA / SYSTEMS",
    description: "One city. A shared service layer for its live signals.",
    problem:
      "Transit, camera, bike-share, weather, and civic records arrive through separate public systems.",
    build:
      "An MCP server exposes typed NYC data tools. A camera-density pipeline writes counts to DuckDB. A map dashboard consumes the same service layer for transit, Citi Bike, 311, weather, and cameras.",
    lesson:
      "The public README explicitly separates implemented adapters from upstream verification and camera-density gates. Missing data remains visible as a status.",
    stack: ["Python", "MCP", "DuckDB", "YOLO", "Live data"],
    url: "https://github.com/arinze-okigbo/nyc-live",
    source: "https://github.com/arinze-okigbo/nyc-live",
    visual: "globe",
  },
  {
    slug: "linkedin-plus",
    name: "LinkedIn+",
    eyebrow: "BROWSER TOOLING / OPEN SOURCE",
    description: "A small browser tool with its own interface boundary.",
    problem: "An in-page tool needs to coexist with the host page’s styles and changing DOM.",
    build:
      "A manually triggered JavaScript bookmarklet opens a Shadow DOM interface. The repository separates readable source, a minified distribution, and one-click installation.",
    lesson:
      "The README documents selector fragility and browser security restrictions. This public artifact is a bookmarklet; it is not presented as a released Chrome extension.",
    stack: ["JavaScript", "Shadow DOM", "Bookmarklet", "Terser"],
    url: "https://github.com/arinze-okigbo/linkedin-plus-bookmarklet",
    source: "https://github.com/arinze-okigbo/linkedin-plus-bookmarklet",
    visual: "auth",
  },
  {
    slug: "campus-bookshelf",
    name: "Campus Bookshelf",
    eyebrow: "CAMPUS / MARKETPLACE",
    description: "Keeping useful books moving through campus.",
    problem: "Students need a way to buy, sell, and exchange books with other students on campus.",
    build:
      "An early-stage student marketplace for book listings, local discovery, and exchange workflows. The public repository documents the product and its remaining roadmap.",
    lesson:
      "The public roadmap distinguishes planned authentication, messaging, and expanded discovery from the current project.",
    stack: ["TypeScript", "Campus marketplace"],
    url: "https://github.com/arinze-okigbo/tindext-v2",
    source: "https://github.com/arinze-okigbo/tindext-v2",
    visual: "hive",
  },
  {
    slug: "homework-chatbot",
    name: "Homework Chatbot",
    eyebrow: "AI / DEVELOPER TOOLS",
    description: "A study assistant with conversation context.",
    problem: "Study questions need different levels of explanation across different subjects.",
    build:
      "A FastAPI application connects to Gemini for homework assistance. The repository documents subject detection, explanation controls, session memory, and request limits.",
    lesson:
      "The project documents an optional Redis-backed session store and explicit request budgets.",
    stack: ["Python", "FastAPI", "Gemini", "Redis"],
    url: "https://github.com/arinze-okigbo/HomeworkAIChatBot",
    source: "https://github.com/arinze-okigbo/HomeworkAIChatBot",
    visual: "hive",
  },
  {
    slug: "library-management",
    name: "Library Management",
    eyebrow: "JAVA / APPLICATION",
    description: "A desktop library, from catalog to return.",
    problem:
      "A library interface must keep catalog, borrowing history, and availability in agreement.",
    build:
      "A Java Swing application with catalog search, borrowing and returns, user history, and book recommendations. Java serialization persists library data.",
    lesson:
      "The repository separates books, users, library operations, recommendations, and the GUI into distinct classes.",
    stack: ["Java", "Swing", "Serialization"],
    url: "https://github.com/arinze-okigbo/LibraryManagementSystem",
    source: "https://github.com/arinze-okigbo/LibraryManagementSystem",
    visual: "auth",
  },
  {
    slug: "scanner",
    name: "Scanner",
    eyebrow: "C / SYSTEMS",
    description: "A small scanner built around structured input.",
    problem: "Scanning tools turn input into a form that later processing can inspect.",
    build:
      "A C repository with a Makefile-based build and a structured scanning workflow. Its public README describes input analysis and modular organization.",
    lesson:
      "The source and build files are the artifact. The README leaves additional stack details unspecified, so they are omitted here.",
    stack: ["C", "Make"],
    url: "https://github.com/arinze-okigbo/Scanner",
    source: "https://github.com/arinze-okigbo/Scanner",
    visual: "auth",
  },
);
