---
description: Draft a commit message and the commit commands from pending changes (print only)
argument-hint: "[hint or task number]"
disable-model-invocation: true
---

Draft a commit message for the pending work. Print only; never run `git add`, `git commit` or `git push`.

1. Find the merge-base of the current branch with `feat/ai-tools`. Read `git diff <merge-base>` and `git status --porcelain` (read untracked files too).
2. Run the `review` skill on this work. Fix Block and Should fix items and re-run typecheck and tests first.
3. Print, in code blocks:
   - The commit message.
   - The exact `git add` and `git commit` commands for me to run.
   - The remaining judgement-call review findings, if any.

Message format: `<type>(#<task>): <summary>` or `<type>: <summary>` when there is no task.

- `type` is one of `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Summary in the imperative mood, first line at most 72 characters.
- Body explains why the change was made, not what the diff already shows.
- Task number comes from the argument `$ARGUMENTS`, else from the branch name `<type>/<N>-<slug>` (e.g. `feat/2-jest-setup` gives `#2`), else omit the `(#...)` part.
- End with the attribution line given in the session's system reminder, if one is present.
