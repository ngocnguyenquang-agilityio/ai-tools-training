## Goal

Enforce the project rules with shared Claude Code hooks instead of relying on Claude to remember them, and replace the placeholder README with an interim one that documents the current setup and the hooks.

## Tasks

- [x] Add a committed `.claude/settings.json` that registers the hooks. Scripts live in `.claude/hooks/*.mjs` (Node, so they work on Windows, macOS and Linux).
- [x] `PreToolUse` (Bash): block `npm`, `yarn` and `npx` and point Claude to `pnpm` / `pnpm dlx`.
- [x] `PostToolUse` (Edit/Write): run Prettier on the edited file, and `eslint --fix` on JS/TS files. Report remaining ESLint errors back to Claude.
- [x] `Stop`: when JS/TS files changed, run `pnpm typecheck` and `pnpm lint`, and report failures back to Claude.
- [x] Keep personal Claude files (`.claude/settings.local.json`, `.claude/launch.json`) out of git.
- [x] Rewrite `README.md` as an interim version:
  - [x] Overview, tech stack and prerequisites.
  - [x] Getting started and the current scripts.
  - [x] Project structure.
  - [x] Branch, commit and PR workflow.
  - [x] A "Claude Code hooks" section.
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- Claude running `npm install` is blocked with a message, and `pnpm install` is not.
- A badly formatted file written by Claude ends up formatted.
- A type error left at the end of a turn is reported back to Claude.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

#1
