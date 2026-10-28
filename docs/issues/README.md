# Tech News: implementation issues

There is one file per issue. Each body has these sections: **Goal**, **Tasks**, **Acceptance criteria**, **Depends on**.

The project started on GitHub, moved to GitLab, and moved back to GitHub in #28. GitLab is now an end-of-day mirror of the code and of each issue. The **Where** column says where each issue was worked on.

**Stack:**

- Next.js (App Router) and TypeScript
- pnpm
- Tailwind and shadcn/ui
- Hacker News API
- Jest (`next/jest`) and React Testing Library
- Playwright
- ESLint and Prettier

| #   | Title                                                                     | File                                                         | Depends on | Where           |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- | --------------- |
| 1   | Scaffold Next.js app with pnpm, TypeScript, Tailwind, ESLint and Prettier | [01-scaffold.md](01-scaffold.md)                             | none       | GitHub (closed) |
| 2   | Set up Jest (next/jest) + React Testing Library                           | [02-jest.md](02-jest.md)                                     | #1         | GitHub (closed) |
| 3   | Initialize shadcn/ui                                                      | [03-shadcn.md](03-shadcn.md)                                 | #1         | GitHub (closed) |
| 4   | Hacker News API client and types                                          | [04-hn-client.md](04-hn-client.md)                           | #2         | GitHub (closed) |
| 5   | NewsCard component                                                        | [05-news-card.md](05-news-card.md)                           | #3, #4     | GitLab (closed) |
| 6   | Home page: list top tech stories                                          | [06-home-page.md](06-home-page.md)                           | #5         | GitLab (closed) |
| 7   | Loading, error and empty states                                           | [07-states.md](07-states.md)                                 | #6         | GitLab (closed) |
| 8   | Feed tabs (Top/New/Best) and pagination                                   | [08-feeds-pagination.md](08-feeds-pagination.md)             | #6         | GitLab (closed) |
| 9   | Playwright E2E tests                                                      | [09-e2e.md](09-e2e.md)                                       | #7, #8     | GitHub (closed) |
| 10  | Responsive polish, dark mode, README and deploy                           | [10-polish-docs.md](10-polish-docs.md)                       | #9         | GitHub          |
| 11  | Document per-issue branch/PR workflow and enforce LF line endings         | [11-workflow-line-endings.md](11-workflow-line-endings.md)   | #1         | GitHub (closed) |
| 15  | Add Claude Code hooks and interim README                                  | [15-claude-hooks.md](15-claude-hooks.md)                     | #1         | GitHub (closed) |
| 18  | Move workflow docs from GitHub to GitLab                                  | [18-gitlab-migration.md](18-gitlab-migration.md)             | none       | GitLab (closed) |
| 19  | Claude Code workflow skills, subagents and related-test Stop hook         | [19-claude-workflow-skills.md](19-claude-workflow-skills.md) | none       | GitLab (closed) |
| 20  | Dark mode with theme toggle                                               | [20-dark-mode.md](20-dark-mode.md)                           | none       | GitLab (closed) |
| 21  | Jest: ignore Claude Code worktrees                                        | [21-jest-ignore-worktrees.md](21-jest-ignore-worktrees.md)   | none       | GitLab (closed) |
| 22  | GitLab MR maintenance prompt for /loop                                    | [22-loop-md.md](22-loop-md.md)                               | none       | GitLab (closed) |
| 23  | Team skill: how-we-write-tests (Jest + RTL conventions)                   | [23-team-test-skill.md](23-team-test-skill.md)               | none       | GitLab (closed) |
| 24  | Personal slash commands: /standup and /wip                                | [24-personal-commands.md](24-personal-commands.md)           | none       | GitLab (closed) |
| 25  | Shared .mcp.json with Playwright MCP                                      | [25-playwright-mcp.md](25-playwright-mcp.md)                 | none       | GitLab (closed) |
| 26  | Code-host MCP connector: GitHub (GitLab built-in disabled)                | [26-gitlab-mcp.md](26-gitlab-mcp.md)                         | none       | GitLab (closed) |
| 27  | Notify-on-finish hook and Claude automation ladder (GitLab CI review)     | [27-hooks-automation.md](27-hooks-automation.md)             | none       | GitLab (closed) |
| 28  | Move day-to-day workflow to GitHub; GitLab as end-of-day mirror           | [28-github-workflow.md](28-github-workflow.md)               | none       | GitHub (closed) |
| 30  | Search stories and filter by domain                                       | [30-search.md](30-search.md)                                 | #8         | GitHub (closed) |
| 31  | AI TL;DR of a story's comment thread                                      | [31-ai-tldr.md](31-ai-tldr.md)                               | #30        | GitHub (closed) |
| 33  | Fix /search metadata prefetch warning                                     | [33-search-metadata.md](33-search-metadata.md)               | #30        | GitHub (closed) |
| 36  | Personal Claude toolkit: rules, skills and commands in the repo           | [36-personal-toolkit.md](36-personal-toolkit.md)             | none       | GitHub (closed) |
| 38  | Bookmarks: save stories to read later                                     | [38-bookmarks.md](38-bookmarks.md)                           | none       | GitHub (closed) |
| 39  | Story page with a collapsible comment tree                                | [39-story-page.md](39-story-page.md)                         | none       | GitHub (closed) |
| 42  | Add developer playbook to docs/playbooks                                  | [42-developer-playbook.md](42-developer-playbook.md)         | none       | GitHub (closed) |

Order: 1 → {2, 3, 11, 15} → 4 → 5 → 6 → {7, 8} → 9 → 10. #18 to #28, #36, #38, #39 and #42 have no dependencies. 8 → 30 → {31, 33}. #10 rechecks #20's dark mode after the polish.

## History

Issues #1–#11 were created on GitHub from these files, in order, so the numbers match the `#N` references. GitHub numbers #12–#17 went to PRs #12–#14, #16, #17 and issue #15.

When the project moved to GitLab, the open issues #5–#10 were recreated there with the same numbers, and each one links back to its GitHub original. Finished issues and merged PRs stayed on GitHub.

GitLab CI needed a runner, and adding one needed an admin, so #28 moved day-to-day work back to GitHub. The closed GitLab issues #18–#27 were copied to GitHub as closed issues with the same numbers, so GitHub's numbers match these files and new issues start at #28. GitHub #9 and #10 are the live issues again. Their GitLab copies were closed with a link back.

## Create a new issue

Use `/new-issue <topic>`. It writes the file here first, named with the next free number (GitHub assigns it; issues and PRs share the counter), then creates the issue on GitHub from it:

```bash
gh issue create --title "<title>" --body-file docs/issues/<NN>-<slug>.md
```

If GitHub assigns a different number, rename the file to match. Then it mirrors the issue on GitLab with the same title and a description that starts with the GitHub issue URL. `/sync-gitlab` uses that URL to close the copy once the GitHub issue is closed.
