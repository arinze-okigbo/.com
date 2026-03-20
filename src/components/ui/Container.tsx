import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  className?: string;
  children: ReactNode;
};

export function Container({ className, children }: ContainerProps) {
  return <div className={cn("container-shell", className)}>{children}</div>;
}