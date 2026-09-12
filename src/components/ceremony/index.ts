/**
 * Public surface of the ceremony module.
 *
 * `CeremonyMount` is the only component another agent mounts, and it is the
 * only one in the page's own bundle. `CeremonyPanel` and every report component
 * are reached exclusively through `CeremonyMount`'s dynamic `import()`, which is
 * what keeps the parsers, the CBOR decoder and the WebCrypto verification out
 * of First Load JS.
 */
export { CeremonyMount } from "./CeremonyMount";
export type { CeremonyMountProps } from "./CeremonyMount";
