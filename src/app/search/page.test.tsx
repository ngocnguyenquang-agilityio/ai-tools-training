import { connection } from "next/server";
import { isValidElement, type ReactElement, Suspense } from "react";

import SearchPage, { generateMetadata } from "@/app/search/page";
import { SearchResults } from "@/app/search/search-results";
import type { SearchParams } from "@/lib/search-params";

jest.mock("next/cache", () => ({ cacheLife: jest.fn() }));
jest.mock("next/server", () => ({ connection: jest.fn() }));
jest.mock("@/lib/hn/algolia", () => ({ searchStories: jest.fn() }));

const props = (searchParams: SearchParams) => ({
  params: Promise.resolve({}),
  searchParams: Promise.resolve(searchParams),
});

describe("SearchPage", () => {
  // Rendering needs the server runtime (`connection()`), so this checks the
  // tree the page returns; SearchResults has its own render tests.
  it("passes searchParams to SearchResults without awaiting them", () => {
    const pageProps = props({ q: "rust" });

    const [results] = SearchPage(pageProps).props.children;

    expect(isValidElement(results) && results.type).toBe(SearchResults);
    // toBe, not toEqual: toEqual treats any two Promises as equal.
    expect(results.props.searchParams).toBe(pageProps.searchParams);
  });

  it("renders a marker that calls connection() inside Suspense", async () => {
    const [, marker] = SearchPage(props({ q: "rust" })).props.children;

    // Unwrap the marker by hand: it isn't exported, and rendering it needs
    // the server runtime.
    const boundary = (marker.type as () => ReactElement)();
    const { children: inner } = boundary.props as { children: ReactElement };
    const rendered = await (inner.type as () => Promise<null>)();

    expect(boundary.type).toBe(Suspense);
    expect(connection).toHaveBeenCalledTimes(1);
    expect(rendered).toBeNull();
  });
});

describe("generateMetadata", () => {
  it.each([
    ["a keyword", { q: "rust" }, "Search: rust · Tech News"],
    ["a site", { site: "lwn.net" }, "Stories from lwn.net · Tech News"],
    ["no query", {}, "Search · Tech News"],
  ])("titles the page for %s", async (_, searchParams, title) => {
    expect(await generateMetadata(props(searchParams))).toEqual({ title });
  });
});
