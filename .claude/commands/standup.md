---
description: Write my standup (Yesterday / Today / Blockers) from my git commits, my GitLab MRs and issues, and the /wip notes.
argument-hint: [since, e.g. "3 days"]
allowed-tools: Bash(git config user.email), Bash(git log:*), Bash(date:*), Read, Glob
---

## Context

- Me: !`git config user.email`
- Today: !`date "+%A %Y-%m-%d"`
- Window override: $ARGUMENTS

## Task

Write a standup report for me, ready to paste into team chat.

1. **Window.** If "Window override" is non-empty, use it as git's `--since` value (`3 days`, `2026-10-15`). Otherwise start at 00:00 of the previous working day: on Monday that's Friday, on any other day it's yesterday. Pass it as an absolute `"YYYY-MM-DD 00:00"`, because git reads `yesterday` as 24 hours back. Say the window in the report's first line.
2. **Commits.** Run `git log --all --no-merges --author="<my email>" --since="<window>" --format="%h %ad %s" --date=short`. Group the commits by issue, using the `(#N)` in each commit subject.
3. **WIP notes.** Glob `.claude/wip/*.md` and read each note. Their **Next** items feed Today, and their **Open** items feed Blockers.
4. **GitLab.** Run three queries: `glab mr list --author=@me --merged` for Yesterday's merge refs, plus `glab mr list --author=@me` and `glab issue list --assignee=@me` for what's still open. glab's token lives in the OS keyring:
   - When a Terminal-panel tool (`run_in_terminal`) is available, run glab there and read its output.
   - Otherwise try it in Bash.
   - If a call fails on its flags or output format, retry it once exactly as written above.
   - If a query still fails, skip just that query and end the report with a note naming it, e.g. `(GitLab issues skipped: glab issue list failed)`. When every query fails, the note is `(GitLab skipped: glab unavailable)`.
5. **Write** the report as plain text, with at most ~8 bullets in total:

   ```text
   Standup <today> (since <window start>)

   Yesterday
   - #<N> <issue title>: merged (!<M>)

   Today
   - #<N> <next step from the wip note>

   Blockers
   - none
   ```

   - **Yesterday:** finished work from the commits and the merged or opened MRs, one bullet per issue, with refs as `#N` and `!N`.
   - **Today:** the wip notes' **Next** items and my open MRs or issues.
   - **Blockers:** the wip notes' **Open** items, or `none`.

Done when every commit in the window is covered by a Yesterday bullet, and every wip **Next** item is covered by a Today bullet.
