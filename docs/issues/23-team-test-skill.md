## Goal

Add a team skill, `how-we-write-tests`, that records this repo's Jest + React Testing Library conventions. Claude then loads it whenever it writes a test, and `repo-reviewer` checks new tests against the same rules.

## Tasks

- [x] `.claude/skills/how-we-write-tests/SKILL.md`: frontmatter `name` and a `description` that triggers on writing, adding, fixing or reviewing `*.test.ts(x)` files. Leave it model-invocable, so it also works as `/how-we-write-tests`.
- [x] In the skill body, write down the conventions the existing tests follow:
  - [x] placement and naming: colocated `*.test.ts(x)`, one `describe` per unit, behaviour-sentence `it` names, `it.each` for case tables
  - [x] imports through `@/`, local fixture factories (`makeStory`, `story(id, overrides)`), and fixed time through a `now` prop
  - [x] fetch code in `src/lib`: the `@jest-environment node` docblock, a `global.fetch` route-map stub with a 404 fallback, restored in `afterEach`
  - [x] async Server Component pages: `jest.mock` + `jest.mocked`, a `next/cache` stub, `render(await Page({ params, searchParams }))`
  - [x] client components: mocked hook modules with state reset in `beforeEach`, and `fireEvent` (no user-event)
  - [x] role-and-name queries, `within`, accessibility assertions, the edge cases to cover, and no snapshots
- [x] End the skill with a table that maps each case to a real test file (`src/lib/hn/client.test.ts`, `src/app/page.test.tsx`, `src/components/theme-toggle.test.tsx`, `src/components/news-card.test.tsx`), plus a "Done when" line. Don't add copied templates.
- [x] `.claude/agents/repo-reviewer.md`: in the Standards axis, check any changed `*.test.ts(x)` against the skill.
- [x] `CLAUDE.md`: list the skill under "Claude tooling".
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- In a fresh session, asking "add a test for an edge case of `formatRelativeTime` in `src/lib/format.ts`" loads the skill without naming it, and the generated test follows its rules.
- Every rule in the skill matches at least one existing test file. None is aspirational.
- `repo-reviewer` names the skill when the diff touches a test file.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
