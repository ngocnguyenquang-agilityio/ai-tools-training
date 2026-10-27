"use client";

import { BookmarkIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  getBookmarks,
  NO_BOOKMARKS,
  subscribeToBookmarks,
  toggleBookmark,
} from "@/lib/bookmarks";
import type { Story } from "@/lib/hn/types";

/**
 * Saves the story to read later. The saved state comes from the browser, so
 * the server renders every story as unsaved and the button updates on hydration.
 */
export function BookmarkButton({ story }: { story: Story }) {
  const bookmarks = useSyncExternalStore(
    subscribeToBookmarks,
    getBookmarks,
    () => NO_BOOKMARKS,
  );
  const saved = bookmarks.some((bookmark) => bookmark.id === story.id);

  return (
    <>
      <span aria-hidden="true">·</span>
      <Button
        variant="ghost"
        size="xs"
        aria-pressed={saved}
        aria-label={`Save ${story.title}`}
        onClick={() => toggleBookmark(story)}
      >
        <BookmarkIcon
          aria-hidden="true"
          fill={saved ? "currentColor" : "none"}
        />
        Save
      </Button>
    </>
  );
}
