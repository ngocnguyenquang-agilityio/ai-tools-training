import { storyLinks } from "./client";
import type { SearchQuery, SearchSort, Story } from "./types";

const API_BASE = "https://hn.algolia.com/api/v1";

/** Cache responses for 5 minutes, like the Firebase client. */
const REVALIDATE_SECONDS = 300;

const SORT_ENDPOINTS: Record<SearchSort, string> = {
  relevance: "search",
  date: "search_by_date",
};

/** The fields we read from an Algolia story hit. */
export type AlgoliaHit = {
  objectID: string;
  title?: string | null;
  url?: string | null;
  author?: string | null;
  points?: number | null;
  num_comments?: number | null;
  /** Creation time in unix seconds. */
  created_at_i: number;
};

type AlgoliaResponse = { hits: AlgoliaHit[]; nbPages: number };

function toStory(hit: AlgoliaHit): Story {
  const id = Number(hit.objectID);
  return {
    id,
    title: hit.title ?? "",
    ...storyLinks(id, hit.url ?? undefined),
    author: hit.author ?? "",
    score: hit.points ?? 0,
    commentsCount: hit.num_comments ?? 0,
    publishedAt: new Date(hit.created_at_i * 1000),
  };
}

/**
 * Searches HN stories through the Algolia API. A `site` query matches the
 * story URL only, with typo tolerance off, so it lists stories from that site.
 * Pages are 1-based here and 0-based in Algolia.
 */
export async function searchStories(
  query: SearchQuery,
  {
    sort,
    page,
    pageSize,
  }: { sort: SearchSort; page: number; pageSize: number },
): Promise<{ stories: Story[]; totalPages: number }> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError(`page must be an integer >= 1, got ${page}`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`pageSize must be an integer >= 1, got ${pageSize}`);
  }

  const params = new URLSearchParams({
    query: "site" in query ? query.site : query.q,
    tags: "story",
    page: String(page - 1),
    hitsPerPage: String(pageSize),
  });
  if ("site" in query) {
    params.set("restrictSearchableAttributes", "url");
    params.set("typoTolerance", "false");
  }

  const url = `${API_BASE}/${SORT_ENDPOINTS[sort]}?${params}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(
      `HN search request failed: ${res.status} ${res.statusText} (${url})`,
    );
  }

  const { hits, nbPages } = (await res.json()) as AlgoliaResponse;
  return {
    stories: hits.filter((hit) => hit.title).map(toStory),
    totalPages: nbPages,
  };
}
