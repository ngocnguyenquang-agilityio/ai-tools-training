import Link from "next/link";
import { cn } from "cn";

import type { SearchQuery, SearchSort } from "@/lib/hn/types";
import { SEARCH_SORTS, searchHref } from "@/lib/search-params";

const LABELS: Record<SearchSort, string> = {
  relevance: "Relevance",
  date: "Newest",
};

/** Sort links in the style of `FeedTabs`; switching sort starts at page 1. */
export function SortTabs({
  query,
  sort,
}: {
  query: SearchQuery;
  sort: SearchSort;
}) {
  return (
    <nav aria-label="Sort" className="border-b">
      <ul className="-mb-px flex gap-1">
        {SEARCH_SORTS.map((option) => {
          const isActive = option === sort;
          return (
            <li key={option}>
              <Link
                href={searchHref(query, { sort: option })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center border-b-2 px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {LABELS[option]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
