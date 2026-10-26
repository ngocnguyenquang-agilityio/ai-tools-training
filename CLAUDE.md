@AGENTS.md

# Tech News — project rules

These rules apply to this repo only and override the user's global defaults where they conflict.

## Working rules

The repo carries its own copy of the working rules, so it behaves the same without any personal global setup. The files live in `.claude/rules/`.

@.claude/rules/communication.md
@.claude/rules/git.md
@.claude/rules/review.md
@.claude/rules/code-style.md
@.claude/rules/testing.md
@.claude/rules/security.md
@.claude/rules/scope.md
@.claude/rules/workflow.md

Critical reminders:

- Never run `git commit` or `git push` on your own: ask and get an explicit yes for each action, or show the commands and wait. This is the same rule as "Branch, commit and PR workflow" below, which has the details; where the wording differs, that section wins.
- Never read or print secrets (`.env*`, keys, credentials) and ask before destructive commands.
- Run the checks below before saying work is done; if you cannot, say "not verified".
- After completing code changes, run the `review` skill before reporting back and before handing over commit commands.

## Package manager

Use **pnpm** only. Never use npm or yarn, and commit only `pnpm-lock.yaml`.

## GitHub, GitLab mirror and git actions

Work happens on GitHub: `https://github.com/ngocnguyenquang-agilityio/ai-tools-training` (remote `origin`). Use the `gh` CLI for issues and pull requests (PRs). Both are referenced as `#N`, because they share GitHub's counter. GitHub owns the issue numbers, and CI runs there (`.github/workflows/`).

GitLab, `https://gitlab.asoft-python.com/ngoc.nguyenquang/ai-tools-training` (remote `gitlab`), is an end-of-day mirror:

- `/sync-gitlab` fast-forwards its `feat/ai-tools` from GitHub and closes the GitLab copies of closed issues. `main` isn't mirrored: the two sites' `main` branches have no shared history.
- Each new issue also gets a GitLab copy with the same title, whose description starts with the GitHub issue URL.
- Don't open MRs or push issue branches there.
- Run `glab` and git commands against `gitlab` in the Terminal panel (`run_in_terminal`), because the GitLab credentials live in the Windows keyring.

Claude may create issues, commit, push, open PRs and sync GitLab, but **must ask the user and get an explicit yes before each action**. An earlier approval does not carry over to the next action.

## Branch, commit and PR workflow (one issue = one branch = one PR)

The project skills run this workflow. `/new-issue` drafts and creates an issue, and `/start-issue <N>` cuts its branch and loads its tasks. When the work is done, use the `finish-issue` skill: it runs the checks and the review, updates the status docs, and hands over the commit, push and PR commands. The rules below are what those skills follow.

`feat/ai-tools` is the integration branch. Issue work always lives on its own issue branch.

`<type>` is a conventional type: `feat`, `fix`, `chore`, `docs`, `test` or `refactor`.

- Pick one type for the issue from its main purpose, and use it for both the branch and the commits.
- When unsure, use `feat`.
- A single commit may use a different type only when it is clearly something else, such as a `fix` inside a `feat` issue.

1. **Branch:** start each issue from an up-to-date `feat/ai-tools`, on a new branch named `<type>/<issue>-<short-slug>`. Examples: `feat/2-jest-setup`, `chore/11-workflow-line-endings`.
2. **Commits:** use `<type>(#<issue>): <message>`. Example: `feat(#2): set up Jest with next/jest and React Testing Library`.
3. **Issue status:** before opening the PR, update the status docs in the issue branch so they merge with the work:
   - In `docs/issues/<NN>-<slug>.md`, tick each finished task (`[x]`).
   - In `docs/issues/README.md`, set the issue's **Where** cell to `GitHub (closed)`.

   Commit it as part of the issue, e.g. `<type>(#<issue>): mark issue done in docs/issues`. After the merge, `feat/ai-tools` already has the correct status, so it needs no follow-up commit.

4. **PR:** push the branch to `origin` and open a PR **into `feat/ai-tools`** (not `main`). Don't merge a PR with red CI. This is a team rule; GitHub doesn't enforce it yet (no branch protection).
   - Title: `[#<issue>] <GitHub issue title>`. Example: `[#2] Set up Jest (next/jest) + React Testing Library`.
   - Body: a summary, how it was verified, and `Closes #<issue>`.
