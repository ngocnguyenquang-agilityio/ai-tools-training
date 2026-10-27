## Goal

Let readers save stories to read later. Saved stories live in the browser's `localStorage`, show on a `/saved` page, and need no account or server.

## Tasks

- [x] `src/lib/bookmarks.ts`: read, add, remove and toggle saved stories in `localStorage`.
  - [x] Store a `Story` snapshot with `publishedAt` as an ISO string, and revive it to a `Date` on read. The snapshot keeps `/saved` working without any API call, so its score and comment count can be out of date.
  - [x] Corrupt JSON and unavailable storage (private window, blocked site data) read as an empty list instead of throwing.
- [x] `src/components/bookmark-button.tsx` (client): a save toggle with `aria-pressed` and a label that names the story. It reads the store with `useSyncExternalStore`, so every button on the page and `/saved` stay in step, and it renders the unsaved state during server rendering.
- [x] `src/components/news-card.tsx`: render the button after the TL;DR button.
- [x] `src/app/saved/page.tsx`: list the saved stories with `NewsCard` (no TL;DR button, since the route only summarizes feed stories). Show an empty state that points back to the feeds. Set the title to `Saved · Tech News`.
- [x] `src/components/site-header.tsx`: a link to `/saved`.
- [x] README: one line on bookmarks and where they are stored.
- [x] Jest tests for the bookmark store, the button, the saved page, and the changed card and header.

## Acceptance criteria

- Clicking save on a card marks it saved. It appears on `/saved` and is still there after a reload.
- Clicking again removes it from `/saved`.
- With nothing saved, `/saved` shows a clear empty state, not an error.
- A browser with storage blocked still renders every page; the save button just doesn't persist.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
