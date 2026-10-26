---
description: Draft a pull request description for the current branch (print only)
argument-hint: "[target branch]"
disable-model-invocation: true
---

Draft a pull request description for me to paste into GitHub. Print only; never create the PR or push.

1. Target branch is `$ARGUMENTS`, else `origin/feat/ai-tools` (after `git fetch origin feat/ai-tools`). Find the merge-base with it.
2. Read `git log <merge-base>..HEAD` and `git diff <merge-base>`, and the issue file `docs/issues/<NN>-*.md` (number from the branch name `<type>/<N>-<slug>`).
3. Print the title `[#<N>] <GitHub issue title>`, then the body in one code block with these sections:
   - **Summary**: what changed and why, in a few sentences.
   - **Evidence**: how it was verified (the five checks in `CLAUDE.md`, manual checks) and anything not verified.
   - **Merge danger**: risks, migrations, breaking changes, or "none".
   - A final line `Closes #<N>`.
4. End with the attribution line given in the session's system reminder, if one is present.
