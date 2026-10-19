---
name: how-we-write-tests
description: This repo's Jest + React Testing Library conventions. Use when writing, fixing or reviewing a *.test.ts(x) file, or adding test coverage to a component, page or src/lib module.
---

Every test in `src/` follows one house style. Match it, so a new test reads like its neighbours. When a case below doesn't fit, copy the nearest reference file.

## Every test

- **Place** `foo.test.ts(x)` next to `foo.ts(x)`. Give each exported unit its own top-level `describe`, named after it.
- **Name** each `it` as a behaviour sentence, with the concrete input when it sharpens the claim: `"falls back to Top, page 1, for /?feed=foo&page=-3"`. Put tables of cases in `it.each`, with a label column for readable names (`["a negative number", "-3"]`).
- **Import** the unit through `@/` in component and page tests. A `src/lib` test imports its sibling relatively (`./client`).
- **Build fixtures** with a factory in the test file itself: `makeStory(id)` or `story(id, overrides)`, typed with `Story` / `HNItem` from the types module (`@/lib/hn/types`, or `./types` inside `src/lib/hn`). One shared `const story: Story` plus spreads (`{ ...story, score: 1 }`) also works.
- **Pin time.** Fix `now` (`new Date("2026-01-15T12:00:00Z")`) and pass it in, either as the component's `now` prop or as the function's argument. Dates and timestamps in fixtures are fixed values. The one test that uses the real clock checks the default `now` itself.
- **Lay out** each test as arrange, act, assert, with a blank line between the blocks. Assert explicit values (`toEqual`, `toHaveAttribute`, `toHaveTextContent`). The repo has no snapshot tests.

## By kind of unit

**`src/lib` code that fetches.** Put a `/** @jest-environment node */` docblock at the top of the file. Stub `global.fetch` with a `mockFetch(routes)` helper: a URL→JSON map where any unknown URL returns `new Response("Not Found", { status: 404, statusText: "Not Found" })`. Save `originalFetch` and restore it in `afterEach`. Assert the fetch options too (`{ next: { revalidate: 300 } }`) and the call count when paging matters.

**Pure `src/lib` functions.** Call them directly, with no rendering or mocks. Cover the input space with `it.each`, including the invalid inputs the function must reject or clamp.

**Async Server Component pages.** Stub the data module with `jest.mock("@/lib/hn/client", () => ({ getStories: jest.fn() }))` and wrap it with `jest.mocked(...)`. Stub `next/cache` with `jest.mock("next/cache", () => ({ cacheLife: jest.fn() }))`. Render through a helper: `render(await Home({ params: Promise.resolve({}), searchParams: Promise.resolve(sp) }))`. Call `mockReset()` in `beforeEach`, and give each test its own `mockResolvedValue`.

**Client components.** Mock the hook's module (`jest.mock("next-themes", ...)`) and read state from a module-level `let`, which `beforeEach` resets along with `mockClear()`. Drive interaction with `fireEvent` from `@testing-library/react`; `@testing-library/user-event` is not installed. Silence expected `console.error` with `jest.spyOn(...).mockImplementation(() => {})`, then call `jest.restoreAllMocks()` in `afterEach`, and assert the call.

## Queries and assertions

- **Query** by role and accessible name: `getByRole("link", { name: "Top" })` or `getByRole("heading", { level: 2, name })`. Next come `getByText` and `getByLabelText`. Scope with `within(nav)`. Check absence with `queryBy*` + `.not.toBeInTheDocument()`.
- **Reach for `container`** only for structure that has no role: `container.querySelector("ol")`, `[data-slot="badge"]`, `toBeEmptyDOMElement()`.
- **Assert the contract**, not the markup. That means `href`, `target="_blank"` with `rel="noopener noreferrer"`, `aria-current="page"`, `aria-disabled="true"` and `dateTime`. Repeated checks go into a named helper (`expectDisabled(control)`).
- **Cover the edges** this app hits: empty feed, a page past the end, invalid search params, a failed fetch, null/deleted/dead items, and singular vs plural copy.

## Reference files

| Case                                      | Copy from                                 |
| ----------------------------------------- | ----------------------------------------- |
| `src/lib` fetch code                      | `src/lib/hn/client.test.ts`               |
| Pure function with a case table           | `src/lib/search-params.test.ts`           |
| Function that takes `now`                 | `src/lib/format.test.ts`                  |
| Async Server Component page               | `src/app/page.test.tsx`                   |
| Presentational component with a fixture   | `src/components/news-card.test.tsx`       |
| Component with a mocked hook              | `src/components/theme-toggle.test.tsx`    |
| Error boundary, console spy, `fireEvent`  | `src/app/error.test.tsx`                  |
| Disabled controls and an assertion helper | `src/components/feed-pagination.test.tsx` |

**Done when** `pnpm test <file>` passes and every bullet above that applies to the unit holds in the new test.
