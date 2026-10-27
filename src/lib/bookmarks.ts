import type { Story } from "@/lib/hn/types";

const STORAGE_KEY = "tech-news:bookmarks";

/** The one empty list, so the server snapshot and an empty store compare equal. */
export const NO_BOOKMARKS: Story[] = [];

type StoredStory = Omit<Story, "publishedAt"> & { publishedAt: string };

const listeners = new Set<() => void>();

// `useSyncExternalStore` re-renders forever if `getBookmarks` returns a new
// array on every call, so the parsed list is reused until the stored text changes.
let cache: { raw: string | null; stories: Story[] } = {
  raw: null,
  stories: NO_BOOKMARKS,
};

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isStoredStory(value: unknown): value is StoredStory {
  if (typeof value !== "object" || value === null) return false;
  const story = value as Partial<StoredStory>;
  // Every field `NewsCard` reads, so a half-written entry reads as missing
  // instead of crashing the page.
  return (
    typeof story.id === "number" &&
    typeof story.title === "string" &&
    typeof story.url === "string" &&
    (story.domain === null || typeof story.domain === "string") &&
    typeof story.author === "string" &&
    typeof story.score === "number" &&
    typeof story.commentsCount === "number" &&
    typeof story.commentsUrl === "string" &&
    typeof story.publishedAt === "string" &&
    !Number.isNaN(Date.parse(story.publishedAt))
  );
}

function parse(raw: string | null): Story[] {
  if (raw === null) return NO_BOOKMARKS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return NO_BOOKMARKS;
    return parsed.filter(isStoredStory).map((stored) => ({
      ...stored,
      publishedAt: new Date(stored.publishedAt),
    }));
  } catch {
    return NO_BOOKMARKS;
  }
}

/** Saved stories, newest save first. Empty when storage is blocked or corrupt. */
export function getBookmarks(): Story[] {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, stories: parse(raw) };
  return cache.stories;
}

/** Calls `listener` when a bookmark changes here or in another tab. */
export function subscribeToBookmarks(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Saves the story, or removes it when it is already saved. */
export function toggleBookmark(story: Story): void {
  const current = getBookmarks();
  const next = current.some((saved) => saved.id === story.id)
    ? current.filter((saved) => saved.id !== story.id)
    : [story, ...current];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}
