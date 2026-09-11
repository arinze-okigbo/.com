/**
 * Analytics event catalogue.
 *
 * `@vercel/analytics` and `@vercel/speed-insights` were installed but imported
 * nowhere (`docs/00` §9 / Defect 2), so the live site collected nothing while
 * the README claimed otherwise. The `<Analytics />` and `<SpeedInsights />`
 * components are mounted in `src/app/layout.tsx` by the frontend-core agent,
 * which owns that file. This module is the other half: the typed catalogue of
 * custom events, so tracking calls are named in one place instead of being
 * scattered as string literals through components.
 *
 * ## What is tracked
 *
 * | Event | Fired when | Properties |
 * |---|---|---|
 * | `resume_click` | the résumé link is activated | `location` |
 * | `contact_email_click` | a `mailto:` affordance is activated | `location` |
 * | `work_link_click` | an outbound link in work/projects is activated | `artifact`, `destination`, `location` |
 * | `profile_link_click` | GitHub / LinkedIn / X / Splita is activated | `destination`, `location` |
 *
 * ## What is NOT tracked
 *
 * No message content, no email address, no name, no free text of any kind —
 * only the closed enumerations declared below. There is no identifier, no
 * cookie and no cross-site property; Vercel Web Analytics is cookieless by
 * design and this module adds nothing to that.
 */

import { track } from "@vercel/analytics";

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

/**
 * Records a custom event.
 *
 * Client-side only — `@vercel/analytics`'s `track` is a no-op during SSR and
 * outside production, so calling this from a server component silently does
 * nothing. Call it from an event handler.
 *
 * Failures are swallowed deliberately and only here: an analytics beacon must
 * never break an interaction the visitor actually asked for. Nothing else in
 * this codebase swallows an error.
 */
export function trackEvent<TName extends AnalyticsEventName>(
  name: TName,
  properties: AnalyticsEventProperties[TName],
): void {
  try {
    track(name, { ...properties });
  } catch {
    // Intentionally ignored. See the note above.
  }
}
