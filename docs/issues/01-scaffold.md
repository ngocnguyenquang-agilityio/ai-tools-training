## Goal

Bootstrap the Tech News app with Next.js (App Router) and TypeScript. Set it up with pnpm, Tailwind CSS, ESLint and Prettier, so every later issue starts from a clean, consistent base.

## Tasks

- [x] Scaffold into the repo root:
      `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`
- [x] Enable TypeScript `strict` mode (it should be on by default; confirm it in `tsconfig.json`).
- [x] Add Prettier:
  - [x] Install `prettier`, `eslint-config-prettier` and `prettier-plugin-tailwindcss`.
  - [x] Add `.prettierrc` and `.prettierignore`.
  - [x] Extend the ESLint config with `prettier` so the two tools don't conflict.
- [x] Add `package.json` scripts: `dev`, `build`, `start`, `lint`, `format` (`prettier --write .`), `format:check` and `typecheck` (`tsc --noEmit`).
- [x] Remove the create-next-app boilerplate in `src/app/page.tsx` and `globals.css`, and render a simple "Tech News" heading.
- [x] Set `metadata` in `src/app/layout.tsx`: `title: "Tech News"` and a short description.
- [x] Add a project `CLAUDE.md` with these rules:
  - [x] Use pnpm, never npm or yarn.
  - [x] Ask the user before creating issues, committing or pushing.
  - [x] Before committing, spawn a subagent that runs `/code-review` on the pending diff.

## Acceptance criteria

- `pnpm dev` serves `http://localhost:3000` with a "Tech News" heading.
- `pnpm build`, `pnpm lint`, `pnpm typecheck` and `pnpm format:check` all pass.
- Only `pnpm-lock.yaml` is committed (no `package-lock.json` or `yarn.lock`).

## Depends on

None.
