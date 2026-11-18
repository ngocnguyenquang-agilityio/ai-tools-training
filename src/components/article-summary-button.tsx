"use client";

import { FileTextIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; summary: string }
  | { status: "error"; message: string };

const RETRY_MESSAGE = "Couldn't load a summary. Try again.";

const failure = (message: string): State => ({ status: "error", message });

async function fetchSummary(storyId: number): Promise<State> {
  try {
    const res = await fetch(`/api/article-summary/${storyId}`);
    if (res.status === 503) return failure("Summary unavailable.");
    if (res.status === 403) {
      return failure(
        "This story has left the feeds, so it can't be summarized.",
      );
    }
    if (res.status === 404) {
      return failure("This story has no article to summarize.");
    }
    if (res.status === 422) return failure("Couldn't read this article.");
    if (!res.ok) return failure(RETRY_MESSAGE);

    const { summary } = (await res.json()) as { summary?: unknown };
    if (typeof summary !== "string" || !summary) return failure(RETRY_MESSAGE);
    return { status: "done", summary };
  } catch {
    return failure(RETRY_MESSAGE);
  }
}

/**
 * Shows a Claude summary of the article a story links to, under the card's
 * meta line. Fetched on the first open; a failed load retries on the next one.
 */
export function ArticleSummaryButton({ storyId }: { storyId: number }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  const toggle = async () => {
    const opening = !open;
    setOpen(opening);
    if (!opening || state.status === "loading" || state.status === "done") {
      return;
    }
    setState({ status: "loading" });
    setState(await fetchSummary(storyId));
  };

  return (
    <>
      {/* The separator and button wrap as one unit, so a dot never starts or
          ends a line. */}
      <span className="inline-flex items-center gap-x-1">
        <span aria-hidden="true">·</span>
        <Button
          variant="ghost"
          size="xs"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <FileTextIcon aria-hidden="true" />
          Summarize article
        </Button>
      </span>
      {/* The live region stays rendered: screen readers may not announce
          content added to a region while it's `display: none`. */}
      <div
        aria-live="polite"
        aria-busy={state.status === "loading"}
        className="order-last basis-full"
      >
        <div
          id={panelId}
          hidden={!open}
          className="mt-2 rounded-lg bg-muted/50 p-3 text-foreground"
        >
          {state.status === "loading" && (
            <div role="status" className="flex flex-col gap-2">
              <span className="sr-only">Loading summary</span>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}
          {state.status === "done" && (
            <>
              <p>{state.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                AI summary of the article; it can be wrong.
              </p>
            </>
          )}
          {state.status === "error" && (
            <p className="text-muted-foreground">{state.message}</p>
          )}
        </div>
      </div>
    </>
  );
}
