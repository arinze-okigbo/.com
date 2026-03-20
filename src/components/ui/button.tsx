import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:bg-[#f1ecdf] hover:-translate-y-0.5",
        ghost:
          "border border-line bg-white/0 text-foreground hover:border-accent hover:text-accent",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export function Button({ className, variant, size, href, ...props }: ButtonProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, className }))} href={href} {...props} />
  );
}