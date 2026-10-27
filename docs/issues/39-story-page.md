## Goal

Add a story page at `/story/[id]` that shows a story and its Hacker News comment thread as a collapsible tree, so readers can follow a discussion without leaving the app.

## Tasks

- [ ] `src/lib/hn/comments.ts`: `getCommentTree(storyId, { maxDepth, maxComments })` returns the story and a nested list of `{ id, author, publishedAt, text, replies }`. It defaults to depth 3 and 100 comments.
  - [ ] Reuse `getItem`, `isLiveStory` and `htmlToText`. Skip dead, deleted and failed-to-fetch comments, in HN's ranked order.
  - [ ] Return null when the ID isn't a live story.
- [ ] `src/app/story/[id]/page.tsx` (server component): the story header, then the comment tree as plain text inside native `<details>` elements, so threads collapse without client JavaScript. A non-numeric ID or a story that isn't live calls `notFound()`. Set the title to `<story title> · Tech News`.
- [ ] `src/app/story/[id]/loading.tsx` and `error.tsx`, in the style of `src/app/loading.tsx` and `src/app/error.tsx`.
- [ ] `src/components/news-card.tsx`: the comments link goes to `/story/<id>`. The story page keeps a link to the original HN discussion.
- [ ] README: one line on the story page.
- [ ] Jest tests for `getCommentTree`, the page (happy path and 404), the loading and error files, and the changed card.

## Acceptance criteria

- Clicking a card's comments link opens `/story/<id>` with the story and its comments, nested by reply.
- A thread collapses and expands, and works with JavaScript disabled.
- `/story/abc` and the ID of a deleted or dead story show the not-found page.
- Comment text is plain text; no raw HTML from HN is rendered.
- The page links to the HN discussion for comments beyond the cap.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
