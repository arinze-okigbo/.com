"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type IntentLinkProps = Omit<ComponentProps<typeof Link>, "href" | "prefetch"> & {
  href: string;
};

/** Keep startup free of speculative route work; restore Next prefetch on intent. */
export function IntentLink({
  href,
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...props
}: IntentLinkProps) {
  const [intentHref, setIntentHref] = useState<string>();
  const activate = (anchor: HTMLAnchorElement) => {
    // A logo or current-section link needs no speculative current-page request.
    if (
      anchor.origin === window.location.origin &&
      anchor.pathname === window.location.pathname &&
      anchor.search === window.location.search
    )
      return;
    setIntentHref(href);
  };

  return (
    <Link
      {...props}
      href={href}
      prefetch={intentHref === href ? null : false}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented) activate(event.currentTarget);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) activate(event.currentTarget);
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        if (!event.defaultPrevented) activate(event.currentTarget);
      }}
    />
  );
}
