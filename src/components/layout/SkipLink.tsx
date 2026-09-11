export interface SkipLinkProps {
  readonly href?: string;
  /** Information-bearing by construction. [03 R12] */
  readonly label?: string;
}

/**
 * docs/04 §7.5 — the first focusable element in the DOM. Visually hidden until
 * focused, never `display: none`, so it stays focusable. 44x44 minimum target.
 */
export function SkipLink({ href = "#main", label = "Skip to content" }: SkipLinkProps) {
  return (
    <a href={href} className="skip-link">
      {label}
    </a>
  );
}
