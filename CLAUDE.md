@AGENTS.md

# Tech News — project rules

These rules apply to this repo only and override the user's global defaults where they conflict.

## Package manager

Use **pnpm** only. Never use npm or yarn, and commit only `pnpm-lock.yaml`.

## GitHub and git actions

Claude may create GitHub issues, commit, push and open PRs, but **must ask the user and get an explicit yes before each action**. An earlier approval does not carry over to the next action.

## Branch, commit and PR workflow (one issue = one branch = one PR)

`feat/ai-tools` is the integration branch. Never commit issue work directly to it.

`<type>` is a conventional type: `feat`, `fix`, `chore`, `docs`, `test` or `refactor`.

- Pick one type for the issue from its main purpose, and use it for both the branch and the commits.
- When unsure, use `feat`.
- A single commit may use a different type only when it is clearly something else, such as a `fix` inside a `feat` issue.

1. **Branch:** start each issue from an up-to-date `feat/ai-tools`, on a new branch named `<type>/<issue>-<short-slug>`. Examples: `feat/2-jest-setup`, `chore/11-workflow-line-endings`.
2. **Commits:** use `<type>(#<issue>): <message>`. Example: `feat(#2): set up Jest with next/jest and React Testing Library`.
3. **PR:** push the branch and open a PR **into `feat/ai-tools`** (not `main`).
   - Title: `[#<issue>] <GitHub issue title>`. Example: `[#2] Set up Jest (next/jest) + React Testing Library`.
   - Body: a summary, how it was verified, and `Closes #<issue>`. GitHub only auto-closes the issue once the work reaches `main`.
4. **Close the issue:** after the user merges the PR, run `gh issue close <issue>`, after asking first.

## Review before every commit

Before asking to commit:

1. Spawn a subagent that runs the Claude Code `code-review` skill (`/code-review`) on the pending work. The review covers uncommitted and untracked files, not only commits. For this repo, this replaces the global `mattpocock-skills:code-review` rule.
2. Fix real findings, then re-run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` (once issue #2 adds it).
3. Show the user the remaining judgement-call findings, then ask for permission to commit.

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm build`

## Planning

Implementation issues live in `docs/issues/` and on GitHub (#1–#11). Each piece of work maps to one issue.
