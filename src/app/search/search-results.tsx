import { cacheLife } from "next/cache";

import { FeedPagination } from "@/components/feed-pagination";
import { NewsCard } from "@/components/news-card";
import { SortTabs } from "@/components/sort-tabs";
import { searchStories } from "@/lib/hn/algolia";
import type { SearchQuery, SearchSort } from "@/lib/hn/types";
import { parseSearchParams, searchHref } from "@/lib/search-params";

const PAGE_SIZE = 30;

/** Same caching as the home feed; the params become the cache key. */
async function getSearchPage(
  query: SearchQuery,
  sort: SearchSort,
  requestedPage: number,
) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  const options = { sort, pageSize: PAGE_SIZE };
  const first = await searchStories(query, { ...options, page: requestedPage });
  // Past the end, show the last page. With no results there's no page to
  // fetch, so reuse the first (empty) response.
  const page = Math.min(requestedPage, Math.max(first.totalPages, 1));
  const { stories } =
    page === requestedPage || first.totalPages === 0
      ? first
      : await searchStories(query, { ...options, page });

  return { stories, page, totalPages: first.totalPages, now: new Date() };
}

export const queryLabel = (query: SearchQuery) =>
  "site" in query ? `Stories from ${query.site}` : `Search: ${query.q}`;

/**
 * The /search body. It awaits `searchParams`, so it suspends; the segment's
 * `loading.tsx` is its fallback.
 */
export async function SearchResults({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const {
    query,
    sort,
    page: requestedPage,
  } = parseSearchParams(await searchParams);

  if (!query) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Type a word or phrase in the search box to search Hacker News stories.
      </p>
    );
  }

  const { stories, page, totalPages, now } = await getSearchPage(
    query,
    sort,
    requestedPage,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Not a heading: story titles are the page's h2s, as on the home page. */}
      <p className="text-lg font-semibold break-words">{queryLabel(query)}</p>
      <SortTabs query={query} sort={sort} />
      {stories.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No stories match. Try other words.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {stories.map((story) => (
            <li key={story.id}>
              {/* Search reaches stories off the feeds, which /api/tldr refuses. */}
              <NewsCard story={story} now={now} tldr={false} />
            </li>
          ))}
        </ol>
      )}
      <FeedPagination
        page={page}
        totalPages={totalPages}
        hrefFor={(target) => searchHref(query, { sort, page: target })}
      />
    </div>
  );
}
