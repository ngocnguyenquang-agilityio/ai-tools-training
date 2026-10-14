## Goal

Create a reusable `NewsCard` component that shows one `Story`.

## Tasks

- [x] `src/lib/format.ts`: `formatRelativeTime(date: Date, now = new Date()): string`, e.g. "5 minutes ago" or "3 hours ago" (use `Intl.RelativeTimeFormat`).
- [x] `src/lib/format.test.ts`: tests seconds, minutes, hours and days, with an injected `now`.
- [x] `src/components/news-card.tsx`, a synchronous presentational component built on shadcn `Card` and `Badge`. It shows:
  - [x] The title, which links to `story.url`.
  - [x] The domain badge, when a domain is present.
  - [x] Score, author and relative time.
  - [x] A "N comments" link to `story.commentsUrl`.
- [x] External links use `target="_blank" rel="noopener noreferrer"`.
- [x] `src/components/news-card.test.tsx` (RTL) asserts the title text and href, the domain, the score, the author and the comments link.

## Acceptance criteria

- The tests pass.
- The card renders correctly for a story without an external URL (an "Ask HN" style story): the title links to HN and no domain badge is shown.

## Depends on

#3, #4
