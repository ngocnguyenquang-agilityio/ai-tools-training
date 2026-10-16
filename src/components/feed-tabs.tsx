import Link from "next/link";
import { cn } from "cn";

import type { Feed } from "@/lib/hn/types";
import { FEEDS } from "@/lib/search-params";

const LABELS: Record<Feed, string> = { top: "Top", new: "New", best: "Best" };

/** Links rather than client-side tabs, so the page stays a Server Component. */
export function FeedTabs({ feed }: { feed: Feed }) {
  return (
    <nav aria-label="Feeds" className="border-b">
      <ul className="-mb-px flex gap-1">
        {FEEDS.map((tab) => {
          const isActive = tab === feed;
          return (
            <li key={tab}>
              {/* No page param: switching feeds starts again at page 1. */}
              <Link
                href={`/?feed=${tab}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center border-b-2 px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {LABELS[tab]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
