import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

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

export function Card({ padding, hoverable, children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        hoverable && "cursor-pointer transition-colors hover:border-foreground/20 hover:bg-accent/30",
        paddingClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
