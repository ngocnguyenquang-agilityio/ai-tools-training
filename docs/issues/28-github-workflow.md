## Goal

Move day-to-day work back to GitHub, where CI can run without admin setup, and keep GitLab as an end-of-day mirror. GitHub owns the issue numbers, branches, PRs and CI. GitLab gets the merged code and a copy of each issue once a day.

## Tasks

- [x] One-time setup, in this order, each step after an explicit yes:
  - [x] Swap the remotes: `origin` = GitHub, `gitlab` = GitLab. Point `feat/ai-tools` at `origin/feat/ai-tools`.
  - [x] Fast-forward GitHub's `feat/ai-tools` to the GitLab state.
  - [x] Copy the closed GitLab issues #18–#27 to GitHub as closed issues, in order, before any new issue or PR, so GitHub's numbers match `docs/issues/`.
  - [x] Create this issue on GitHub (it should get #28), then its GitLab copy.
  - [x] Close GitHub #8 (done on GitLab). Close GitLab #9 and #10 with a link to their GitHub originals, which are the live ones now.
  - [x] Set GitHub's default branch to `feat/ai-tools`, so `Closes #N` closes issues on merge and `@claude` comments run.
  - [x] The user adds the `CLAUDE_CODE_OAUTH_TOKEN` repo secret on GitHub (from `claude setup-token`).
- [x] `.github/workflows/ci.yml`: run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` on PRs into `feat/ai-tools` and `main`, and on pushes to `feat/ai-tools`.
- [x] `.github/workflows/claude-review.yml`: Claude reviews each PR in one comment and answers `@claude` in PR comments. It can't edit or push, and it never blocks a merge.
- [x] Delete `.gitlab-ci.yml`.
- [x] `/sync-gitlab` command (`.claude/commands/sync-gitlab.md`): fast-forward GitLab's `feat/ai-tools` from GitHub, and close the GitLab copies of issues closed on GitHub.
- [x] Rewrite the workflow for GitHub (`gh`, PRs) in `CLAUDE.md`, `/new-issue`, `/start-issue`, `finish-issue`, `/standup`, `.claude/loop.md`, `README.md` and `docs/issues/README.md`. `/new-issue` creates the GitHub issue first, then its GitLab copy.

## Acceptance criteria

- `git remote -v` shows `origin` → GitHub and `gitlab` → GitLab.
- GitHub issues #18–#27 match `docs/issues/18-*.md` to `27-*.md` and are closed.
- This issue's PR on GitHub runs `CI`, and all five checks pass (`gh pr checks`).
- With the secret set, `claude-review` posts one review comment on the PR.
- `/sync-gitlab` fast-forwards GitLab's `feat/ai-tools` to GitHub's: both show the same SHA.
- Outside the sync and mirror steps and history notes, `.claude/`, `CLAUDE.md` and `README.md` no longer mention `glab` or GitLab MRs.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Notes

**Why GitHub owns the numbers.** GitHub issues and PRs share one counter, while GitLab issues have their own. The two sites drift apart after the first PR, so only one can own `#N`. GitLab issue copies keep the same title and link to the GitHub issue in their description. Their GitLab number isn't used anywhere.

**Why `main` isn't mirrored.** GitHub's `main` and GitLab's `main` are separate "Initial commit"s with no shared history, so GitLab's can't fast-forward. Nothing merges into `main` yet, so `/sync-gitlab` leaves both alone.

**Why a subscription token, not an API key.** The first review ran on an `ANTHROPIC_API_KEY`, which ran out of credits. The API has no free tier, so the review now uses `claude_code_oauth_token` with a Claude Pro/Max token instead. It counts against the plan's usage limits, with no separate bill.

**Why GitLab only gets fast-forwards.** `/sync-gitlab` pushes only branches already merged on GitHub, so GitLab never needs a force-push. It checks this first and stops if a push wouldn't fast-forward.

## Depends on

none
