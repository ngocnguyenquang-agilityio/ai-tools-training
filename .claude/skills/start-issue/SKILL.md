---
name: start-issue
description: Start work on a GitLab issue. Creates its branch from an up-to-date feat/ai-tools and loads its tasks as the plan.
argument-hint: <issue number>
disable-model-invocation: true
---

Start issue `#$ARGUMENTS`. Each step ends when its check holds.

1. **Clean tree.** `git status --porcelain` lists nothing except this issue's own docs, left uncommitted by `/new-issue`: `docs/issues/<NN>-*.md` and `docs/issues/README.md`. Those carry over to the new branch and get committed with the issue. If anything else shows up, stop and ask the user what to do with it.
2. **Up-to-date base.** Run `git fetch origin feat/ai-tools` with `run_in_terminal`, because the GitLab credentials live in the user's Windows keyring. Then `git checkout feat/ai-tools` and `git merge --ff-only origin/feat/ai-tools`. Done when `git rev-parse feat/ai-tools` equals `git rev-parse origin/feat/ai-tools`.
3. **Read the issue.**
   - Read `docs/issues/<NN>-*.md` (`NN` is the number zero-padded to two digits).
   - Read `glab issue view <N>`, also with `run_in_terminal`, and read its output with `read_terminal`.
   - If the two disagree, the GitLab issue wins. Tell the user about the difference.
4. **Branch.** Pick the type from the issue's main purpose: `feat`, `fix`, `chore`, `docs`, `test` or `refactor` (`feat` when unsure). Pick a 2–4 word kebab-case slug, usually from the issue file's name. Then run `git checkout -b <type>/<N>-<slug>`. Done when `git branch --show-current` prints that name.
5. **Plan.** Turn every unchecked `[ ]` task in the issue file into a task-list step. Name the acceptance criteria that will prove the issue done.
6. **Next.js context.** If any task touches `src/app/`, routing, data fetching or config, use the `next-docs` skill before writing code.

Finish by telling the user the branch name, the type you chose and why, and the plan. Then wait for a go-ahead before implementing.
