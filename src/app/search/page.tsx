import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { parseSearchParams } from "@/lib/search-params";

import { queryLabel, SearchResults } from "./search-results";

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const { query } = parseSearchParams(await searchParams);
  return {
    title: query ? `${queryLabel(query)} · Tech News` : "Search · Tech News",
  };
}

async function Connection() {
  await connection();
  return null;
}

/**
 * Renders nothing, but tells Next.js the page is meant to render per request,
 * so `generateMetadata` may read `searchParams` without blocking the page's
 * prefetch (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md,
 * "With Cache Components").
 */
function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}

// Not async: awaiting here would keep the marker out of the prerendered shell.
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <SearchResults searchParams={searchParams} />
      <DynamicMarker />
    </>
  );
}
