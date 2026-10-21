@AGENTS.md

# Tech News — project rules

These rules apply to this repo only and override the user's global defaults where they conflict.

## Package manager

Use **pnpm** only. Never use npm or yarn, and commit only `pnpm-lock.yaml`.

## GitLab and git actions

The repo lives on GitLab: `https://gitlab.asoft-python.com/ngoc.nguyenquang/ai-tools-training` (remote `origin`). Use the `glab` CLI for issues and merge requests (MRs); MRs are referenced as `!N`, issues as `#N`. Finished work (issues #1–#4, #11 and #15, PRs #12–#17) stays on GitHub (remote `github`) as history; don't open new issues or PRs there.

Claude may create GitLab issues, commit, push and open MRs, but **must ask the user and get an explicit yes before each action**. An earlier approval does not carry over to the next action.

## Branch, commit and MR workflow (one issue = one branch = one MR)

The project skills run this workflow. `/new-issue` drafts and creates an issue, and `/start-issue <N>` cuts its branch and loads its tasks. When the work is done, use the `finish-issue` skill: it runs the checks and the review, updates the status docs, and hands over the commit, push and MR commands. The rules below are what those skills follow.

`feat/ai-tools` is the integration branch. Issue work always lives on its own issue branch.

`<type>` is a conventional type: `feat`, `fix`, `chore`, `docs`, `test` or `refactor`.

- Pick one type for the issue from its main purpose, and use it for both the branch and the commits.
- When unsure, use `feat`.
- A single commit may use a different type only when it is clearly something else, such as a `fix` inside a `feat` issue.

1. **Branch:** start each issue from an up-to-date `feat/ai-tools`, on a new branch named `<type>/<issue>-<short-slug>`. Examples: `feat/2-jest-setup`, `chore/11-workflow-line-endings`.
2. **Commits:** use `<type>(#<issue>): <message>`. Example: `feat(#2): set up Jest with next/jest and React Testing Library`.
3. **Issue status:** before opening the MR, update the status docs in the issue branch so they merge with the work:
   - In `docs/issues/<NN>-<slug>.md`, tick each finished task (`[x]`).
   - In `docs/issues/README.md`, set the issue's **Where** cell to `GitLab (closed)`.

   Commit it as part of the issue, e.g. `<type>(#<issue>): mark issue done in docs/issues`. After the merge, `feat/ai-tools` already has the correct status, so it needs no follow-up commit.

4. **MR:** push the branch and open an MR **into `feat/ai-tools`** (not `main`).
   - Title: `[#<issue>] <GitLab issue title>`. Example: `[#2] Set up Jest (next/jest) + React Testing Library`.
   - Description: a summary, how it was verified, and `Closes #<issue>`. GitLab only auto-closes issues when an MR merges into the default branch, so merging into `feat/ai-tools` leaves the issue open.
5. **Close the issue:** after the user merges the MR, run `glab issue close <issue>`, after asking first.

## Review before every commit

Before asking to commit:

1. Spawn the `repo-reviewer` agent (`.claude/agents/repo-reviewer.md`) on the pending work. It reviews uncommitted and untracked files against the merge-base with `feat/ai-tools`, for correctness, these rules and the issue spec. For this repo, this replaces the global `mattpocock-skills:code-review` rule.
2. Fix hard violations and spec gaps, then re-run the checks below.
3. Show the user the remaining judgement-call findings, then ask for permission to commit.

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`
- `pnpm build`
- `pnpm test`

## Claude tooling

- **Hooks** (`.claude/hooks/`) enforce pnpm, format edited files, and run typecheck, lint and related Jest tests at the end of each turn. `notify.mjs` shows a desktop notification when Claude finishes a turn or waits for you. To turn it off, set `CLAUDE_NOTIFY=0` in your environment or under `env` in `.claude/settings.local.json`.
- **Next.js docs:** before writing Next.js code, use the `next-docs` skill.
- **Tests:** when writing or changing a Jest test, follow the `how-we-write-tests` skill.
- **Personal commands:** `/wip` writes a pause note for the current branch to the gitignored `.claude/wip/`, and `/standup` builds your Yesterday / Today / Blockers report from your commits, your GitLab MRs and issues, and those notes.
- **UI checks:** after UI changes, the `ui-verifier` agent checks the page at 375px and desktop, in light and dark mode.
- **Playwright MCP:** `.mcp.json` adds the `playwright` server (`pnpm dlx @playwright/mcp@latest`) to drive the running app from a session. Claude Code asks you to approve it on the first session start. It runs with plain `pnpm` on Windows too, without a `cmd /c` wrapper.
- **GitHub MCP:** GitLab's built-in MCP server is turned off on our instance (see #26), so each developer can add GitHub's hosted server at local scope, not in `.mcp.json`. Run this in PowerShell: `claude mcp add --scope local --transport http github https://api.githubcopilot.com/mcp/ -H "Authorization: Bearer $(gh auth token)"`. Check `gh auth status` first: the command copies the current token, so re-run it after `gh auth` changes. Use it only for the GitHub history repo. Its writes (comments) need the same explicit yes as `glab`, and new issues and PRs stay on GitLab.
- **`@claude` in CI:** the `claude-review` job in `.gitlab-ci.yml` reviews every MR and posts one note, once it's turned on. It's off until the project has a runner. Turn it on with the CI/CD variable `CLAUDE_REVIEW_ENABLED=true`. Evaluate its findings like any reviewer's. To ask Claude something by hand, run a pipeline with `AI_FLOW_INPUT` set. It needs the masked CI/CD variables `ANTHROPIC_API_KEY` and `GITLAB_ACCESS_TOKEN`. Don't mark them Protected, or MR pipelines on issue branches won't get them. Claude in CI gets read-only tools and runs without the GitLab token. The job posts the note, and it refuses to post one that contains a secret.
- **Automation:** use `/goal` in a session for a bounded task with a checkable end. Scheduled tasks are personal and not committed: a local routine (Code tab → Routines → New routine → Local) can run `/standup` each weekday morning. Cloud routines (claude.ai/code/routines) only clone GitHub repos, so they can't work on this GitLab repo.

## Planning

Implementation issues live in `docs/issues/`. Open issues are on GitLab; finished ones stay on GitHub (see [`docs/issues/README.md`](docs/issues/README.md)). Each piece of work maps to one issue. Issues #5–#10 were recreated on GitLab with their GitHub numbers. GitLab numbers new issues from #19 on, so they never reuse a GitHub issue or PR number.
