import {
  isSearchableSite,
  parseFeedParams,
  parseSearchParams,
  searchHref,
} from "./search-params";

describe("parseFeedParams", () => {
  it("defaults to the Top feed, page 1, when both params are missing", () => {
    expect(parseFeedParams({})).toEqual({ feed: "top", page: 1 });
  });

  it.each(["top", "new", "best"] as const)("keeps the %p feed", (feed) => {
    expect(parseFeedParams({ feed }).feed).toBe(feed);
  });

  it.each([
    ["an unknown feed", "foo"],
    ["the wrong case", "New"],
    ["an empty string", ""],
    ["a repeated param", ["new", "best"]],
  ])("falls back to top for %s", (_, feed) => {
    expect(parseFeedParams({ feed }).feed).toBe("top");
  });

  it.each([
    ["1", 1],
    ["2", 2],
    ["42", 42],
  ])("parses page %p as %i", (page, expected) => {
    expect(parseFeedParams({ page }).page).toBe(expected);
  });

  it.each([
    ["zero", "0"],
    ["a negative number", "-3"],
    ["a decimal", "2.5"],
    ["a non-number", "abc"],
    ["a number with trailing text", "2abc"],
    ["an empty string", ""],
    ["whitespace", " "],
    ["padded digits", " 2 "],
    ["a signed number", "+2"],
    ["exponent notation", "1e1"],
    ["a hex literal", "0x10"],
    ["an unsafe integer", "9007199254740993"],
    ["a repeated param", ["2", "3"]],
  ])("falls back to page 1 for %s", (_, page) => {
    expect(parseFeedParams({ page }).page).toBe(1);
  });

  it("falls back to Top, page 1, for /?feed=foo&page=-3", () => {
    expect(parseFeedParams({ feed: "foo", page: "-3" })).toEqual({
      feed: "top",
      page: 1,
    });
  });

  it("parses both params together", () => {
    expect(parseFeedParams({ feed: "new", page: "2" })).toEqual({
      feed: "new",
      page: 2,
    });
  });
});

describe("parseSearchParams", () => {
  it("has no query, relevance sort and page 1 when params are missing", () => {
    expect(parseSearchParams({})).toEqual({
      query: null,
      sort: "relevance",
      page: 1,
    });
  });

  it("trims the keyword query", () => {
    expect(parseSearchParams({ q: "  rust async  " }).query).toEqual({
      q: "rust async",
    });
  });

  it("cuts a keyword query to 200 characters", () => {
    const q = "a".repeat(250);

    expect(parseSearchParams({ q }).query).toEqual({ q: "a".repeat(200) });
  });

  it.each([
    ["an empty string", ""],
    ["whitespace", "   "],
    ["a repeated param", ["rust", "go"]],
  ])("has no query for %s", (_, q) => {
    expect(parseSearchParams({ q }).query).toBeNull();
  });

  it.each([
    ["lwn.net", "lwn.net", "lwn.net"],
    ["a subdomain", "blog.example.co.uk", "blog.example.co.uk"],
    ["upper case and padding", " LWN.net ", "lwn.net"],
    ["a www. prefix", "www.nytimes.com", "nytimes.com"],
  ])("normalizes the site for %s", (_, site, expected) => {
    expect(parseSearchParams({ site }).query).toEqual({ site: expected });
  });

  it.each([
    ["no dot", "localhost"],
    ["a path", "lwn.net/Articles"],
    ["a scheme", "https://lwn.net"],
    ["spaces inside", "lwn .net"],
    ["a repeated param", ["lwn.net", "github.com"]],
  ])("ignores a site with %s", (_, site) => {
    expect(parseSearchParams({ site }).query).toBeNull();
  });

  it("prefers a valid site over a keyword", () => {
    expect(parseSearchParams({ q: "rust", site: "lwn.net" }).query).toEqual({
      site: "lwn.net",
    });
  });

  it("falls back to the keyword when the site is invalid", () => {
    expect(parseSearchParams({ q: "rust", site: "nope" }).query).toEqual({
      q: "rust",
    });
  });

  it.each([
    ["relevance", "relevance"],
    ["date", "date"],
    ["foo", "relevance"],
    ["Date", "relevance"],
  ])("reads sort %p as %p", (sort, expected) => {
    expect(parseSearchParams({ sort }).sort).toBe(expected);
  });

  it("falls back to page 1 for /search?q=rust&page=-3", () => {
    expect(parseSearchParams({ q: "rust", page: "-3" }).page).toBe(1);
  });
});

describe("searchHref", () => {
  it.each([
    ["a keyword, page 1", { q: "rust" }, {}, "/search?q=rust"],
    ["a site", { site: "lwn.net" }, {}, "/search?site=lwn.net"],
    [
      "a date sort and page",
      { q: "rust" },
      { sort: "date", page: 3 },
      "/search?q=rust&sort=date&page=3",
    ],
    [
      "relevance and page 1 (the defaults)",
      { q: "rust" },
      { sort: "relevance", page: 1 },
      "/search?q=rust",
    ],
    ["a keyword to encode", { q: "c++ & go" }, {}, "/search?q=c%2B%2B+%26+go"],
  ] as const)("builds the URL for %s", (_, query, options, expected) => {
    expect(searchHref(query, options)).toBe(expected);
  });

  it("round-trips through parseSearchParams", () => {
    const href = searchHref({ q: "c++ & go" }, { sort: "date", page: 2 });
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);

    expect(parseSearchParams(params)).toEqual({
      query: { q: "c++ & go" },
      sort: "date",
      page: 2,
    });
  });
});

describe("isSearchableSite", () => {
  it.each([
    ["a domain", "lwn.net", true],
    ["a subdomain", "blog.example.co.uk", true],
    ["a hostname without a dot", "localhost", false],
    ["an IPv6 address", "[::1]", false],
    ["a trailing dot", "example.com.", false],
    ["an underscore", "my_site.example.com", false],
  ])("handles %s (%p)", (_, domain, expected) => {
    expect(isSearchableSite(domain)).toBe(expected);
  });
});
