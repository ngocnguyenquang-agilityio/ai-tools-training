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

function isLiveStory(item: HNItem | null): item is HNItem {
  return item !== null && item.type === "story" && !item.deleted && !item.dead;
}

function toStory(item: HNItem): Story {
  const commentsUrl = `${ITEM_URL_BASE}${item.id}`;
  const webUrl = parseWebUrl(item.url);

  return {
    id: item.id,
    title: item.title ?? "",
    url: webUrl && item.url ? item.url : commentsUrl,
    domain: webUrl ? webUrl.hostname.replace(/^www\./, "") : null,
    author: item.by ?? "",
    score: item.score ?? 0,
    commentsCount: item.descendants ?? 0,
    publishedAt: new Date(item.time * 1000),
    commentsUrl,
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

  const start = (page - 1) * pageSize;
  const items = await Promise.all(
    ids.slice(start, start + pageSize).map(getItem),
  );

  return { stories: items.filter(isLiveStory).map(toStory), totalPages };
}
