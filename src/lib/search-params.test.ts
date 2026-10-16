import { parseFeedParams } from "./search-params";

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
