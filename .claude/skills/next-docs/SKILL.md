---
name: next-docs
description: Look up the bundled Next.js 16 docs before writing or changing Next.js code. Covers routing, pages, layouts, loading/error files, Server and Client Components, data fetching, caching, searchParams, metadata, next.config and Next APIs.
---

This repo runs a Next.js version newer than your training data. Its APIs and conventions differ, so the docs bundled with the installed package are the source of truth.

1. **Find.** The docs live in `node_modules/next/dist/docs/`. App Router material is under `01-app/` (`01-getting-started/`, `02-guides/`, `03-api-reference/`), so ignore `02-pages/`. Grep for the API or file convention you're about to use, e.g. `Grep pattern="searchParams" path="node_modules/next/dist/docs/01-app"`.
2. **Read.** Read every page that defines the API you'll touch, plus any deprecation or "breaking change" notice that mentions it. Done when you can state the exact current signature and file convention.
3. **Apply.** Write the code to match the docs, even where it differs from what you remember. In the code comment, or in your reply to the user, note the doc path you followed whenever it contradicts the familiar API.

If nothing in the docs covers the API, say so, and follow the existing code in `src/app/` as the pattern.
