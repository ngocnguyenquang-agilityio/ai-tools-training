export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-muted-foreground">
        Data from the{" "}
        <a
          href="https://github.com/HackerNews/API"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Hacker News API
        </a>
        . Search results from{" "}
        <a
          href="https://hn.algolia.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          HN Search by Algolia
        </a>
        .
      </div>
    </footer>
  );
}
