import { cacheLife } from "next/cache";

import { FeedPagination } from "@/components/feed-pagination";
import { FeedTabs } from "@/components/feed-tabs";
import { NewsCard } from "@/components/news-card";
import { getStories } from "@/lib/hn/client";
import type { Feed } from "@/lib/hn/types";
import { parseFeedParams } from "@/lib/search-params";

const PAGE_SIZE = 30;

/**
 * `searchParams` can't be read inside `"use cache"`, so the page reads them and
 * passes plain values in; they become part of the cache key
 * (node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md).
 */
async function getFeedPage(feed: Feed, requestedPage: number) {
  "use cache";
  // Regenerated in the background every 5 minutes.
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  const first = await getStories(feed, {
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });
  // Past the end, show the last page. The ID list is fetch-cached, so the
  // second call costs no extra request for it.
  const page = Math.min(requestedPage, Math.max(first.totalPages, 1));
  const { stories } =
    page === requestedPage
      ? first
      : await getStories(feed, { page, pageSize: PAGE_SIZE });

  // Captured inside the cache scope so relative times match the cached render.
  return { stories, page, totalPages: first.totalPages, now: new Date() };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { feed, page: requestedPage } = parseFeedParams(await searchParams);
  const { stories, page, totalPages, now } = await getFeedPage(
    feed,
    requestedPage,
  );

  return (
    <div className="flex flex-col gap-6">
      <FeedTabs feed={feed} />
      {stories.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No stories right now. Check back soon.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {stories.map((story) => (
            <li key={story.id}>
              <NewsCard story={story} now={now} />
            </li>
          ))}
        </ol>
      )}
      <FeedPagination feed={feed} page={page} totalPages={totalPages} />
    </div>
  );
}
