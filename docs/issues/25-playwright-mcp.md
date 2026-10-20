## Goal

Add a shared, project-scoped `.mcp.json` with the Playwright MCP server, so every Claude Code session in this repo can open, click and screenshot the running app. It's set up with pnpm and checked against the local dev server.

## Tasks

- [x] `.mcp.json` at the repo root, with one `playwright` server that runs `pnpm dlx @playwright/mcp@latest`.
  - [x] Pin an exact version only if `@latest` conflicts or breaks. If you pin, note why in `CLAUDE.md`. Not pinned: `@latest` works.
  - [x] Check that it starts on Windows. If plain `pnpm` fails there, wrap it as `cmd /c pnpm dlx ...`. Not needed: plain `pnpm` works.
  - [x] Leave out tokens and machine-specific paths. The file is committed.
- [x] Restart the session, approve the project server, and confirm that `claude mcp list` shows `playwright` as connected.
- [x] Drive `http://localhost:3000` (`next-dev` in `.claude/launch.json`) through Playwright MCP:
  - [x] Open home and check that it lists at least one story link.
  - [x] Click the "New" tab and check that the URL has `feed=new` and the tab is active.
  - [x] Click Next/Prev and check that `page` changes in the URL.
  - [x] Take a screenshot.
- [x] `CLAUDE.md`: list Playwright MCP under "Claude tooling", with the first-run approval prompt and any Windows `cmd /c` wrapper.
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- A fresh session in the repo offers to approve the `playwright` server from `.mcp.json`. After approval, `claude mcp list` shows it as connected.
- In a session, Claude opens the dev server, goes from Top to New and to page 2, and returns a screenshot, all through Playwright MCP tools.
- The setup uses no `npx` or `npm`.
- `.mcp.json` holds no secrets.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Notes

`claude mcp add --scope project` writes the same `.mcp.json`. Edit the file directly, though, to keep the pnpm command.

Playwright MCP writes snapshots, console logs and screenshots to `.playwright-mcp/` at the repo root, so `.gitignore` ignores that folder.

## Depends on

none
