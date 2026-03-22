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
        "rounded-xl border border-border bg-surface text-text-primary shadow-[0_16px_40px_-32px_rgba(31,27,22,0.4)] transition-all duration-300",
        hoverable ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary-hover hover:shadow-[0_24px_50px_-34px_rgba(31,27,22,0.55)]" : "",
        paddingClasses[padding],
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
