import { render, screen, within } from "@testing-library/react";

import Home from "@/app/page";
import { getStories } from "@/lib/hn/client";
import type { Story } from "@/lib/hn/types";
import type { SearchParams } from "@/lib/search-params";

jest.mock("next/cache", () => ({ cacheLife: jest.fn() }));
jest.mock("@/lib/hn/client", () => ({ getStories: jest.fn() }));

const mockGetStories = jest.mocked(getStories);

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

const renderHome = async (searchParams: SearchParams = {}) =>
  render(
    await Home({
      params: Promise.resolve({}),
      searchParams: Promise.resolve(searchParams),
    }),
  );

describe("Home", () => {
  beforeEach(() => mockGetStories.mockReset());

  it("fetches the first page of 30 top stories by default", async () => {
    mockGetStories.mockResolvedValue({ stories: [], totalPages: 0 });

    await renderHome();

    expect(mockGetStories).toHaveBeenCalledTimes(1);
    expect(mockGetStories).toHaveBeenCalledWith("top", {
      page: 1,
      pageSize: 30,
    });
  });

  it("passes the feed and page from the URL to getStories", async () => {
    mockGetStories.mockResolvedValue({ stories: [], totalPages: 5 });

    await renderHome({ feed: "new", page: "2" });

    expect(mockGetStories).toHaveBeenCalledWith("new", {
      page: 2,
      pageSize: 30,
    });
  });

  it("falls back to Top, page 1, for /?feed=foo&page=-3", async () => {
    mockGetStories.mockResolvedValue({
      stories: [makeStory(1)],
      totalPages: 5,
    });

    await renderHome({ feed: "foo", page: "-3" });

    expect(mockGetStories).toHaveBeenCalledWith("top", {
      page: 1,
      pageSize: 30,
    });
    expect(screen.getByRole("link", { name: "Top" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
  });

  it("clamps a page past the end to the last page", async () => {
    mockGetStories
      .mockResolvedValueOnce({ stories: [], totalPages: 5 })
      .mockResolvedValueOnce({ stories: [makeStory(1)], totalPages: 5 });

    await renderHome({ feed: "best", page: "999" });

    expect(mockGetStories).toHaveBeenLastCalledWith("best", {
      page: 5,
      pageSize: 30,
    });
    expect(screen.getByText("Page 5 of 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows an empty-state message instead of a list when there are no stories", async () => {
    mockGetStories.mockResolvedValue({ stories: [], totalPages: 0 });

    const { container } = await renderHome();

    expect(screen.getByText(/no stories right now/i)).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
    expect(
      screen.getByRole("navigation", { name: "Feeds" }),
    ).toBeInTheDocument();
  });

  it("renders the stories in order as an ordered list", async () => {
    const stories = [makeStory(1), makeStory(2), makeStory(3)];
    mockGetStories.mockResolvedValue({ stories, totalPages: 1 });

    const { container } = await renderHome();

    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    items.forEach((item, i) => {
      expect(
        within(item).getByRole("heading", { level: 2, name: stories[i].title }),
      ).toBeInTheDocument();
    });
  });
});
