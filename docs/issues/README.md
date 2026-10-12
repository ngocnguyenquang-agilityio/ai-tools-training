# Tech News: implementation issues

There is one file per GitHub issue. Each body has these sections: **Goal**, **Tasks**, **Acceptance criteria**, **Depends on**.

**Stack:**

- Next.js (App Router) and TypeScript
- pnpm
- Tailwind and shadcn/ui
- Hacker News API
- Jest (`next/jest`) and React Testing Library
- Playwright
- ESLint and Prettier

| #   | Title                                                                     | File                                             | Depends on |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| 1   | Scaffold Next.js app with pnpm, TypeScript, Tailwind, ESLint and Prettier | [01-scaffold.md](01-scaffold.md)                 | none       |
| 2   | Set up Jest (next/jest) + React Testing Library                           | [02-jest.md](02-jest.md)                         | #1         |
| 3   | Initialize shadcn/ui                                                      | [03-shadcn.md](03-shadcn.md)                     | #1         |
| 4   | Hacker News API client and types                                          | [04-hn-client.md](04-hn-client.md)               | #2         |
| 5   | NewsCard component                                                        | [05-news-card.md](05-news-card.md)               | #3, #4     |
| 6   | Home page: list top tech stories                                          | [06-home-page.md](06-home-page.md)               | #5         |
| 7   | Loading, error and empty states                                           | [07-states.md](07-states.md)                     | #6         |
| 8   | Feed tabs (Top/New/Best) and pagination                                   | [08-feeds-pagination.md](08-feeds-pagination.md) | #6         |
| 9   | Playwright E2E tests                                                      | [09-e2e.md](09-e2e.md)                           | #7, #8     |
| 10  | Responsive polish, dark mode, README and deploy                           | [10-polish-docs.md](10-polish-docs.md)           | #9         |

Order: 1 → {2, 3} → 4 → 5 → 6 → {7, 8} → 9 → 10

## Create the issues

Run these from the repo root, **in order**, so the GitHub numbers match the `#N` references:

```bash
gh issue create --title "Scaffold Next.js app with pnpm, TypeScript, Tailwind, ESLint and Prettier" --body-file docs/issues/01-scaffold.md
gh issue create --title "Set up Jest (next/jest) + React Testing Library" --body-file docs/issues/02-jest.md
gh issue create --title "Initialize shadcn/ui" --body-file docs/issues/03-shadcn.md
gh issue create --title "Hacker News API client and types" --body-file docs/issues/04-hn-client.md
gh issue create --title "NewsCard component" --body-file docs/issues/05-news-card.md
gh issue create --title "Home page: list top tech stories" --body-file docs/issues/06-home-page.md
gh issue create --title "Loading, error and empty states" --body-file docs/issues/07-states.md
gh issue create --title "Feed tabs (Top/New/Best) and pagination" --body-file docs/issues/08-feeds-pagination.md
gh issue create --title "Playwright E2E tests" --body-file docs/issues/09-e2e.md
gh issue create --title "Responsive polish, dark mode, README and deploy" --body-file docs/issues/10-polish-docs.md
```
