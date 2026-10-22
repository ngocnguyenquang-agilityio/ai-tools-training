---
name: new-issue
description: Draft a new issue as docs/issues/<NN>-<slug>.md, add it to the README table, create it on GitHub after a yes, then mirror it on GitLab after another yes.
argument-hint: <what the issue is about>
disable-model-invocation: true
---

Draft an issue for: $ARGUMENTS

1. **Number.** Use the next free GitHub number: check `gh issue list --state all -L 1` and `gh pr list --state all -L 1`, because issues and PRs share the counter, and take the higher one plus one. GitHub assigns the real number, and step 5 reconciles it.
2. **File.** Write `docs/issues/<NN>-<slug>.md` with exactly these `##` sections, in this order. Copy the tone and granularity of the most recent issue file.
   - **Goal**: one or two sentences on the outcome.
   - **Tasks**: `- [ ]` checkboxes, each small enough for one sitting. Name files and functions when you know them.
   - **Acceptance criteria**: observable checks. End with the repo checks (`pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, `pnpm test`).
   - **Depends on**: `#N` references, or `none`.
3. **Index.**
   - Add a row to the table in `docs/issues/README.md` with **Where** set to `GitHub`.
   - Update the "Order" line if the new issue changes the dependency order.
4. **Review.** Show the user the file and wait for edits or a yes.
5. **Create on GitHub.** After an explicit yes, run in Bash:
   `gh issue create --title "<title>" --body-file docs/issues/<NN>-<slug>.md`
   It prints the issue URL. If its number differs from `NN`, rename the file and fix its README row.
6. **Mirror on GitLab.** Ask again. After a yes, write the GitLab description to a scratchpad file: the GitHub issue URL on the first line, a blank line, then the issue file's body. Run this with `run_in_terminal`, because glab's token lives in the Windows keyring:
   `glab issue create --yes --title "<same title>" --description-file <scratchpad file>`
   GitLab's own number isn't used anywhere. `/sync-gitlab` finds the copy by the GitHub URL. If the user says no, or glab fails, say so. `/sync-gitlab` won't close a copy that doesn't exist.

Creating the issues is the end of this skill. The two doc changes stay uncommitted. `/start-issue <N>` carries them onto the issue branch, where they're committed with the work.
