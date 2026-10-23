import type { Feed, SearchQuery, SearchSort } from "@/lib/hn/types";

export const FEEDS = ["top", "new", "best"] as const satisfies readonly Feed[];

export const SEARCH_SORTS = [
  "relevance",
  "date",
] as const satisfies readonly SearchSort[];

/** Longest query we pass on to Algolia. */
const MAX_QUERY_LENGTH = 200;

/** A bare hostname with at least one dot: `lwn.net`, `blog.example.co.uk`. */
const SITE_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

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

function isSearchSort(value: unknown): value is SearchSort {
  return (SEARCH_SORTS as readonly unknown[]).includes(value);
}

/**
 * Whether a story's domain can be a `?site=` search. Hostnames like
 * `localhost`, `[::1]` or `example.com.` can't, so they get no search link.
 */
export function isSearchableSite(domain: string): boolean {
  return SITE_PATTERN.test(domain);
}

function parseSite(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const site = value
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
  return isSearchableSite(site) ? site : null;
}

function parseQuery(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const q = value.trim().slice(0, MAX_QUERY_LENGTH);
  return q || null;
}

/**
 * Reads `/search?q=…|site=…&sort=relevance|date&page=N`. A valid `site` wins
 * over `q`, since Algolia can't match one against the URL and the other
 * against the text in one query. `query` is null when there's nothing to search.
 */
export function parseSearchParams(searchParams: SearchParams): {
  query: SearchQuery | null;
  sort: SearchSort;
  page: number;
} {
  const site = parseSite(searchParams.site);
  const q = parseQuery(searchParams.q);
  return {
    query: site ? { site } : q ? { q } : null,
    sort: isSearchSort(searchParams.sort) ? searchParams.sort : "relevance",
    page: parsePage(searchParams.page),
  };
}

/** Builds a `/search` URL; the inverse of `parseSearchParams`. */
export function searchHref(
  query: SearchQuery,
  { sort = "relevance", page = 1 }: { sort?: SearchSort; page?: number } = {},
): string {
  const params = new URLSearchParams(
    "site" in query ? { site: query.site } : { q: query.q },
  );
  if (sort !== "relevance") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return `/search?${params}`;
}
