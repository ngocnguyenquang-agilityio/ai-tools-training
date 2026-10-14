## Goal

Build a typed, framework-agnostic client for the Hacker News Firebase API that returns normalized `Story` objects for the UI.

API reference: https://github.com/HackerNews/API

- `GET https://hacker-news.firebaseio.com/v0/{topstories|newstories|beststories}.json` returns `number[]`, up to 500 IDs.
- `GET https://hacker-news.firebaseio.com/v0/item/{id}.json` returns `HNItem | null`.

## Tasks

- [x] `src/lib/hn/types.ts`:
  - [x] `HNItem`: the raw shape (`id`, `type`, `by`, `time` in unix seconds, `title`, `url?`, `score`, `descendants?`, `deleted?`, `dead?`).
  - [x] `Feed = 'top' | 'new' | 'best'`.
  - [x] `Story`: the normalized shape (`id`, `title`, `url` (external URL or HN item URL), `domain | null`, `author`, `score`, `commentsCount`, `publishedAt: Date`, `commentsUrl`).
- [x] `src/lib/hn/client.ts`:
  - [x] `getStoryIds(feed: Feed): Promise<number[]>`
  - [x] `getItem(id: number): Promise<HNItem | null>`
  - [x] `getStories(feed, { page, pageSize }): Promise<{ stories: Story[]; totalPages: number }>`. It slices one page of IDs, fetches the items in parallel with `Promise.all`, drops null, deleted or dead items and any `type !== 'story'`, then normalizes.
  - [x] Pass `{ next: { revalidate: 300 } }` to every `fetch`, which caches the data for 5 minutes (ISR).
  - [x] Throw a descriptive error on non-OK responses.
- [x] `src/lib/hn/client.test.ts` mocks `global.fetch` and covers:
  - [x] Normalization: domain extraction (strip `www.`), fallback URL when `url` is missing, and `time` converted to a `Date`.
  - [x] Filtering of null, deleted, dead and non-story items.
  - [x] Pagination slicing and the `totalPages` calculation.
  - [x] A non-OK response throws.

## Acceptance criteria

- `pnpm test` passes, with the client tests included.
- The module has no React or Next UI imports, so it is a pure data layer.

## Depends on

#2
