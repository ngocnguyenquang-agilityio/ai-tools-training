# Tech News

A small Next.js app that lists top tech stories from the [Hacker News API](https://github.com/HackerNews/API). The repo is also a practice ground for working with AI coding tools (Claude Code).

> This README is an interim version. Issue #10 completes it with a screenshot, end-to-end tests and the deploy URL.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) and TypeScript
- Tailwind CSS and [shadcn/ui](https://ui.shadcn.com) (Base UI)
- Jest (`next/jest`) and React Testing Library
- ESLint and Prettier
- pnpm

## Prerequisites

- Node.js LTS (22 or newer)
- pnpm 11. The version is pinned in `package.json`, so `corepack enable` installs the right one. Node 25 and newer no longer bundle Corepack; on those versions, install it first with `npm install -g corepack`.

## Getting started

```bash
corepack enable
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Scripts

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start the dev server                          |
| `pnpm build`        | Build for production                          |
| `pnpm start`        | Serve the production build                    |
| `pnpm lint`         | Run ESLint                                    |
| `pnpm format`       | Format all files with Prettier                |
| `pnpm format:check` | Check formatting without writing              |
| `pnpm typecheck`    | Generate route types, then run `tsc --noEmit` |
| `pnpm test`         | Run the Jest tests                            |
| `pnpm test:watch`   | Run Jest in watch mode                        |

## Project structure

```text
src/
  app/              Routes, layout and global styles (App Router)
  components/ui/    shadcn/ui components
  lib/              Shared helpers
docs/issues/        One Markdown file per issue
.claude/            Shared Claude Code settings and hooks
```

## Workflow

The repo is hosted on [GitLab](https://gitlab.asoft-python.com/ngoc.nguyenquang/ai-tools-training). Earlier, finished work (issues #1–#4, #11 and #15, PRs #12–#17) stays on [GitHub](https://github.com/ngocnguyenquang-agilityio/ai-tools-training) as history.

Work is planned as issues in [`docs/issues/`](docs/issues/README.md). Each issue gets one branch and one merge request (MR):

- **Branch:** `<type>/<issue>-<slug>`, cut from `feat/ai-tools`. Example: `feat/2-jest-setup`.
- **Commit messages:** `<type>(#<issue>): <message>`.
- **Issue status:** the issue branch ticks its tasks in `docs/issues/<NN>-<slug>.md` and marks the issue closed in `docs/issues/README.md`, so the status merges with the work.
- **Merge request:** goes into `feat/ai-tools` and is titled `[#<issue>] <issue title>`.

See [`CLAUDE.md`](CLAUDE.md) for the full rules.

## Claude Code hooks

[`.claude/settings.json`](.claude/settings.json) registers hooks that enforce the project rules while Claude Code works. They run automatically for anyone who opens the repo in Claude Code. The scripts in [`.claude/hooks/`](.claude/hooks) are plain Node, so they work on Windows, macOS and Linux.

| Hook              | Runs                                 | What it does                                                                                                                                              |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-guard.mjs`  | Before every Bash/PowerShell command | Blocks `npm`, `yarn` and `npx`, and tells Claude to use `pnpm` or `pnpm dlx`                                                                              |
| `format-file.mjs` | After Claude edits or writes a file  | Runs Prettier on the file, and `eslint --fix` on JS/TS files. Errors that can't be fixed automatically are sent back to Claude.                           |
| `stop-checks.mjs` | When Claude finishes its turn        | If JS/TS files changed, runs `pnpm typecheck` and `pnpm lint`. Failures are sent back to Claude so it fixes them before stopping (at most once per turn). |

When a hook blocks something or reports errors, it exits with code 2. Claude Code shows the message to Claude, which then corrects itself.

To check which hooks are active, run `/hooks` in Claude Code. Personal overrides go in `.claude/settings.local.json`, which git ignores.
