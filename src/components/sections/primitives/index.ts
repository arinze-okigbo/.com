/**
 * Content components — `docs/04 §8.2`.
 *
 * These live here rather than in `src/components/ui/` because their prop
 * contracts encode copy rules (R11, R16, R21, R22, R23) rather than generic
 * styling. `src/components/ui/` owns the generic primitives they compose.
 */
export {
  ContactBlock,
  type ContactBlockProps,
} from "@/components/sections/primitives/ContactBlock";
export { CredentialsLine } from "@/components/sections/primitives/CredentialsLine";
export { Hero, type HeroProps } from "@/components/sections/primitives/Hero";
export { Lede } from "@/components/sections/primitives/Lede";
export {
  ProjectEntry,
  type ProjectEntryProps,
} from "@/components/sections/primitives/ProjectEntry";
export { ResumeAffordance } from "@/components/sections/primitives/ResumeAffordance";
export { RichText } from "@/components/sections/primitives/RichText";
export { WorkEntry, type WorkEntryProps } from "@/components/sections/primitives/WorkEntry";
