"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

type RouteErrorProps = {
  reset: () => void;
};

export default function Error({ reset }: RouteErrorProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-center">
      <h2 className="text-xl font-semibold text-text-primary">Profile page unavailable</h2>
      <p className="mt-2 text-sm text-text-secondary">
        We could not load your profile details. Please try again.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button variant="primary" size="md" loading={false} onClick={reset}>
          Try again
        </Button>
        <Link href="/profile" className="text-sm font-medium text-primary hover:text-primary-hover">
          Refresh page
        </Link>
      </div>
    </div>
  );
}
