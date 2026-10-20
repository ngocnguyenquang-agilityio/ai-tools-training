## Goal

Connect Claude Code to a code host through an MCP server, so a session reads real PR and issue state, and can comment, instead of guessing. GitLab's built-in MCP server is turned off on our instance, so this uses GitHub's hosted MCP server against the GitHub history repo (`ngocnguyenquang-agilityio/ai-tools-training`). Each developer uses their own credentials, so nothing secret lands in the repo.

## Tasks

- [x] Pick the server.
  - [x] Try GitLab's built-in MCP endpoint, `https://gitlab.asoft-python.com/api/v4/mcp`, with HTTP transport and OAuth sign-in.
  - [x] It isn't available, so switch to GitHub's hosted MCP server, `https://api.githubcopilot.com/mcp/`.
  - [x] Record the choice and the reason in this issue's **Notes**.
- [x] Add the server with `claude mcp add --scope local ...`, so it applies to this repo only and stays in your own `~/.claude.json`, out of `.mcp.json`. The token is never in a committed file.
- [x] Restart the session and confirm that `claude mcp list` shows `github` as connected.
- [x] Exercise, end to end in one session:
  - [x] List the PRs and issues of `ngocnguyenquang-agilityio/ai-tools-training`.
  - [x] Read PR #17 in full.
  - [x] Post one comment on PR #17, after an explicit yes from the user. Don't comment anywhere else, and don't open new issues or PRs on GitHub.
- [x] `CLAUDE.md`: add one line under "Claude tooling". It says that the GitHub MCP server is added at local scope (not in `.mcp.json`), and that its writes need the same explicit yes as `glab`.
- [x] Add this issue to `docs/issues/README.md`.

## Acceptance criteria

- `claude mcp list` shows `github` as connected, at local scope.
- In a session, Claude lists the GitHub repo's PRs and issues and reads PR #17, using GitHub MCP tools rather than `gh`.
- One comment, approved by the user, appears on PR #17, and on no other issue or PR.
- No token or secret is in any tracked file (`git grep` for the token prefixes `gho_`, `ghp_` and `github_pat_` finds nothing).
- The setup uses no `npx` or `npm`.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Notes

`glab` stays the tool for creating issues and MRs in the project skills (`/new-issue`, `finish-issue`). This issue only adds MCP as a way to read a code host and to comment.

**GitLab's built-in server is turned off on our instance.**

- Unauthenticated, `POST /api/v4/mcp` returns `401` with OAuth metadata, and the authorization server supports dynamic client registration, PKCE `S256` and an `mcp` scope.
- After an OAuth sign-in, though, Claude Code reports "MCP endpoint not found". The same call made as the user through `glab api mcp` returns `404 Not Found`.
- So GitLab checks authentication before the feature, and the MCP feature is off. Turning it on needs an instance admin.
- Switch back to GitLab once an admin enables it: `claude mcp add --scope local --transport http gitlab https://gitlab.asoft-python.com/api/v4/mcp`, then sign in through `/mcp`.

**GitHub needs a token header, not OAuth.** The course command (`claude mcp add --transport http github https://api.githubcopilot.com/mcp/`) fails with "Incompatible auth server: does not support dynamic client registration". Following GitHub's own Claude Code setup, the server is added with an `Authorization: Bearer` header, using the token from `gh auth token`. The user runs that command, so Claude never sees the token. It's stored in `~/.claude.json`, which is local and outside the repo.

## Depends on

none
