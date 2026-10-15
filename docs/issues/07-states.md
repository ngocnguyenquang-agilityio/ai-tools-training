## Goal

Handle the loading, error and empty states for the news list.

## Tasks

- [x] `src/app/loading.tsx`: a list of shadcn `Skeleton` cards with the same shape as `NewsCard`.
- [x] `src/app/error.tsx` (`'use client'`): a friendly message and a "Try again" button that calls `retry()`. Log the error to the console. (In Next.js 16, `reset()` only re-renders and does not re-fetch, so it would not re-run the request.)
- [x] Empty state: when `stories.length === 0`, render a "No stories right now" message instead of an empty list.

## Acceptance criteria

- With throttling in DevTools, the skeletons appear while the page loads.
- Temporarily making the client throw shows the error UI, and "Try again" re-runs the request.
- An empty result shows the empty-state message.

## Depends on

#6
