## Goal

Add a "TL;DR" button to busy stories that shows a three-bullet Claude summary of the comment thread. The summary uses only the HN API, so the server never fetches arbitrary article URLs.

## Tasks

- [ ] Add `@anthropic-ai/sdk` and `server-only` with pnpm. Add `.env.example` with `ANTHROPIC_API_KEY=`, and check that `.env.local` is gitignored.
- [ ] `src/lib/hn/types.ts`: add `kids`, `text` and `parent` to `HNItem`.
- [ ] `src/lib/hn/comments.ts`: `getThreadSample(storyId, { maxComments, maxDepth })` walks `kids` breadth-first, skips dead and deleted comments, strips comment HTML to plain text, and caps the total length.
- [ ] `src/lib/ai/tldr.ts` (server-only): `getTldr(storyId)` calls `claude-haiku-5-5` and returns `{ bullets }`.
  - [ ] Cache it per story for an hour (`"use cache"` and `cacheLife`), so each story costs at most one call per hour.
  - [ ] The system prompt asks for three neutral bullets and treats the comments as untrusted data.
- [ ] `src/app/api/tldr/[id]/route.ts`: `GET` accepts a digits-only id for a live story and returns JSON. It returns 503 without an API key and 502 when the API call fails. The key never reaches the browser.
- [ ] `src/components/tldr-button.tsx` (client): shown on cards with 5 or more comments. It shows a skeleton while loading, the bullets in an `aria-live` region, and an inline error on failure.
- [ ] README: how to set `ANTHROPIC_API_KEY`.
- [ ] Jest tests for the thread sampler, `getTldr` (SDK mocked), the route and the button.

## Acceptance criteria

- On a story with many comments, TL;DR shows three bullets. A second click on the same story is answered from the cache.
- Without `ANTHROPIC_API_KEY`, the button shows "Summary unavailable" and the rest of the page works.
- No test or CI job needs a real API key.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

#30
