## Goal

Initialize shadcn/ui and add the components the news page needs.

## Tasks

- [ ] Run `pnpm dlx shadcn@latest init`. Accept the `src/` layout and the `@/` alias, and choose a base color.
- [ ] Add the components: `pnpm dlx shadcn@latest add card badge skeleton pagination button`.
- [ ] Confirm that `src/lib/utils.ts` (the `cn` helper) and the CSS variables in `globals.css`, light and dark, were generated.
- [ ] Render a sample `Card` on the home page as a temporary check. Issue #6 replaces it.

## Acceptance criteria

- The components live in `src/components/ui/`.
- `pnpm build`, `pnpm lint` and `pnpm typecheck` pass.
- The sample Card renders with shadcn styling.

## Depends on

#1
