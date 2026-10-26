import type { Feed, HNItem, Story } from "./types";

const API_BASE = "https://hacker-news.firebaseio.com/v0";
const ITEM_URL_BASE = "https://news.ycombinator.com/item?id=";

/** Cache responses for 5 minutes (ISR). */
const REVALIDATE_SECONDS = 300;

const FEED_ENDPOINTS: Record<Feed, string> = {
  top: "topstories",
  new: "newstories",
  best: "beststories",
};

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}/${path}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });

  if (!res.ok) {
    throw new Error(
      `HN API request failed: ${res.status} ${res.statusText} (${url})`,
    );
  }

  return (await res.json()) as T;
}

export async function getStoryIds(feed: Feed): Promise<number[]> {
  const endpoint = FEED_ENDPOINTS[feed];
  if (!endpoint) {
    throw new Error(`Unknown HN feed: ${String(feed)}`);
  }

  const ids = await fetchJson<unknown>(`${endpoint}.json`);
  if (!Array.isArray(ids)) {
    throw new Error(`HN API returned no story IDs for feed "${feed}"`);
  }
  return ids as number[];
}

export function getItem(id: number): Promise<HNItem | null> {
  return fetchJson<HNItem | null>(`item/${id}.json`);
}

/** Parses a link target, accepting only http(s) URLs with a hostname. */
function parseWebUrl(url: string | undefined): URL | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const isWeb = parsed.protocol === "http:" || parsed.protocol === "https:";
    return isWeb && parsed.hostname ? parsed : null;
  } catch {
    return null;
  }
}

export function isLiveStory(item: HNItem | null): item is HNItem {
  return item !== null && item.type === "story" && !item.deleted && !item.dead;
}

/**
 * The link fields of a `Story`. A missing or non-web URL falls back to the HN
 * discussion, with no domain. Shared with the Algolia search client.
 */
export function storyLinks(
  id: number,
  url: string | undefined,
): Pick<Story, "url" | "domain" | "commentsUrl"> {
  const commentsUrl = `${ITEM_URL_BASE}${id}`;
  const webUrl = parseWebUrl(url);

  return {
    url: webUrl && url ? url : commentsUrl,
    domain: webUrl ? webUrl.hostname.replace(/^www\./, "") : null,
    commentsUrl,
  };
}

function toStory(item: HNItem): Story {
  return {
    id: item.id,
    title: item.title ?? "",
    ...storyLinks(item.id, item.url),
    author: item.by ?? "",
    score: item.score ?? 0,
    commentsCount: item.descendants ?? 0,
    publishedAt: new Date(item.time * 1000),
  };
}

export async function getStories(
  feed: Feed,
  { page, pageSize }: { page: number; pageSize: number },
): Promise<{ stories: Story[]; totalPages: number }> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError(`page must be an integer >= 1, got ${page}`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`pageSize must be an integer >= 1, got ${pageSize}`);
  }

  const ids = await getStoryIds(feed);
  const totalPages = Math.ceil(ids.length / pageSize);

  // Dropped items (dead, deleted, jobs) are replaced with the IDs that follow,
  // so a page stays full. Those IDs can show up again at the top of the next page.
  const stories: Story[] = [];
  let cursor = (page - 1) * pageSize;
  while (stories.length < pageSize && cursor < ids.length) {
    const batch = ids.slice(cursor, cursor + pageSize - stories.length);
    cursor += batch.length;
    const items = await Promise.all(batch.map(getItem));
    stories.push(...items.filter(isLiveStory).map(toStory));
  }

  return { stories, totalPages };
}
