@AGENTS.md

# Tech News — project rules

These rules apply to this repo only and override the user's global defaults where they conflict.

## Package manager

Use **pnpm** only. Never use npm or yarn, and commit only `pnpm-lock.yaml`.

## GitHub and git actions

Claude may create GitHub issues, commit and push, but **must ask the user and get an explicit yes before each action**. An earlier approval does not carry over to the next action.

## Review before every commit

Before asking to commit:

1. Spawn a subagent that runs the Claude Code `code-review` skill (`/code-review`) on the pending work. The review covers uncommitted and untracked files, not only commits. For this repo, this replaces the global `mattpocock-skills:code-review` rule.
2. Fix real findings, then re-run `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm test` (once issue #2 adds it).
3. Show the user the remaining judgement-call findings, then ask for permission to commit.

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm build`

## Planning

Implementation issues live in `docs/issues/` and on GitHub as issues #1–#10. Each piece of work maps to one issue.
