import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          <Link href="/">Tech News</Link>
        </h1>
        <p className="mt-1 text-muted-foreground">
          The top technology stories from Hacker News.
        </p>
      </div>
    </header>
  );
}
