/** Legacy event API retained for existing links. No events are collected or sent. */

/** Where on the page the interaction happened. Closed set. */
export type EventLocation =
  | "header"
  | "hero"
  | "work"
  | "projects"
  | "about"
  | "contact"
  | "footer";

/** The named artifacts an outbound work link can point at. Closed set. */
export type WorkArtifact = "splita" | "queralt" | "snorkel" | "skyview";

/** Off-site destinations. Closed set — never a raw, user-reachable URL. */
export type LinkDestination =
  | "splita"
  | "queralt"
  | "snorkel"
  | "github"
  | "linkedin"
  | "x"
  | "resume";

export const ANALYTICS_EVENTS = {
  resumeClick: "resume_click",
  contactEmailClick: "contact_email_click",
  workLinkClick: "work_link_click",
  profileLinkClick: "profile_link_click",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * The event map. Adding an event means adding a member here, which is what
 * makes `trackEvent` reject anything undeclared at compile time.
 */
export interface AnalyticsEventProperties {
  readonly resume_click: { readonly location: EventLocation };
  readonly contact_email_click: { readonly location: EventLocation };
  readonly work_link_click: {
    readonly artifact: WorkArtifact;
    readonly destination: LinkDestination;
    readonly location: EventLocation;
  };
  readonly profile_link_click: {
    readonly destination: LinkDestination;
    readonly location: EventLocation;
  };
}

/** Intentional no-op: the site has no analytics transport or visitor identifiers. */
export function trackEvent<TName extends AnalyticsEventName>(
  name: TName,
  properties: AnalyticsEventProperties[TName],
): void {
  void name;
  void properties;
}
