import Link from "next/link";
import type { ReactNode } from "react";
import { cn, isExternalHref } from "@/lib/utils";
import { VisuallyHidden } from "./VisuallyHidden";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm";
export type ButtonElement = "button" | "a";

export interface ButtonProps {
  readonly children: ReactNode;
  /**
   * `primary` is allowlist A4: **at most one per viewport**. Its text colour
   * inverts between modes and comes from `--color-accent-foreground`; a
   * literal value there is a defect (F11).
   */
  readonly variant?: ButtonVariant;
  /** `md` is 44x44. `sm` is 32px block and is forbidden on touch surfaces. */
  readonly size?: ButtonSize;
  readonly as?: ButtonElement;
  /** Required when `as` is `"a"`. */
  readonly href?: string;
  readonly type?: "button" | "submit" | "reset";
  readonly disabled?: boolean;
  readonly external?: boolean;
  readonly className?: string;
  readonly onClick?: () => void;
}

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
};

function isRouterHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * docs/04 §8.3. All colour, radius, spacing and motion come from the
 * `.btn` class family in `globals.css`; this component only selects classes.
 * Reduced motion: M5 — no transform, instant background swap.
 */
export function Button({
  children,
  variant = "secondary",
  size = "md",
  as = "button",
  href,
  type = "button",
  disabled = false,
  external,
  className,
  onClick,
}: ButtonProps) {
  const classes = cn("btn", VARIANT_CLASS[variant], size === "sm" && "btn--sm", className);

  if (as === "a" && href !== undefined) {
    // A disabled link is not a link. It renders as inert text carrying the
    // same non-colour cue, so it is never the only path to information [R34].
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true" role="link">
          {children}
        </span>
      );
    }

    const isExternal = external ?? isExternalHref(href);

    if (isExternal) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
          <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
        </a>
      );
    }

    if (isRouterHref(href)) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
