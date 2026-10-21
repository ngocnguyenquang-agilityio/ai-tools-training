## Goal

Finish the hook set and climb the Claude Code automation ladder. Two of the three team hooks already exist: format-on-edit (`format-file.mjs`) and block-forbidden-command (`pnpm-guard.mjs`). This issue ships the third, notify-on-finish. It also adds an `@claude` review job to GitLab CI that fires on every MR. The repo lives on GitLab, so this replaces the course's GitHub Actions step.

## Tasks

- [x] `.claude/hooks/notify.mjs`: show a desktop notification when Claude finishes a turn or waits for input.
  - [x] Register it in `.claude/settings.json` under `Notification` and `Stop`.
  - [x] On `Stop`, skip when `stop_hook_active` is set. That's a re-run caused by `stop-checks.mjs`, so skipping avoids a second toast.
  - [x] Windows toast through built-in PowerShell (no extra module). Use `osascript` on macOS and `notify-send` on Linux. With no notifier, stay silent. A terminal bell isn't an option, because Claude Code captures hook output.
  - [x] Never block or slow Claude: run detached and always exit 0.
  - [x] Opt out with `CLAUDE_NOTIFY=0`.
- [x] `.gitlab-ci.yml`: a `claude-review` job.
  - [x] It runs on `merge_request_event`, and on manual `web` pipelines with an `AI_FLOW_INPUT` prompt (the "@claude, do X" trigger).
  - [x] Install the CLI without npm. The docs now use the native installer (`curl -fsSL https://claude.ai/install.sh | bash`), which needs neither npm nor pnpm.
  - [x] Read-only tools only. It posts one MR note through the GitLab API and never pushes code.
  - [x] `allow_failure: true`, so an API outage never blocks a merge.
  - [x] Secrets are only masked CI/CD variables: `ANTHROPIC_API_KEY` and `GITLAB_ACCESS_TOKEN`. They are not marked Protected, so MR pipelines on issue branches get them.
- [ ] Automation ladder, recorded in **Notes**:
  - [ ] Run `/goal` on one bounded task.
  - [ ] Create a local Desktop scheduled task (morning briefing that runs `/standup`).
  - [x] Write a Routines (cloud) overview and its limits for a GitLab repo.
- [x] `CLAUDE.md`: describe the notify hook and its opt-out, and the automation ladder, under "Claude tooling".
- [ ] Exercise: the `claude-review` job comments on this issue's MR. Evaluate each of its comments in **Notes**, and fix the valid ones before the merge.
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- Ending a turn, or a permission prompt, shows a desktop notification. With `CLAUDE_NOTIFY=0`, nothing is shown.
- The notify hook exits 0 even when no notifier is available.
- `glab ci lint` accepts `.gitlab-ci.yml`, and the MR pipeline runs `claude-review`, which posts a note on the MR.
- No token or secret is in any tracked file (`git grep -E 'sk-ant-|glpat-'` finds nothing).
- The setup uses no `npx` or `npm`.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Notes

**Hooks.** Format-on-edit is `format-file.mjs` and block-forbidden-command is `pnpm-guard.mjs`. Both were already in place, so `notify.mjs` is the hook this issue ships.

- Stop hooks run in parallel, so the notification can fire while `stop-checks.mjs` sends Claude back to fix a failure. The re-run has `stop_hook_active` set and stays silent, so you get one toast per turn, but it can come a little early.
- The Windows toast uses PowerShell's own app ID and WinRT types, so it needs no extra module. The text is passed through env vars and `CreateTextNode`, so quotes and `<>&` are safe.

**CI.**

- The job follows Claude Code's GitLab CI/CD docs (beta, maintained by GitLab), with three changes:
  - Claude gets only read-only tools (`Read Grep Glob` and `git diff/log/show`).
  - Claude runs under `env -u GITLAB_ACCESS_TOKEN`, and the job script, not Claude, posts the note. Claude can't push or post anything.
  - `allow_failure: true`.
  - Claude still needs `ANTHROPIC_API_KEY`, and `Read` can open `/proc/self/environ`. So a prompt injection in a diff could put the key into the review. The job refuses to post a review that contains either secret.
  - On Alpine, Claude Code needs the system `ripgrep` (and `libgcc`, `libstdc++`), with `USE_BUILTIN_RIPGREP=0`. That's from the setup docs.
- An `@claude` mention in a comment needs a webhook listener that calls the pipeline trigger API. We don't run one, so the manual trigger is a `web` pipeline with `AI_FLOW_INPUT`.

**Automation ladder.**

1. `/goal` keeps a session going until a condition holds.
2. A local scheduled task runs on this machine while the app is open.
3. A cloud routine (claude.ai/code/routines) runs with the computer off. It needs a GitHub repo, though, so for this repo it could only reach the GitHub history mirror, which isn't worth it.
4. `@claude` in CI is the top rung and runs on GitLab's runners.

## Depends on

none
