## Goal

Create a reusable `NewsCard` component that shows one `Story`.

## Tasks

- [ ] `src/lib/format.ts`: `formatRelativeTime(date: Date, now = new Date()): string`, e.g. "5 minutes ago" or "3 hours ago" (use `Intl.RelativeTimeFormat`).
- [ ] `src/lib/format.test.ts`: tests seconds, minutes, hours and days, with an injected `now`.
- [ ] `src/components/news-card.tsx`, a synchronous presentational component built on shadcn `Card` and `Badge`. It shows:
  - [ ] The title, which links to `story.url`.
  - [ ] The domain badge, when a domain is present.
  - [ ] Score, author and relative time.
  - [ ] A "N comments" link to `story.commentsUrl`.
- [ ] External links use `target="_blank" rel="noopener noreferrer"`.
- [ ] `src/components/news-card.test.tsx` (RTL) asserts the title text and href, the domain, the score, the author and the comments link.

## Acceptance criteria

- The tests pass.
- The card renders correctly for a story without an external URL (an "Ask HN" style story): the title links to HN and no domain badge is shown.

## Depends on

#3, #4
