import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  padding: "sm" | "md" | "lg";
  hoverable: boolean;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

const paddingClasses: Record<CardProps["padding"], string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({ padding, hoverable, children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-border bg-surface text-text-primary transition-colors",
        hoverable ? "cursor-pointer hover:border-primary-hover" : "",
        paddingClasses[padding],
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
