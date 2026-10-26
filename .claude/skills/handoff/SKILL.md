---
name: handoff
description: Write a handoff note for the current branch so a fresh session, or /standup, can continue this work.
disable-model-invocation: true
argument-hint: "[focus for the next session]"
---

# Handoff

Compact this conversation into one note per branch. It replaces the old `/wip` command, and `/standup` reads it. Notes the old `/wip` wrote already use this format, so they need no migration.

## Steps

1. Gather: `git branch --show-current`, `git rev-parse --short HEAD`, `date "+%Y-%m-%d %H:%M"`, `git status --porcelain`, `git diff --stat HEAD`, and `git log --oneline feat/ai-tools..HEAD`.
2. Write `.claude/wip/<branch>.md` (gitignored; create the folder if needed), with every `/` in the branch name replaced by `-` (`chore/24-personal-commands` becomes `chore-24-personal-commands.md`). Overwrite the file: one note per branch, always the latest.
3. Parse `N` from a `<type>/<N>-<slug>` branch name. On any other branch, leave `(#N)` out of the title.
4. Print the path so the user can paste it into a new session.

## Note format

Use exactly these sections, so `/standup` can read them:

```markdown
# WIP: <branch> (#N) - <YYYY-MM-DD HH:MM>

## Done

- <what is finished: commits, and uncommitted changes by file>

## Next

- <1-3 concrete next steps, each a single action a fresh session can start without asking>

## Open

- <questions, blockers, decisions waiting on someone; "none" when there are none>

## Decisions

- <settled choices and why, so they are not re-litigated; "none" when there are none>

## State

HEAD <sha> · <count> dirty files · PR #<N> (only when this conversation named one) · skills to use next: <names, or "none">
```

## Rules

- Do not duplicate what already lives in commits, diffs or the issue file; point to it.
- If the user passed an argument, make it the first item under **Next**.
- Redact secrets as `<REDACTED>`.
- Keep it short enough to read in one minute.
