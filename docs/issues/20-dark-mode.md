## Goal

Add dark mode with a theme toggle in the header. The default follows the system setting, and every color comes from the shadcn CSS variables.

Split out of #10 so it can run in parallel with #8.

## Tasks

- [x] Install `next-themes`.
- [x] `src/components/theme-provider.tsx`: a client wrapper around `next-themes`' `ThemeProvider`.
- [x] `src/app/layout.tsx`:
  - [x] Wrap the body content in `ThemeProvider` with `attribute="class"`, `defaultTheme="system"` and `enableSystem`.
  - [x] Add `suppressHydrationWarning` to `<html>`.
- [x] `src/components/theme-toggle.tsx`: a client button that switches between light and dark.
  - [x] It has an accessible name, such as "Toggle theme".
  - [x] It renders nothing theme-specific until mounted, to avoid a hydration mismatch.
- [x] Add the toggle to `src/components/site-header.tsx`, aligned to the right of the title.
- [x] `src/components/theme-toggle.test.tsx`: clicking the button calls `setTheme` with the other theme (mock `next-themes`).
- [x] Check that `src/app/globals.css` defines the `.dark` variables, and that no component uses a hard-coded color.

## Acceptance criteria

- With no stored choice, the page follows the OS light/dark setting.
- Clicking the toggle switches the theme, and the choice survives a reload.
- No hydration warning in the console.
- The page looks correct at 375px and on desktop, in both light and dark mode (`ui-verifier`).
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `pnpm test` pass.

## Depends on

none
