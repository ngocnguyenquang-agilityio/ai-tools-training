## Goal

Polish the UI on mobile and desktop, add dark mode, document the project and (optionally) deploy it.

## Tasks

- [ ] Responsive layout:
  - [ ] Check it at 375px, 768px and desktop widths.
  - [ ] The page must never scroll horizontally.
  - [ ] Long titles wrap.
- [ ] Dark mode: moved to #20. Check here that it still looks right after the polish.
- [ ] Accessibility pass:
  - [ ] Visible focus styles.
  - [ ] Link names make sense.
  - [ ] Colour contrast in both themes.
- [ ] Rewrite `README.md` with:
  - [ ] An overview and a screenshot.
  - [ ] The tech stack.
  - [ ] Prerequisites (Node LTS, pnpm).
  - [ ] All scripts (`dev`, `build`, `lint`, `format`, `typecheck`, `test`, `test:e2e`).
  - [ ] The project structure.
  - [ ] The data source.
- [ ] Optional: deploy to Vercel and add the URL to the README.

## Acceptance criteria

- The page looks correct at 375px and on desktop, in both light and dark mode.
- Lighthouse accessibility is 90 or higher.
- Someone new can clone the repo and run it by following the README.
- All checks pass: `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e`.

## Depends on

#9
