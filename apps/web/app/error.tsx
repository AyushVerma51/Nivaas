"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="eyebrow">An error</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink/60">
        An unexpected error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        className="btn-primary mt-8"
      >
        Try again
      </button>
    </div>
  );
}
