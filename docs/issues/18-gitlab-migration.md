## Goal

The project moved from GitHub to GitLab. Update the workflow docs so they describe GitLab issues, merge requests and `glab` instead of GitHub issues, pull requests and `gh`.

## Tasks

- [ ] `CLAUDE.md`: GitHub → GitLab, PR → MR, `gh` → `glab`. Describe how GitLab auto-closes issues and keep closing them by hand as the fallback.
- [ ] `README.md`: update the "Workflow" section and the project structure note.
- [ ] `docs/issues/README.md`: say where each issue lives now, and replace the `gh issue create` script with a short history note.
- [ ] `docs/issues/09-e2e.md`: skip GitLab CI instead of GitHub Actions.
- [ ] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- No workflow doc tells Claude or a contributor to use GitHub, PRs or `gh` for new work.
- Finished work (issues #1–#4, #11 and #15, PRs #12–#17) is still described as living on GitHub.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
