## Goal

Stop the Next.js dev warning that `/search` reads `searchParams` in `generateMetadata()`, which blocks the page's metadata from being prefetched, while keeping the per-query title.

## Tasks

- [x] `src/app/search/search-results.tsx`: move the async results body out of `page.tsx` into `SearchResults`, which awaits `searchParams` itself.
- [x] `src/app/search/page.tsx`: make `SearchPage` synchronous. It renders `SearchResults` and a `DynamicMarker` (a `<Suspense>`-wrapped component that calls `await connection()`), as the bundled `generate-metadata.md` ("With Cache Components") describes. Keep `generateMetadata` and its `Search: <q> · Tech News` titles.
- [x] Tests: move the results tests to `search-results.test.tsx`. In `page.test.tsx`, keep the `generateMetadata` tests and check that the page passes `searchParams` through unawaited.

## Acceptance criteria

- A direct load of `/search?q=rust` in `pnpm dev` logs no "URL data in `generateMetadata()`" error.
- Titles are unchanged: `Search: rust · Tech News`, `Stories from lwn.net · Tech News`, `Search · Tech News`.
- Search results, sorting, paging and the domain-badge links work as before.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

#30
