import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
type FeedPaginationProps = {
  page: number;
  totalPages: number;
  /** The URL of a page, so a feed or a search can keep its own params. */
  hrefFor: (page: number) => string;
};

const disabled = {
  "aria-disabled": true,
  className: "pointer-events-none opacity-50",
} as const;

export function FeedPagination({
  page,
  totalPages,
  hrefFor,
}: FeedPaginationProps) {
  if (totalPages <= 1) return null;

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
