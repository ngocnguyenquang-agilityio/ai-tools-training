import { cacheLife } from "next/cache";

import { NewsCard } from "@/components/news-card";
import { getStories } from "@/lib/hn/client";

export default async function Home() {
  "use cache";
  // Prerendered into the static shell, regenerated in the background every 5 minutes.
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  const { stories } = await getStories("top", { page: 1, pageSize: 30 });
  // Captured inside the cache scope so relative times match the cached render.
  const now = new Date();

  if (stories.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No stories right now. Check back soon.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {stories.map((story) => (
        <li key={story.id}>
          <NewsCard story={story} now={now} />
        </li>
      ))}
    </ol>
  );
}
