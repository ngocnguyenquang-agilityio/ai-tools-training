## Goal

Add two linked personal slash commands. `/wip` writes a pause note for the current branch, and `/standup` turns git activity, GitLab activity and those notes into a paste-ready standup. The commands live in the repo, but their output is personal: they key off the caller's git email and glab `@me`, and the notes stay out of git.

## Tasks

- [x] `.claude/commands/wip.md`: frontmatter with `description`, `argument-hint: [note]`, and `allowed-tools` for read-only git plus `Write`.
  - [x] Overwrite `.claude/wip/<branch>.md` (with `/` in the branch name replaced by `-`). Sections: `# WIP: <branch> (#N) - <date time>`, `## Done`, `## Next` (1–3 steps), `## Open`, `## State` (HEAD sha, number of dirty files, MR `!N` if known).
  - [x] Add `$ARGUMENTS` to the note word for word when it's given. Print the path and a one-line summary.
- [x] `.claude/commands/standup.md`: frontmatter with `description`, `argument-hint: [since, e.g. "3 days"]`, and `allowed-tools` for read-only git plus `Read`/`Glob`.
  - [x] Window: `$ARGUMENTS` if given. Otherwise from the start of the previous working day (on Monday, that means Friday).
  - [x] Sources: `git log --all --author="$(git config user.email)"`, `.claude/wip/*.md`, and `glab mr list --author=@me` + `glab issue list --assignee=@me` through the Terminal panel. When glab isn't available, skip it with a one-line note.
  - [x] Output: plain English text with **Yesterday / Today / Blockers**, at most ~8 bullets, and refs as `#N` / `!N`. Today comes from the wip `Next` sections, and Blockers from their `Open` sections (or "none").
- [x] `.gitignore`: add `.claude/wip/` to the Claude Code block.
- [x] `CLAUDE.md`: list `/standup` and `/wip` under "Claude tooling".
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- `/wip` creates `.claude/wip/<branch>.md` with the five sections, and `git status` doesn't list it.
- `/standup` lists the #23 work (commit `5017afb`, !10) and shows the wip note's `Next` items under Today.
- `/standup 3 days` widens the window.
- Without glab, `/standup` still prints a git-only report with a one-line note.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
