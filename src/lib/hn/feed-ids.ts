import { cacheLife } from "next/cache";

import { getStoryIds } from "./client";
import type { Feed } from "./types";

const FEEDS: Feed[] = ["top", "new", "best"];

/** Every story ID on the Top, New and Best feeds, cached like the feeds. */
async function getFeedStoryIds(): Promise<number[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  const lists = await Promise.all(FEEDS.map(getStoryIds));
  return [...new Set(lists.flat())];
}

/**
 * Whether the story is on one of the app's feeds right now. The TL;DR route
 * uses it so only stories the app lists can trigger a Claude call.
 */
export async function isOnAFeed(storyId: number): Promise<boolean> {
  return (await getFeedStoryIds()).includes(storyId);
}
