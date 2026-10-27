"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { NewsCard } from "@/components/news-card";
import { getBookmarks, subscribeToBookmarks } from "@/lib/bookmarks";

/**
 * Lists the stories saved in this browser. The server can't know them, so it
 * renders nothing and the list appears on hydration; that avoids flashing the
 * empty state at readers who do have saved stories.
 */
export function SavedStories() {
  const bookmarks = useSyncExternalStore(
    subscribeToBookmarks,
    getBookmarks,
    () => null,
  );

  if (bookmarks === null) return null;

  if (bookmarks.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Nothing saved yet. Save a story from the{" "}
        <Link href="/" className="underline">
          feed
        </Link>{" "}
        to read it later.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {bookmarks.map((story) => (
        <li key={story.id}>
          <NewsCard story={story} tldr={false} />
        </li>
      ))}
    </ol>
  );
}
