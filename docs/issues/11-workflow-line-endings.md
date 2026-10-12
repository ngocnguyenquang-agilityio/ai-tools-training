## Goal

Write down the per-issue branch, commit and PR workflow, and make line endings consistent so `pnpm format:check` passes on every machine, including Windows clones.

## Tasks

- [ ] Update `CLAUDE.md` with the workflow:
  - [ ] One branch per issue, cut from `feat/ai-tools`: `<type>/<issue>-<slug>`.
  - [ ] Commit messages: `<type>(#<issue>): <message>`.
  - [ ] PRs go into `feat/ai-tools`, titled `[#<issue>] <title>`.
- [ ] Add `.gitattributes` with `* text=auto eol=lf`, so git checks files out with LF line endings. That matches Prettier's default `endOfLine: "lf"`.
- [ ] Renormalize the files already tracked (`git add --renormalize .`).
- [ ] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- The rules in `CLAUDE.md` match the workflow above.
- After a fresh clone on Windows (`core.autocrlf=true`), `pnpm format:check` passes.
- `pnpm lint`, `pnpm typecheck` and `pnpm build` still pass.

## Depends on

#1
