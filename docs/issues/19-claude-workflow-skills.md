## Goal

Package the project workflow as Claude Code skills and subagents, so Claude follows a written procedure rather than relying on remembering prose in `CLAUDE.md` every turn. Also run related Jest tests at the end of each turn, share the dev-server preview config, and shorten `CLAUDE.md`.

## Tasks

- [x] Project skills in `.claude/skills/`:
  - [x] `start-issue`: branch `<type>/<N>-<slug>` from an up-to-date `feat/ai-tools` and load the issue's tasks.
  - [x] `finish-issue`: run the checks and the review, update the issue status docs, then show the commit, push and MR commands without running them.
  - [x] `new-issue`: write `docs/issues/<NN>-<slug>.md`, add the README row, then ask before `glab issue create`.
  - [x] `next-docs`: read the matching guide in `node_modules/next/dist/docs/` before writing Next.js code.
- [x] Subagents in `.claude/agents/`:
  - [x] `repo-reviewer`: read-only review of the uncommitted and untracked work against the repo rules and the issue spec.
  - [x] `ui-verifier`: check a page in the built-in browser at 375px and desktop width, in light and dark mode.
- [x] `stop-checks.mjs`: after typecheck and lint, run `jest --findRelatedTests` on the changed JS/TS files.
- [x] Share `.claude/launch.json` (stop ignoring it in git).
- [x] Add a status line that shows the branch and the issue number.
- [x] Note in `09-e2e.md` that the Playwright MCP server is worth adding with #9.
- [x] `CLAUDE.md`: point the workflow at the skills and the reviewer agent, and add `pnpm test` to the checks.
- [x] `README.md`: turn "Claude Code hooks" into "Claude Code tooling".
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- `/start-issue`, `/finish-issue` and `/new-issue` show up in Claude Code, and `/finish-issue` stops before any commit or push.
- A failing test related to a changed file is reported back to Claude when it ends its turn.
- The status line shows the branch and `#19` on this branch.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
