---
description: End-of-day mirror. Fast-forward GitLab's feat/ai-tools from GitHub, and close the GitLab copies of issues closed on GitHub.
allowed-tools: Bash(git fetch:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(git log:*), Bash(gh issue view:*)
---

GitHub (`origin`) is where the work happens. GitLab (`gitlab`) gets a copy of the merged code and the issue state once a day. Each push and each issue close needs the user's explicit yes, asked for that one action.

Only `feat/ai-tools` is mirrored. GitHub's `main` and GitLab's `main` are two unrelated "Initial commit"s with no shared history, and nothing merges into `main` yet. Don't push `main` unless the user asks.

## Running commands

- **git fetch/push to `gitlab` and `glab`:** the GitLab credentials and glab's token live in the Windows keyring, and sandboxed Bash can't read them. Run them in the Terminal panel with `run_in_terminal`, then read the result with `read_terminal`.
- **git with `origin` and `gh`:** plain Bash works.

## Steps

1. **Fetch.** Run `git fetch origin` in Bash and `git fetch gitlab` in the Terminal panel.
2. **Fast-forward check.** Run `git merge-base --is-ancestor gitlab/feat/ai-tools origin/feat/ai-tools`.
   - Exit 0 means GitLab can fast-forward. List the commits with `git log --oneline gitlab/feat/ai-tools..origin/feat/ai-tools`. No commits means it's already in sync, so skip step 3.
   - Exit 1 means GitLab has commits GitHub doesn't. Stop and show them (`git log --oneline origin/feat/ai-tools..gitlab/feat/ai-tools`). Never force-push.
3. **Push.** Show the user the commit list, then ask for a yes to run `git push gitlab origin/feat/ai-tools:refs/heads/feat/ai-tools` in the Terminal panel. Done when `git rev-parse gitlab/feat/ai-tools` equals `git rev-parse origin/feat/ai-tools` after another `git fetch gitlab`.
4. **Issues.**
   - List the open GitLab issues with `glab issue list --opened --output json`. A copy is one whose `description` starts with a line `https://github.com/ngocnguyenquang-agilityio/ai-tools-training/issues/<N>`. Match that whole line, not a prefix, so `issues/2` never matches `issues/28`.
   - For each copy, check its GitHub issue with `gh issue view <N> --json state`.
   - List every copy whose GitHub issue is `CLOSED`, and ask for a yes per issue before running `glab issue close <GitLab number>`.
   - Copies only exist from #28 on, so older GitLab issues are never touched.

## Report

```text
feat/ai-tools: <in sync | pushed <k> commits | blocked: GitLab ahead>
Issues: <closed GitLab copies of #N, #M | none to close | glab unavailable>
```