5. **Close the issue:** `feat/ai-tools` is GitHub's default branch, so merging the PR closes the issue through `Closes #<issue>`. Check it closed (`gh issue view <issue>`). If it didn't, ask first, then run `gh issue close <issue>`. The next `/sync-gitlab` closes its GitLab copy.

## Review before every commit

Before asking to commit:

1. Run the `review` skill (`.claude/skills/review/`). It uses the `repo-reviewer` agent (`.claude/agents/repo-reviewer.md`) for the Correctness, Standards and Spec axes, and adds its own Tests, Security and Scope axes. The agent reviews uncommitted and untracked files against the merge-base with `feat/ai-tools`, these rules and the issue spec.
2. Fix hard violations (the skill's Block items) and spec gaps, then re-run the checks below.
3. Show the user the remaining judgement-call findings, then ask for permission to commit.

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm build`
- `pnpm test`

## Claude tooling

- **Hooks** (`.claude/hooks/`) enforce pnpm, format edited files, and run typecheck, lint and related Jest tests at the end of each turn. `notify.mjs` shows a desktop notification when Claude finishes a turn or waits for you. To turn it off, set `CLAUDE_NOTIFY=0` in your environment or under `env` in `.claude/settings.local.json`.
- **Working skills:** `grill` (settle vague requests before acting), `plan` (small verifiable steps), `tdd` (test-first), `debug` (root cause before fix), `review` (pre-commit review), and `handoff` (manual only; writes the branch's pause note to the gitignored `.claude/wip/<branch>.md` for the next session and `/standup`). **Commands:** `/commit-msg [hint]` and `/pr-body [target]` print a commit message or PR description in this repo's format; they never run git.
- **Next.js docs:** before writing Next.js code, use the `next-docs` skill.
- **Tests:** when writing or changing a Jest test, follow the `how-we-write-tests` skill.
- **Personal commands:** `/standup` builds your Yesterday / Today / Blockers report from your commits, your GitHub PRs and issues, and the `handoff` notes in `.claude/wip/`. `/sync-gitlab` is the end-of-day GitLab mirror.
- **UI checks:** after UI changes, the `ui-verifier` agent checks the page at 375px and desktop, in light and dark mode.
- **Playwright MCP:** `.mcp.json` adds the `playwright` server (`pnpm dlx @playwright/mcp@latest`) to drive the running app from a session. Claude Code asks you to approve it on the first session start. It runs with plain `pnpm` on Windows too, without a `cmd /c` wrapper.
- **GitHub MCP:** each developer can add GitHub's hosted server at local scope, not in `.mcp.json` (see #26). Run this in PowerShell: `claude mcp add --scope local --transport http github https://api.githubcopilot.com/mcp/ -H "Authorization: Bearer $(gh auth token)"`. Check `gh auth status` first: the command copies the current token, so re-run it after `gh auth` changes. Its writes (comments, issues, PRs) need the same explicit yes as `gh`.
- **CI:** `.github/workflows/ci.yml` runs the five checks below on every PR into `feat/ai-tools` or `main`, and on pushes to `feat/ai-tools`.
- **`@claude` in CI:** `.github/workflows/claude-review.yml` reviews every non-draft PR once per push and posts one comment. A collaborator's `@claude <request>` PR comment gets an answer. Claude can read and comment but not edit or push, and the job never blocks a merge. For reviews, Claude only writes `claude-review.md`. A separate step posts it, and refuses if it contains the token or any token-like string. GitHub runs comment-triggered workflows from the default branch, so `@claude` needs the workflow on `feat/ai-tools`. Evaluate its findings like any reviewer's. It runs on a Claude Pro/Max subscription, not API credits: it needs the repo secret `CLAUDE_CODE_OAUTH_TOKEN`, made with `claude setup-token`. Its usage counts against that plan's limits.
- **Automation:** use `/goal` in a session for a bounded task with a checkable end. Scheduled tasks are personal and not committed: a local routine (Code tab → Routines → New routine → Local) can run `/standup` each weekday morning, or `/sync-gitlab` each evening.

## Planning

Implementation issues live in `docs/issues/`, one file per issue, named with its GitHub number (see [`docs/issues/README.md`](docs/issues/README.md)). Each piece of work maps to one issue. Issues #18–#27 were first made on GitLab, then copied to GitHub with the same numbers, so new issues start at #28 and never clash with a doc file.
