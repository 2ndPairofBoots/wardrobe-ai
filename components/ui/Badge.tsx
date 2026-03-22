import type { ReactNode } from "react";

type BadgeProps = {
  variant: "default" | "success" | "warning" | "danger";
  children: ReactNode;
};

const variantClasses: Record<BadgeProps["variant"], string> = {
  default: "bg-white text-text-secondary border border-border",
  success: "bg-success/10 text-success border border-success/35",
  warning: "bg-warning/10 text-warning border border-warning/35",
  danger: "bg-danger/10 text-danger border border-danger/35",
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
