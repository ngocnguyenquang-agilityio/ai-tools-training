import { isValidElement, type ReactElement } from "react";

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
  it("passes searchParams to SearchResults without awaiting them, next to a dynamic marker", () => {
    const pageProps = props({ q: "rust" });

    const page = SearchPage(pageProps) as ReactElement<{
      children: ReactElement<{ searchParams?: unknown }>[];
    }>;

    const [results, marker] = page.props.children;
    expect(isValidElement(results) && results.type).toBe(SearchResults);
    // toBe, not toEqual: toEqual treats any two Promises as equal.
    expect(results.props.searchParams).toBe(pageProps.searchParams);
    expect(isValidElement(marker)).toBe(true);
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
