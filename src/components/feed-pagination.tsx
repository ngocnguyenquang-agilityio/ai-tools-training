import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Feed } from "@/lib/hn/types";

type FeedPaginationProps = {
  feed: Feed;
  page: number;
  totalPages: number;
};

const disabled = {
  "aria-disabled": true,
  className: "pointer-events-none opacity-50",
} as const;

export function FeedPagination({
  feed,
  page,
  totalPages,
}: FeedPaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => `/?feed=${feed}&page=${target}`;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            {...(hasPrevious ? { href: hrefFor(page - 1) } : disabled)}
          />
        </PaginationItem>
        <PaginationItem className="px-2 text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            {...(hasNext ? { href: hrefFor(page + 1) } : disabled)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
