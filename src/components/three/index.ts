/**
 * Public surface of the 3D module.
 *
 * `AttestationFigure` is the only component other agents mount. Everything else
 * — the gate, the canvas, the poster, the scene runtime — is internal, so the
 * `ogl` import stays behind the dynamic boundary that keeps it out of First
 * Load JS.
 */
export { AttestationFigure } from "./AttestationFigure";
export type { AttestationFigureProps } from "./AttestationFigure";
export type { Attestation, AttestationReadoutValues } from "./attestation/types";
