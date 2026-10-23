import Form from "next/form";

import { Button } from "@/components/ui/button";

/**
 * A GET form to /search. `next/form` adds client-side navigation and still
 * works as a plain HTML form without JavaScript
 * (node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md).
 */
export function SearchForm() {
  return (
    <Form action="/search" role="search" className="flex gap-2">
      <label htmlFor="search-q" className="sr-only">
        Search stories
      </label>
      <input
        id="search-q"
        name="q"
        type="search"
        placeholder="Search stories"
        required
        maxLength={200}
        className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit">Search</Button>
    </Form>
  );
}
