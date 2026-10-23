"use client";

import { SparklesIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TLDR_MIN_COMMENTS } from "@/lib/ai/tldr-config";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; bullets: string[] }
  | { status: "error"; message: string };

async function fetchTldr(storyId: number): Promise<State> {
  try {
    const res = await fetch(`/api/tldr/${storyId}`);
    if (res.status === 503) {
      return { status: "error", message: "Summary unavailable." };
    }
    if (!res.ok) {
      return {
        status: "error",
        message: "Couldn't load a summary. Try again.",
      };
    }
    const { bullets } = (await res.json()) as { bullets: string[] };
    return { status: "done", bullets };
  } catch {
    return { status: "error", message: "Couldn't load a summary. Try again." };
  }
}

/**
 * Shows a Claude summary of the story's discussion under the card's meta
 * line. Fetched on the first open; a failed load retries on the next open.
 */
export function TldrButton({
  storyId,
  commentsCount,
}: {
  storyId: number;
  commentsCount: number;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  if (commentsCount < TLDR_MIN_COMMENTS) return null;

  const toggle = async () => {
    const opening = !open;
    setOpen(opening);
    if (!opening || state.status === "loading" || state.status === "done") {
      return;
    }
    setState({ status: "loading" });
    setState(await fetchTldr(storyId));
  };

  return (
    <>
      <span aria-hidden="true">·</span>
      <Button
        variant="ghost"
        size="xs"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <SparklesIcon aria-hidden="true" />
        TL;DR
      </Button>
      <div
        id={panelId}
        hidden={!open}
        aria-live="polite"
        aria-busy={state.status === "loading"}
        className="mt-2 basis-full rounded-lg bg-muted/50 p-3 text-foreground"
      >
        {state.status === "loading" && (
          <div role="status" className="flex flex-col gap-2">
            <span className="sr-only">Loading summary</span>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {state.status === "done" &&
          (state.bullets.length > 0 ? (
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {state.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          ) : (
            <p>Not enough discussion to summarize yet.</p>
          ))}
        {state.status === "error" && (
          <p className="text-muted-foreground">{state.message}</p>
        )}
        {state.status === "done" && state.bullets.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            AI summary of the comments; it can be wrong.
          </p>
        )}
      </div>
    </>
  );
}
