import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-4 py-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight">
            <Link href="/">Tech News</Link>
          </h1>
          <p className="mt-1 text-muted-foreground">
            The top technology stories from Hacker News.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
