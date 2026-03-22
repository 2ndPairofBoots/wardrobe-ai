import type { ReactNode } from "react";

type BadgeProps = {
  variant: "default" | "success" | "warning" | "danger";
  children: ReactNode;
};

const variantClasses: Record<BadgeProps["variant"], string> = {
  default: "bg-surface text-text-secondary border border-border",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
