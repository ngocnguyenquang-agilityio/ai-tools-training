## Goal

Show the current top Hacker News stories on the home page, rendered on the server.

## Tasks

- [x] `src/app/page.tsx` becomes an `async` Server Component. It calls `getStories('top', { page: 1, pageSize: 30 })` and renders a list of `NewsCard`s.
- [x] `src/components/site-header.tsx`: the site name "Tech News" and a short tagline.
- [x] `src/components/site-footer.tsx`: credits "Data from the Hacker News API" with a link.
- [x] Wire the header and footer into `src/app/layout.tsx`, with a centered, max-width content container.
- [x] Use a semantic list (`<ol>`/`<li>`) for the stories.

## Acceptance criteria

- `/` shows 30 live stories.
- The story titles appear in the HTML returned by the server (view-source), not only after hydration.
- `pnpm build` passes, and the route is cached and revalidates every 5 minutes.

## Depends on

#5
