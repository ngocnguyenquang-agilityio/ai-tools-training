## Goal

Add a one-page "how I work with Claude" playbook for the developer role. It covers the ticket-to-PR loop, reusable prompts with the skills they trigger, guardrails and the practices worth standardizing next.

## Tasks

- [x] `docs/playbooks/developer.md`: the loop as a Mermaid flowchart, the skills table, the reusable prompts with the skills they trigger and their results, the guardrails, and the retro candidates.
- [x] `pnpm format:check` passes on the file.

## Acceptance criteria

- The file renders on GitHub, including the Mermaid flowchart.
- It is written in English and contains no secrets.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
