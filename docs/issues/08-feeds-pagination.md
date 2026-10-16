## Goal

Let users switch between the Top, New and Best feeds and page through the results. All state lives in the URL.

URL shape: `/?feed=top|new|best&page=N`

## Tasks

- [x] `src/lib/search-params.ts`: `parseFeedParams(searchParams): { feed: Feed; page: number }`.
  - [x] An invalid or missing `feed` falls back to `top`.
  - [x] A non-numeric, `< 1` or non-integer `page` falls back to `1`.
- [x] `src/lib/search-params.test.ts`: unit tests for the valid, invalid and missing cases.
- [x] `src/components/feed-tabs.tsx`: three `<Link>`s styled as tabs, with `aria-current="page"` on the active one. Use links rather than client-side tabs, so the page stays a Server Component.
- [x] `src/components/feed-pagination.tsx`: built on shadcn `Pagination`, with Prev/Next links. Disable Prev on page 1 and Next on the last page. Keep the current `feed` in the links.
- [x] Update `src/app/page.tsx` to read the awaited `searchParams`, parse them, and pass `feed` and `page` to `getStories`.
- [x] Clamp `page` to `totalPages`.

## Acceptance criteria

- Clicking a tab or a page link updates the URL and the list.
- Bookmarking or refreshing a URL restores the same view.
- `/?feed=foo&page=-3` renders Top, page 1, without crashing.
- The parser unit tests pass.

## Depends on

#6
