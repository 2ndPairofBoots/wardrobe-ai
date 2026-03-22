type LoadingSpinnerProps = {
  size: "sm" | "md" | "lg";
};

const sizeClasses: Record<LoadingSpinnerProps["size"], string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function LoadingSpinner({ size }: LoadingSpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-border border-t-primary ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
