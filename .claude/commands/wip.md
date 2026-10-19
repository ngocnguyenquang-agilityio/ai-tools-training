---
description: Write a pause note for the current branch to .claude/wip/, so /standup and the next session can pick up where you left off.
argument-hint: [note]
allowed-tools: Bash(git branch --show-current), Bash(git rev-parse:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(date:*), Read, Write
---

## Context

- Branch: !`git branch --show-current`
- HEAD: !`git rev-parse --short HEAD`
- Now: !`date "+%Y-%m-%d %H:%M"`
- Status: !`git status --porcelain`
- Diff stat: !`git diff --stat HEAD`
- Commits on this branch: !`git log --oneline feat/ai-tools..HEAD`
- Your note: $ARGUMENTS

## Task

Write a pause note for the branch above, so a fresh session (or `/standup` tomorrow) knows exactly where the work stands.

1. **Path.** `.claude/wip/<branch>.md`, with every `/` in the branch name replaced by `-` (`chore/24-personal-commands` → `.claude/wip/chore-24-personal-commands.md`). Overwrite the file: one note per branch, always the latest.
2. **Issue.** Parse `N` from a `<type>/<N>-<slug>` branch name. On any other branch, leave `(#N)` out of the title.
3. **Write** exactly these sections, filled from this conversation, the commits and the diff above:

   ```markdown
   # WIP: <branch> (#N) - <YYYY-MM-DD HH:MM>

   ## Done

   - <what is finished: commits, and uncommitted changes by file>

   ## Next

   - <1-3 concrete next steps, each one a single action>

   ## Open

   - <questions, blockers, decisions waiting on someone; "none" when there are none>

   ## State

   HEAD <sha> · <count> dirty files · MR !<N> (only when this conversation named one)
   ```

   When "Your note" above is non-empty, add it to the top of **Open** word for word, as `- Note: <text>`.

4. **Report** the path and one line: what's next.

Done when the file exists with all five sections and every **Next** item is an action a fresh session could start without asking.
