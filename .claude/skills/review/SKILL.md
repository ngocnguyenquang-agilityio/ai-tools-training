---
name: review
description: Review all pending changes before reporting work done. Use after finishing code changes and before handing over commit commands.
---

# Review

Review everything pending, committed or not. Run it once at the end of a unit of work, not after every edit. Skip it when the diff contains no code (docs or config text only).

## Gather

- **Fixed point**: `git merge-base HEAD feat/ai-tools` (the integration branch every PR targets).
- **Diff**: `git diff <merge-base>` (working tree vs merge-base, so uncommitted work is included).
- **New files**: `git status --porcelain`; read untracked files directly.
- **Spec**: the issue file `docs/issues/<NN>-*.md`; the number comes from the branch name `<type>/<N>-<slug>`. If there is no issue, skip the Spec axis. Do not block on asking.
- **Standards**: `CLAUDE.md`, `AGENTS.md`, the lint and format config, and `.claude/skills/how-we-write-tests/SKILL.md` for any changed `*.test.ts(x)`.

## Axes

| Axis | Question |
|---|---|
| Spec | Does the code do what was asked, fully, and nothing less? |
| Correctness | Bugs, edge cases, error handling, races, off-by-one? |
| Standards | Does it follow the repo's written conventions? Also common smells (unclear names, duplication, needless abstraction) as judgement only. |
| Tests | Is new behavior tested? Do tests check behavior, not implementation? |
| Security | Secrets, untrusted input, injection, access control (light check; use `/security-review` for depth). |
| Scope | Anything outside the request: drive-by cleanup, reformatting, unrelated files? |

## Levels

- **Block**: Spec, Correctness or Security problems (`repo-reviewer` calls these hard violations). Must be fixed.
- **Should fix**: Standards and Tests problems.
- **Nit**: smells and style (`repo-reviewer` calls these judgement calls). List only.

## Who reviews what

Spawn the `repo-reviewer` agent (`.claude/agents/repo-reviewer.md`) with the issue number for Correctness, Standards and Spec. While it runs, review Tests, Security and Scope yourself from the same diff and untracked files. Merge both into one report.

## After the review

Fix Block and Should fix items, then re-run the checks listed in `CLAUDE.md` (`pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, `pnpm test`). Report:

1. One-line verdict: clean, or has Block items.
2. Findings by level, each with `file:line`, the problem, the fix, and whether it is "fixed" or "needs your decision".

No praise filler, no restating the diff. Never run `git commit` or `git push`; the user runs commits.
