import type { ReactElement } from "react";

import type { VerdictTone } from "@/lib/webauthn/types";

import { verdictStyle } from "./tokens";

/**
 * A verdict chip.
 *
 * The label always states the result in words. Colour is a second, redundant
 * channel — never the only one [WCAG 1.4.1].
 */
export interface VerdictProps {
  readonly tone: VerdictTone;
  readonly label: string;
}

export function Verdict({ tone, label }: VerdictProps): ReactElement {
  return <span style={verdictStyle(tone)}>{label}</span>;
}
