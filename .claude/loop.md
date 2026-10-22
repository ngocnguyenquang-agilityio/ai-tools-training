# Loop: tend this branch's GitHub PR

Work happens on GitHub (`origin`); GitLab is only an end-of-day mirror. Use `gh` for PRs and follow the git rules in `CLAUDE.md`. Do one pass of the steps below, then report.

## How to run commands

- **gh:** runs in Bash. If it reports that you're not logged in, write `PR: gh unavailable` and carry on with steps 3 and 4.
- **git fetch:** `git fetch origin` runs in Bash. If it fails, write `Base: fetch failed` and don't compare against a stale ref.

## Pass memory

Each report ends with a `State:` line holding the `HEAD` SHA, the `origin/feat/ai-tools` SHA and the newest comment time seen. Compare against the `State:` line of the previous pass.

On the first pass there is no previous `State:` line. Run every step, and count all comments as new.

## Steps

1. **Unfinished work.** If this conversation left a step half done, report where it stands. Don't continue it without a yes.
2. **The PR.** Run `gh pr view --json number,state,reviewDecision,comments,reviews,url` for the current branch.
   - If the branch has no PR, write `PR: none for <branch>` and go on to step 3.
   - If the PR is merged, write `PR #N: merged`. If its issue is still open, suggest `gh issue close <issue>`, and suggest `/sync-gitlab`, but don't run them. Skip steps 3 and 4.
   - Otherwise, list each comment and review newer than the `State:` time in one line: who, which file, what they asked. Inline review comments (with file and line) come from `gh api repos/{owner}/{repo}/pulls/<N>/comments`. Then run `gh pr checks` and name any failed check.
3. **Conflicts with the base.** Run `git fetch origin feat/ai-tools`, then `git merge-tree --write-tree --name-only origin/feat/ai-tools HEAD`.
   - Exit code 0 means it merges cleanly.
   - Exit code 1 means conflicts. The first output line is a tree ID, not a file. The conflicted files are the lines after it, up to the first blank line.
   - List any conflicted files. Don't merge or resolve anything without a yes.
4. **Checks.** Run `pnpm lint`, `pnpm typecheck` and `pnpm test`, but only on the first pass or when either SHA moved since the last `State:` line. Report the first failure with its file and line.

## Never, inside a loop pass

- Commit, push, merge or rebase.
- Comment on the PR, resolve threads, or close an issue.
- Edit files to "fix" something.

Each of these needs the user's explicit yes, given in chat for that one action. Fetching is allowed, because it's read-only.

## Report

```
PR #N: <open | merged | none for <branch> | gh unavailable> · <k> new comments · CI <pass | pending | FAIL check-name>
Base: <clean | conflicts in a.ts, b.md | fetch failed>
Checks: <skipped, no change | pass | FAIL lint src/x.ts:12>
State: head=<sha7> base=<sha7> comments=<ISO time or none>
```

If nothing changed since the last pass, reply with only `No change` and the `State:` line.
