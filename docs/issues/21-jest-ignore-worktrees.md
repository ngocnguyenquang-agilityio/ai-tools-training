## Goal

Make `pnpm test` in the main checkout run only this checkout's tests. Today Jest also runs the copies in Claude Code worktrees under `.claude/worktrees/`, and those fail.

## Tasks

- [x] `jest.config.ts`: add `/.claude/` to `testPathIgnorePatterns`, with a short comment on why.
- [x] `jest.config.ts`: add `modulePathIgnorePatterns: ["<rootDir>/.claude/"]`, so jest-haste-map doesn't see the worktree's `package.json` as a duplicate package.
- [x] `eslint.config.mjs`: add `.claude/**` to `globalIgnores`. ESLint also lints the worktrees' `.next/` build output (`.prettierignore` already ignores `.claude/`).
- [x] `tsconfig.json`: add `.claude` to `exclude`, so `pnpm typecheck` skips the worktrees' copies of `src/`.
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- With a worktree present under `.claude/worktrees/`, `pnpm test` from the repo root runs only the root `src/` suites and passes.
- No jest-haste-map "duplicate package name" warning.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
