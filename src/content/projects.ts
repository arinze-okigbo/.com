import type { ProjectEntryContent, SectionCopy } from "@/content/types";

/**
 * Projects — `docs/05 §3.4`.
 *
 * Splita and the Queralt authentication research are deliberately NOT repeated
 * here; both already hold first-class work entries. "QX509" is not used as a
 * label anywhere on this site (`docs/05 §11 Q10`) — the string appears in exactly
 * one line of the repo and is corroborated nowhere.
 *
 * [R28] GitHub is linked, never featured: no activity graph, no repo grid.
 */
export const PROJECTS: SectionCopy = {
  id: "projects",
  headingId: "projects-heading",
  heading: "Open-source: SkyView layers live flight traffic on a photorealistic 3D globe.",
  intro: "Built outside of work, running in a browser, openable now.",
};

export const projectEntries: readonly ProjectEntryContent[] = [
  {
    id: "skyview",
    artifact: "SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles",
    // `[00 §3/L86]` — the only project in the repo with a real, absolute GitHub link.
    href: "https://github.com/arinze-okigbo/sky-view",
    // [R11] 8 words.
    mechanism: "Vite and Cesium over Google Photorealistic 3D Tiles.",
    body: [
      "It layers flight traffic, airports, landmarks, optional weather and satellite feeds, and the interface to drive them onto the globe.",
      // OMITTED: the technical-judgment clause `docs/03 A3` asks for — why Cesium
      // and Google Photorealistic 3D Tiles rather than Mapbox/deck.gl/three.js, or
      // what the hard part of the live-traffic layer was. Tracked as
      // `docs/05 §11 Q9`. `[00 §3/L86]` describes what SkyView does, never why it
      // was built that way, so no sentence is written rather than an inferred one.
      // Append it here as body[1] when supplied.
    ],
    meta: "Open source · github.com/arinze-okigbo/sky-view",
  },
];
