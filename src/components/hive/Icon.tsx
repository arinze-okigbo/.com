import type { SVGProps } from "react";

const paths = {
  "arrow-up-right": "M5 19 19 5M5 5h14v14",
  "arrow-right": "M4 12h16m-7-7 7 7-7 7",
  "arrow-left": "M20 12H4m7-7-7 7 7 7",
  "arrows-horizontal": "M3 8h18m-5-5 5 5-5 5M21 16H3m5-5-5 5 5 5",
  play: "m7 4 13 8-13 8Z",
  pause: "M8 5v14M16 5v14",
  "arrow-down": "M12 4v16m-7-7 7 7 7-7",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  refresh: "M20 7v5h-5M4 17v-5h5M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9",
  copy: "M9 9h11v11H9zM15 9V4H4v11h5",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16",
  shield: "m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  sparkle: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  "chevron-down": "m5 9 7 7 7-7",
  "chevron-right": "m9 5 7 7-7 7",
} as const;

export type IconName = keyof typeof paths;

/** Decorative by default; label supplies an accessible name for standalone symbols. */
export function Icon({
  name,
  size = "1em",
  label,
  className,
  style,
  ...props
}: Omit<SVGProps<SVGSVGElement>, "children" | "name"> & {
  name: IconName;
  size?: number | string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      className={`site-icon${className ? ` ${className}` : ""}`}
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0, ...style }}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
