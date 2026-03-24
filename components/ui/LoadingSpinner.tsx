import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size: "sm" | "md" | "lg";
  /** Use on dark-filled buttons (primary, destructive). */
  inverse?: boolean;
};

const sizeClasses: Record<LoadingSpinnerProps["size"], string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-6 w-6 border-2",
};

export function LoadingSpinner({ size, inverse }: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-solid",
        sizeClasses[size],
        inverse
          ? "border-primary-foreground/30 border-t-primary-foreground"
          : "border-muted-foreground/25 border-t-foreground"
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
