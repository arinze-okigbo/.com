/**
 * Public surface of the 3D module.
 *
 * `AttestationField` is the ground — mount it once, in `layout.tsx`, before
 * `{children}`. `FieldHud` is the readout over it. Everything else — the gate,
 * the canvas, the scene runtime, the shaders, the post chain — is internal, so
 * the `ogl` import stays behind the dynamic boundary that keeps it out of First
 * Load JS.
 *
 * `AttestationFigure` and `AttestationLive` are deleted: the field is no longer
 * a boxed figure inside a section (docs/15 §2.2, A8.5).
 */
export { AttestationField } from "./AttestationField";
export type { AttestationFieldProps } from "./AttestationField";
export { FieldHud } from "./FieldHud";
export { AttestationPoster } from "./AttestationPoster";
export type { AttestationPosterProps } from "./AttestationPoster";
export { AttestationReadout } from "./AttestationReadout";
export type { AttestationReadoutProps } from "./AttestationReadout";
export type { Attestation, AttestationReadoutValues } from "./attestation/types";
