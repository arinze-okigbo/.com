import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface MetaLineProps {
  readonly items: readonly string[];
  readonly separator?: string;
  readonly className?: string;
}

/**
 * docs/04 §8.2 — `--text-caption` at `--color-foreground-muted`
 * (5.35:1 light / 5.73:1 dark). The separator is decorative, so it is hidden
 * from assistive technology and the items read as a plain list.
 */
export function MetaLine({ items, separator = "·", className }: MetaLineProps) {
  return (
    <p className={cn("meta-line", className)}>
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 ? (
            <span className="meta-line-separator" aria-hidden="true">
              {separator}
            </span>
          ) : null}
          {item}
        </Fragment>
      ))}
    </p>
  );
}
