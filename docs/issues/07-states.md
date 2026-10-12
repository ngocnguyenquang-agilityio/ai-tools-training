## Goal

Handle the loading, error and empty states for the news list.

## Tasks

- [ ] `src/app/loading.tsx`: a list of shadcn `Skeleton` cards with the same shape as `NewsCard`.
- [ ] `src/app/error.tsx` (`'use client'`): a friendly message and a "Try again" button that calls `reset()`. Log the error to the console.
- [ ] Empty state: when `stories.length === 0`, render a "No stories right now" message instead of an empty list.

## Acceptance criteria

- With throttling in DevTools, the skeletons appear while the page loads.
- Temporarily making the client throw shows the error UI, and "Try again" re-runs the request.
- An empty result shows the empty-state message.

## Depends on

#6
