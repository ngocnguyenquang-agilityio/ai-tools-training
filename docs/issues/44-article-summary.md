## Goal

Add a "Summarize article" button next to TL;DR on story cards. The server fetches the story's own HN `url`, extracts the readable text and returns a 2-3 sentence Claude summary, so readers can decide whether to open the article.

## Tasks

- [x] Add `@mozilla/readability` and `linkedom` with pnpm (ask before adding each).
- [x] `src/lib/article/safe-fetch.ts` (server-only): `fetchArticleHtml(url)` allows `http`/`https` only, resolves DNS and rejects loopback, private, link-local, CGNAT, IPv6 unique-local and IPv4-mapped addresses, and connects to the validated address. It follows at most 3 redirects, re-checking each hop, with an 8s timeout and a 1 MB streamed cap, and accepts `text/html` only. It throws typed errors.
- [x] `src/lib/article/extract.ts`: `extractArticleText(html)` uses Readability on a linkedom document and returns `{ title, text }`, with `text` capped at about 20,000 characters, or `null` when nothing readable is found.
- [x] `src/lib/ai/article-summary.ts` (server-only): `getArticleSummary(storyId)` reads `item.url` from HN, then calls `claude-haiku-5-5` for a 2-3 sentence summary. The title and article text are fenced as untrusted data, with angle brackets escaped. Cache a summary for about 24 hours and a failure briefly.
- [x] `src/app/api/article-summary/[id]/route.ts`: `GET` with the same id parsing, 503 without `ANTHROPIC_API_KEY` and `isOnAFeed` check as `/api/tldr`. It returns 404 when the story has no `url` and 422 when the article can't be read.
- [x] `src/components/article-summary-button.tsx` (client), shown on a card next to `TldrButton` only when the story has a `url`: skeleton while loading, summary in an `aria-live` region, inline error on failure.
- [x] `jest.config.ts`: let Jest transform linkedom's ESM-only dependencies (`css-select`, `htmlparser2` and friends), since `next/jest` leaves `node_modules` untransformed. The route has no `runtime` export, because Cache Components runs Node.js only.
- [x] README: how article fetching works, its limits and a reminder to set a spend limit.
- [x] Jest tests for the fetch guard (private IPs, redirects, size, timeout, content type; DNS and fetch mocked), the extractor, `getArticleSummary` (SDK mocked), the route and the button.

## Acceptance criteria

- On a story with an article URL, the button shows a 2-3 sentence summary, and a second click on the same story is served from the cache.
- A URL that resolves to a private or loopback address, or redirects to one, is refused with no Claude call.
- Without `ANTHROPIC_API_KEY`, the button shows "Summary unavailable" and the rest of the page works.
- A story without a `url`, such as an Ask HN post, shows no button. `/api/article-summary/<id>` answers 403, with no fetch and no Claude call, for a story that isn't on the Top, New or Best feeds.
- A PDF, a non-HTML response, an oversized page or a page that times out gives a readable error, not a crash.
- No test or CI job needs a real API key or network access.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Out of scope

PDF pages, pages that need JavaScript to render, paywalled pages, `robots.txt` handling, translation, thread Q&A, a daily digest and per-IP rate limiting.

## Depends on

#31
