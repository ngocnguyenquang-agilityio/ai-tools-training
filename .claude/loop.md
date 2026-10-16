# Loop: tend this branch's GitLab MR

This repo is on GitLab, not GitHub. Use `glab` for MRs (`!N`), and follow the git rules in `CLAUDE.md`. Do one pass of the steps below, then report.

## How to run commands

- **glab:** its token is in the Windows keyring, and sandboxed Bash can't read it. Run each glab command in the Terminal panel with `run_in_terminal`, then read the result with `read_terminal`. If those tools aren't available, or glab reports "has not been authenticated", write `MR: glab unavailable` and carry on with steps 3 and 4.
- **git fetch:** `origin` is SSH, so Bash usually works. If the fetch fails there, retry it in the Terminal panel. If that fails too, write `Base: fetch failed` and don't compare against a stale ref.

## Pass memory

Each report ends with a `State:` line holding the `HEAD` SHA, the `origin/feat/ai-tools` SHA and the newest comment time seen. Compare against the `State:` line of the previous pass.

On the first pass there is no previous `State:` line. Run every step, and count all comments as new.

## Steps

1. **Unfinished work.** If this conversation left a step half done, report where it stands. Don't continue it without a yes.
2. **The MR.** Run `glab mr view --unresolved` for the current branch. It prints the state and only the unresolved threads.
   - If the branch has no MR, write `MR: none for <branch>` and go on to step 3.
   - If the MR is merged, write `MR !N: merged`. Suggest `glab issue close <N>` in the report, but don't run it. Skip steps 3 and 4.
   - Otherwise, run `glab mr view --comments` too, and list each comment newer than the `State:` time in one line: who, which file, what they asked.
3. **Conflicts with the base.** Run `git fetch origin feat/ai-tools`, then `git merge-tree --write-tree --name-only origin/feat/ai-tools HEAD`.
   - Exit code 0 means it merges cleanly.
   - Exit code 1 means conflicts. The first output line is a tree ID, not a file. The conflicted files are the lines after it, up to the first blank line.
   - List any conflicted files. Don't merge or resolve anything without a yes.
4. **Checks.** Run `pnpm lint`, `pnpm typecheck` and `pnpm test`, but only on the first pass or when either SHA moved since the last `State:` line. Report the first failure with its file and line.

## Never, inside a loop pass

- Commit, push, merge or rebase.
- Comment on the MR, resolve threads, or close an issue.
- Edit files to "fix" something.

Each of these needs the user's explicit yes, given in chat for that one action. Fetching is allowed, because it's read-only.

## Report

```
MR !N: <open | merged | none for <branch> | glab unavailable> · <k> new comments · <u> unresolved
Base: <clean | conflicts in a.ts, b.md | fetch failed>
Checks: <skipped, no change | pass | FAIL lint src/x.ts:12>
State: head=<sha7> base=<sha7> comments=<ISO time or none>
```

If nothing changed since the last pass, reply with only `No change` and the `State:` line.
