import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

type ButtonProps = {
  variant: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  loading: boolean;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "children" | "className">;

const variantClasses: Record<ButtonProps["variant"], string> = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
  secondary: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonProps["size"], string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-sm",
};

const spinnerSizes: Record<ButtonProps["size"], "sm" | "md" | "lg"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

export function Button({
  variant,
  size,
  loading,
  disabled,
  onClick,
  children,
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = loading || disabled;
  const spinnerInverse = variant === "primary" || variant === "danger";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? <LoadingSpinner size={spinnerSizes[size]} inverse={spinnerInverse} /> : null}
      <span>{children}</span>
    </button>
  );
}
