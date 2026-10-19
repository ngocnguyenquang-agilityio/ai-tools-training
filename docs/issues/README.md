# Tech News: implementation issues

There is one file per issue. Each body has these sections: **Goal**, **Tasks**, **Acceptance criteria**, **Depends on**.

The project started on GitHub and moved to GitLab. The **Where** column says where each issue lives.

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
| 9   | Playwright E2E tests                                                      | [09-e2e.md](09-e2e.md)                                       | #7, #8     | GitLab          |
| 10  | Responsive polish, dark mode, README and deploy                           | [10-polish-docs.md](10-polish-docs.md)                       | #9         | GitLab          |
| 11  | Document per-issue branch/PR workflow and enforce LF line endings         | [11-workflow-line-endings.md](11-workflow-line-endings.md)   | #1         | GitHub (closed) |
| 15  | Add Claude Code hooks and interim README                                  | [15-claude-hooks.md](15-claude-hooks.md)                     | #1         | GitHub (closed) |
| 18  | Move workflow docs from GitHub to GitLab                                  | [18-gitlab-migration.md](18-gitlab-migration.md)             | none       | GitLab (closed) |
| 19  | Claude Code workflow skills, subagents and related-test Stop hook         | [19-claude-workflow-skills.md](19-claude-workflow-skills.md) | none       | GitLab (closed) |
| 20  | Dark mode with theme toggle                                               | [20-dark-mode.md](20-dark-mode.md)                           | none       | GitLab (closed) |
| 21  | Jest: ignore Claude Code worktrees                                        | [21-jest-ignore-worktrees.md](21-jest-ignore-worktrees.md)   | none       | GitLab (closed) |
| 22  | GitLab MR maintenance prompt for /loop                                    | [22-loop-md.md](22-loop-md.md)                               | none       | GitLab (closed) |
| 23  | Team skill: how-we-write-tests (Jest + RTL conventions)                   | [23-team-test-skill.md](23-team-test-skill.md)               | none       | GitLab (closed) |
| 24  | Personal slash commands: /standup and /wip                                | [24-personal-commands.md](24-personal-commands.md)           | none       | GitLab (closed) |

Order: 1 → {2, 3, 11, 15} → 4 → 5 → 6 → {7, 8} → 9 → 10. #18 to #24 have no dependencies. #10 rechecks #20's dark mode after the polish.

## History

Issues #1–#11 were created on GitHub from these files, in order, so the numbers match the `#N` references. GitHub numbers #12–#17 went to PRs #12–#14, #16, #17 and issue #15.

When the project moved to GitLab, the open issues #5–#10 were recreated there with the same numbers, and each one links back to its GitHub original. Finished issues and merged PRs stayed on GitHub.

## Create a new issue

Write the file here first, named with the next free number (GitLab assigns it, starting at #19), then create the issue on GitLab from it:

```bash
glab issue create --yes --title "<title>" --description-file docs/issues/<NN>-<slug>.md
```

If GitLab assigns a different number, rename the file to match.
