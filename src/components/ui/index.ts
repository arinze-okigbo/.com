/**
 * UI primitives from docs/04 §8. Owned by the frontend-core agent.
 *
 * Not exported here, and deliberately not built (docs/04 §8.5):
 * Card, Tag/Chip/Badge, SkillBar, StatCounter, LogoGrid, Modal, Toast,
 * Tooltip, Marquee, CustomCursor, MagneticDock, TiltCard.
 *
 * Content-shaped components — Hero, Lede, WorkEntry, ProjectEntry,
 * CredentialsLine, ContactBlock (docs/04 §8.2) — belong to the content
 * agent under `src/components/sections/`, because their prop contracts
 * encode copy rules rather than visual ones.
 */
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonElement } from "./Button";

export { Container } from "./Container";
export type { ContainerProps, ContainerWidth, ContainerElement } from "./Container";

export { fieldAttributes, fieldClass } from "./field";
export type {
  FieldCompositeProps,
  FieldDataAttributes,
  SectionField,
  SectionFieldState,
} from "./field";

export { InlineLink, ExternalLinkNotice, EXTERNAL_LINK_NOTICE_ID } from "./InlineLink";
export type { InlineLinkProps } from "./InlineLink";

export { MetaLine } from "./MetaLine";
export type { MetaLineProps } from "./MetaLine";

export { Prose } from "./Prose";
export type { ProseProps, ProseElement } from "./Prose";

export { Section } from "./Section";
export type { SectionProps } from "./Section";

export { SectionHeading } from "./SectionHeading";
export type { SectionHeadingProps } from "./SectionHeading";

export { StandaloneLink } from "./StandaloneLink";
export type { StandaloneLinkProps } from "./StandaloneLink";

export { VisuallyHidden } from "./VisuallyHidden";
export type { VisuallyHiddenProps, VisuallyHiddenElement } from "./VisuallyHidden";
