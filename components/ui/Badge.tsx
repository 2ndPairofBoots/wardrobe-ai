import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  variant: "default" | "success" | "warning" | "danger";
  children: ReactNode;
};

const variantClasses: Record<BadgeProps["variant"], string> = {
  default: "border-transparent bg-secondary text-secondary-foreground",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning-foreground",
  danger: "border-transparent bg-destructive/15 text-destructive",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant]
      )}
    >
      {children}
    </span>
  );
}
