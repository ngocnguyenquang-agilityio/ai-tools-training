import { render, screen, within } from "@testing-library/react";

import SearchPage, { generateMetadata } from "@/app/search/page";
import { searchStories } from "@/lib/hn/algolia";
import type { Story } from "@/lib/hn/types";
import type { SearchParams } from "@/lib/search-params";

jest.mock("next/cache", () => ({ cacheLife: jest.fn() }));
jest.mock("@/lib/hn/algolia", () => ({ searchStories: jest.fn() }));

const mockSearchStories = jest.mocked(searchStories);

const makeStory = (id: number): Story => ({
  id,
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  domain: "example.com",
  author: "pg",
  score: id,
  commentsCount: 0,
  publishedAt: new Date("2026-01-15T09:00:00Z"),
  commentsUrl: `https://news.ycombinator.com/item?id=${id}`,
});

const props = (searchParams: SearchParams) => ({
  params: Promise.resolve({}),
  searchParams: Promise.resolve(searchParams),
});

const renderSearch = async (searchParams: SearchParams = {}) =>
  render(await SearchPage(props(searchParams)));

describe("SearchPage", () => {
  beforeEach(() => mockSearchStories.mockReset());

  it("asks for a query and doesn't search when q is missing", async () => {
    await renderSearch();

    expect(mockSearchStories).not.toHaveBeenCalled();
    expect(screen.getByText(/type a word or phrase/i)).toBeInTheDocument();
  });

  it("searches the keyword by relevance, page 1, 30 per page", async () => {
    mockSearchStories.mockResolvedValue({ stories: [], totalPages: 0 });

    await renderSearch({ q: "rust" });

    expect(mockSearchStories).toHaveBeenCalledTimes(1);
    expect(mockSearchStories).toHaveBeenCalledWith(
      { q: "rust" },
      { sort: "relevance", page: 1, pageSize: 30 },
    );
    expect(screen.getByText("Search: rust")).toBeInTheDocument();
  });

  it("lists stories from a site", async () => {
    mockSearchStories.mockResolvedValue({
      stories: [makeStory(1)],
      totalPages: 1,
    });

    await renderSearch({ site: "lwn.net", sort: "date" });

    expect(mockSearchStories).toHaveBeenCalledWith(
      { site: "lwn.net" },
      { sort: "date", page: 1, pageSize: 30 },
    );
    expect(screen.getByText("Stories from lwn.net")).toBeInTheDocument();
  });

  it("shows a no-match message instead of a list", async () => {
    mockSearchStories.mockResolvedValue({ stories: [], totalPages: 0 });

    const { container } = await renderSearch({ q: "zzzz" });

    expect(screen.getByText(/no stories match/i)).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
  });

  it("renders the results in order, with sort tabs and paging that keep the query", async () => {
    const stories = [makeStory(1), makeStory(2)];
    mockSearchStories.mockResolvedValue({ stories, totalPages: 3 });

    const { container } = await renderSearch({
      q: "rust",
      sort: "date",
      page: "2",
    });

    const items = within(container.querySelector("ol")!).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(2);
    items.forEach((item, i) => {
      expect(
        within(item).getByRole("heading", { level: 2, name: stories[i].title }),
      ).toBeInTheDocument();
    });
    const sort = screen.getByRole("navigation", { name: "Sort" });
    expect(within(sort).getByRole("link", { name: "Newest" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(sort).getByRole("link", { name: "Relevance" }),
    ).toHaveAttribute("href", "/search?q=rust");
    expect(
      screen.getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/search?q=rust&sort=date&page=3");
  });

  it("makes one request for /search?q=zzzz&page=5 when nothing matches", async () => {
    mockSearchStories.mockResolvedValue({ stories: [], totalPages: 0 });

    await renderSearch({ q: "zzzz", page: "5" });

    expect(mockSearchStories).toHaveBeenCalledTimes(1);
    expect(mockSearchStories).toHaveBeenCalledWith(
      { q: "zzzz" },
      { sort: "relevance", page: 5, pageSize: 30 },
    );
    expect(screen.getByText(/no stories match/i)).toBeInTheDocument();
  });

  it("clamps a page past the end to the last page", async () => {
    mockSearchStories
      .mockResolvedValueOnce({ stories: [], totalPages: 3 })
      .mockResolvedValueOnce({ stories: [makeStory(1)], totalPages: 3 });

    await renderSearch({ q: "rust", page: "99" });

    expect(mockSearchStories).toHaveBeenCalledTimes(2);
    expect(mockSearchStories).toHaveBeenLastCalledWith(
      { q: "rust" },
      { sort: "relevance", page: 3, pageSize: 30 },
    );
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
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
