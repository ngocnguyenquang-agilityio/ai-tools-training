"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the segment (`reset()` would only re-render). */
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <h2 className="text-lg font-medium">Couldn&apos;t load stories</h2>
      <p className="text-muted-foreground">
        Something went wrong while fetching the news. Please try again.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  );
}
