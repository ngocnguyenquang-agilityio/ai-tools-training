## Goal

Give `/loop` a maintenance prompt for this repo's GitLab MRs. Without one, a bare `/loop` falls back to the built-in prompt, which is centred on GitHub pull requests.

## Tasks

- [ ] `.claude/loop.md`: one pass checks:
  - [ ] the current branch's MR (`glab mr view`, new comments)
  - [ ] conflicts with `feat/ai-tools` (`git merge-tree`)
  - [ ] lint, typecheck and test, only when the branch or base moved
- [ ] In `.claude/loop.md`, say that glab runs in the Terminal panel. Its token is in the Windows keyring, which sandboxed Bash can't read.
- [ ] In `.claude/loop.md`, forbid commit, push, merge, MR comments and issue close inside a loop pass, in line with the CLAUDE.md approval rule.
- [ ] End each pass with a three-line report plus a `State:` line (the HEAD and base SHAs and the newest comment time), so the next pass can tell what changed. A pass with nothing new reports `No change`.
- [ ] Handle the edge cases: the first pass, no MR for the branch, a merged MR, glab unavailable and a failed fetch.
- [ ] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- On a branch with an open MR, `/loop 15m` fires and prints the report, including the `State:` line.
- A later pass with nothing new prints `No change` and the `State:` line.
- No pass commits, pushes or comments.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
