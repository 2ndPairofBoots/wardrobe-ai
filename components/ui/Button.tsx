import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

type ButtonProps = {
  variant: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  loading: boolean;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "children">;

const variantClasses: Record<ButtonProps["variant"], string> = {
  primary: "bg-primary text-[#fff6e8] hover:bg-primary-hover",
  secondary: "bg-white text-text-primary border border-border hover:bg-[#f5ece0]",
  ghost: "bg-transparent text-text-secondary hover:bg-white/70 hover:text-text-primary",
  danger: "bg-danger text-[#fff6e8] hover:opacity-90",
};

const sizeClasses: Record<ButtonProps["size"], string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
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
  ...rest
}: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
      ].join(" ")}
      {...rest}
    >
      {loading ? <LoadingSpinner size={spinnerSizes[size]} /> : null}
      <span>{children}</span>
    </button>
  );
}
