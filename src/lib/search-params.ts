import type { Feed } from "@/lib/hn/types";

export const FEEDS = ["top", "new", "best"] as const satisfies readonly Feed[];

/** The awaited shape of a page's `searchParams` prop. */
export type SearchParams = Record<string, string | string[] | undefined>;

function isFeed(value: unknown): value is Feed {
  return (FEEDS as readonly unknown[]).includes(value);
}

function parsePage(value: string | string[] | undefined): number {
  // Digits only: Number() alone would also accept "1e1", "0x10" and " 2 ".
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/**
 * Reads `?feed=top|new|best&page=N`. Anything invalid or missing falls back
 * to the Top feed, page 1, so a hand-edited URL never breaks the page.
 */
export function parseFeedParams(searchParams: SearchParams): {
  feed: Feed;
  page: number;
} {
  const { feed, page } = searchParams;
  return {
    feed: isFeed(feed) ? feed : "top",
    page: parsePage(page),
  };
}
