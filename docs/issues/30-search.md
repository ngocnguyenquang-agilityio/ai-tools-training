## Goal

Let readers search Hacker News stories by keyword and see more stories from a site, using the HN Algolia API. Results reuse the existing story cards and pagination.

## Tasks

- [x] `src/lib/hn/algolia.ts`: `searchStories(query, { sort, page, pageSize })` returns `{ stories, totalPages }`. `query` is `{ q }` or `{ site }`.
  - [x] `sort: "relevance"` calls `/api/v1/search`, `sort: "date"` calls `/api/v1/search_by_date`, both with `tags=story`.
  - [x] `site` filters by domain with `restrictSearchableAttributes=url` and `typoTolerance=false`. Algolia can't combine that with a keyword, so a valid `site` wins over `q`.
  - [x] Map hits (`objectID`, `title`, `url`, `author`, `points`, `num_comments`, `created_at_i`) to `Story`. Algolia pages are 0-based; ours are 1-based.
- [x] `src/lib/hn/client.ts`: export the URL and domain helper (`storyLinks`), so Algolia hits follow the same link rules as Firebase items.
- [x] `src/lib/search-params.ts`: `parseSearchParams` reads `?q=&site=&sort=&page=`. It trims `q`, falls back to `relevance` for an unknown sort, and reuses `parsePage`. `searchHref` builds the URL back.
- [x] `src/app/search/page.tsx`: a cached search helper like the home page's. Show a prompt when there's no query, a message when nothing matches, and the results otherwise. Set the title to `Search: <q> · Tech News`. `loading.tsx` gives the segment its own Suspense boundary.
- [x] `src/components/search-form.tsx`: a `next/form` GET form to `/search` with a query input, in the site header. It works without client JavaScript. It isn't prefilled with the current query.
- [x] `src/components/sort-tabs.tsx`: Relevance / Newest links on the results page, in the style of the feed tabs.
- [x] `src/components/feed-pagination.tsx`: take an `hrefFor(page)` prop instead of building `/?feed=` links, so search can use it.
- [x] `src/components/news-card.tsx`: the domain badge links to `/search?site=<domain>`, unless the domain can't be searched (e.g. `example.com.`).
- [x] Footer: credit HN Search by Algolia.
- [x] Jest tests for the Algolia client, the search params, the search page, the form, the sort tabs, and the changed card, header, footer and pagination.

## Acceptance criteria

- Searching "rust" lists matching stories. Sorting by date shows the newest first, and page 2 works.
- Clicking a domain badge lists more stories from that site.
- An empty or unmatched search shows a clear message, not an error.
- The search form works with JavaScript disabled.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

#8
