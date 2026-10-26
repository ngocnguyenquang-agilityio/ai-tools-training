---
name: finish-issue
description: Wrap up the current issue branch for a PR. Runs the checks and the repo-reviewer review, updates the docs/issues status, and hands the user the commit, push and PR commands. Use when the work on an issue is done, or before asking to commit.
---

Bring the current `<type>/<N>-<slug>` branch to a ready-to-commit state. You commit, push and open the PR only after the user says yes to each one, in the moment.

1. **Identify.** Read `N`, `type` and the slug from `git branch --show-current`. Read `docs/issues/<NN>-*.md`. If the branch name doesn't match the pattern, stop and ask. If you started this skill on your own (the user didn't type `/finish-issue`), confirm with the user that the issue is done before going on, because step 4 marks it closed.
2. **Checks green.** Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test`. Done when all five pass. Fix failures before going on.
3. **Review.** Run the `review` skill with the issue number. It spawns the `repo-reviewer` agent, which reviews uncommitted and untracked work against the merge-base with `origin/feat/ai-tools`. If `/commit-msg` or an earlier review already covered this same diff, don't review twice.
   - Fix every hard violation and spec gap.
   - Re-run step 2 after the fixes.
   - Keep the judgement calls for the report.
4. **Status docs.**
   - In the issue file, tick `[x]` every task the diff actually completes. Leave the others unchecked and list them for the user.
   - In `docs/issues/README.md`, set the issue's **Where** cell to `GitHub (closed)`.
5. **Report.** Show the user:
   - The review: hard violations fixed, and the judgement calls still open.
   - The check results.
   - The exact commands, in order, each in its own `bash` block:
     - `git add` with the paths.
     - `git commit` with message `<type>(#N): <summary>`, ending with the `Co-Authored-By` line. Use a separate `<type>(#N): mark issue done in docs/issues` commit when the status docs are the only change left.
     - `git push -u origin <branch>` (`origin` is GitHub).
     - `gh pr create --base feat/ai-tools --title "[#N] <GitHub issue title>" --body "<summary, how it was verified, Closes #N, 🤖 Generated with [Claude Code](https://claude.com/claude-code)>"`.

Then stop. When the user says yes to a command, run that one command, and ask again before the next. Once the PR is open, CI and the Claude review run on it. Read `gh pr checks` and report failures.

After the user merges the PR, check that `Closes #N` closed the issue (`gh issue view N`; `feat/ai-tools` is GitHub's default branch). If it's still open, offer `gh issue close N`. The next `/sync-gitlab` closes the GitLab copy.
