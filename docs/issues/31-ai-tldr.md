## Goal

Add a "TL;DR" button to busy stories that shows a three-bullet Claude summary of the comment thread. The summary uses only the HN API, so the server never fetches arbitrary article URLs.

## Tasks

- [x] Add `@anthropic-ai/sdk`, `server-only` and `zod` (for the SDK's structured-output helper) with pnpm. Add `.env.example` with `ANTHROPIC_API_KEY=` (with a `!.env.example` exception in `.gitignore`), and check that `.env.local` is gitignored.
- [x] `src/lib/hn/types.ts`: add `kids`, `text` and `parent` to `HNItem`.
- [x] `src/lib/hn/comments.ts`: `getThreadSample(storyId, { maxComments, maxDepth, maxChars })` walks `kids` breadth-first, skips dead, deleted and failed-to-fetch comments, strips comment HTML to plain text, and caps the total length.
- [x] `src/lib/ai/tldr.ts` (server-only): `getTldr(storyId)` calls `claude-haiku-5-5` at low effort with structured output and returns `{ bullets }`.
  - [x] Cache it per story for an hour (`"use cache"` and `cacheLife`). The in-memory cache bounds this per server process.
  - [x] The system prompt asks for three neutral bullets and treats the title and comments as untrusted data. Angle brackets in user text are escaped so it can't close the fence, and commenter names aren't sent.
  - [x] Stories under 5 comments get no bullets and no Claude call (`TLDR_MIN_COMMENTS` in `src/lib/ai/tldr-config.ts`, shared with the button).
- [x] `src/app/api/tldr/[id]/route.ts`: `GET` accepts a digits-only id for a live story and returns JSON. It returns 503 without an API key and 502 when the API call fails. The key never reaches the browser.
- [x] `src/components/tldr-button.tsx` (client): shown on cards with 5 or more comments. It shows a skeleton while loading, the bullets in an `aria-live` region, and an inline error on failure.
- [x] README: how to set `ANTHROPIC_API_KEY`, and a note to set a spend limit before deploying.
- [x] Jest tests for the thread sampler, `getTldr` (SDK mocked), the route and the button.

## Acceptance criteria

- On a story with many comments, TL;DR shows three bullets. A second click on the same story is answered from the cache.
- Without `ANTHROPIC_API_KEY`, the button shows "Summary unavailable" and the rest of the page works.
- No test or CI job needs a real API key.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

#30
