## Goal

Set up unit and component testing with Jest, using the official `next/jest` preset and React Testing Library.

## Tasks

- [x] Install the dev dependencies: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@types/jest` and `ts-node`. (`ts-node` is needed because the config file is `jest.config.ts`.)
- [x] Create `jest.config.ts`:
  - [x] Use `nextJest({ dir: './' })` so Jest picks up the Next/SWC transforms, `.env` files and `next.config`.
  - [x] Set `testEnvironment: 'jsdom'`.
  - [x] Set `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']`.
  - [x] Set `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }`.
  - [x] Ignore `/e2e/` and `/.next/` in `testPathIgnorePatterns`.
- [x] Create `jest.setup.ts`, which imports `@testing-library/jest-dom`.
- [x] Add the scripts `test` (`jest`) and `test:watch` (`jest --watch`).
- [x] Add one smoke test, e.g. render a trivial component and assert its text.

## Acceptance criteria

- `pnpm test` runs green.
- `@/` imports resolve inside tests.
- `pnpm typecheck` still passes, and the jest-dom matchers are typed.

## Notes

Jest cannot render **async Server Components**. Unit tests target the pure data functions and the synchronous presentational components. The rendered pages are covered by Playwright (see the E2E issue).

## Depends on

#1
