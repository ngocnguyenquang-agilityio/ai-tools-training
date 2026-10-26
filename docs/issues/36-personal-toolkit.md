## Goal

Replace the old `paul` framework with a small self-contained toolkit of rules, skills and commands inside the repo, so the working rules behave the same without any personal global setup.

## Tasks

- [x] Add `.claude/rules/` (communication, git, review, code-style, testing, security, scope, workflow) and import them from `CLAUDE.md`.
- [x] Add the working skills `grill`, `plan`, `tdd`, `debug`, `review` and `handoff`.
- [x] Add the `/commit-msg` and `/pr-body` commands. They print a message and never run git.
- [x] `review` delegates Correctness, Standards and Spec to the `repo-reviewer` agent; `finish-issue` runs `review` before the commit handoff.
- [x] Delete `/wip`. `handoff` writes the gitignored `.claude/wip/<branch>.md`, and `/standup` reads it.

## Acceptance criteria

- `CLAUDE.md` imports all eight rule files, and each file exists under `.claude/rules/`.
- `/handoff` writes `.claude/wip/<branch>.md` in the format `/standup` reads.
- `/commit-msg` and `/pr-body` print output in this repo's format and run no git command.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
