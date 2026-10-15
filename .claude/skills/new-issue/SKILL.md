---
name: new-issue
description: Draft a new issue as docs/issues/<NN>-<slug>.md, add it to the README table, and create it on GitLab after a yes.
argument-hint: <what the issue is about>
disable-model-invocation: true
---

Draft an issue for: $ARGUMENTS

1. **Number.** Take the highest number in the table in `docs/issues/README.md` plus one, and never below 19. GitLab assigns the real number, and step 5 reconciles it.
2. **File.** Write `docs/issues/<NN>-<slug>.md` with exactly these `##` sections, in this order. Copy the tone and granularity of the most recent issue file.
   - **Goal**: one or two sentences on the outcome.
   - **Tasks**: `- [ ]` checkboxes, each small enough for one sitting. Name files and functions when you know them.
   - **Acceptance criteria**: observable checks. End with the repo checks (`pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, `pnpm test`).
   - **Depends on**: `#N` references, or `none`.
3. **Index.**
   - Add a row to the table in `docs/issues/README.md` with **Where** set to `GitLab`.
   - Update the "Order" line if the new issue changes the dependency order.
4. **Review.** Show the user the file and wait for edits or a yes.
5. **Create.** After an explicit yes, run this with `run_in_terminal`:
   `glab issue create --yes --title "<title>" --description-file docs/issues/<NN>-<slug>.md`
   Then read the assigned number from the output with `read_terminal`. If it differs from `NN`, rename the file and fix its README row.

Creating the issue is the end of this skill. The two doc changes stay uncommitted. `/start-issue <N>` carries them onto the issue branch, where they're committed with the work.
