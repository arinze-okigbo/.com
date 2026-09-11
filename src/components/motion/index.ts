/**
 * Public motion API.
 *
 * Everything another agent needs is exported here. Nothing else in
 * `src/components/motion/**` or `src/lib/motion/**` is a supported import — the
 * internals (observer registry, motion specs, reduced-motion plumbing) exist so
 * that consumers never have to think about them.
 *
 * Typical use:
 *
 *   <Reveal>…</Reveal>                    // section or entry, 8px
 *   <Reveal distance="lg">…</Reveal>      // hero block only, 16px
 *   <Reveal as="li" index={i}>…</Reveal>  // staggered list item, 50ms steps
 *
 * There is no reduced-motion prop and no reduced-motion opt-in, by design: the
 * branch is taken inside the primitive (docs/04 §6).
 */

export { Reveal } from "./Reveal";
export type { RevealProps, RevealDistance, RevealElement } from "./Reveal";
