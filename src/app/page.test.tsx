import { render, screen, within } from "@testing-library/react";

import Home from "@/app/page";
import { getStories } from "@/lib/hn/client";
import type { Story } from "@/lib/hn/types";

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

describe("Home", () => {
  it("fetches the first page of 30 top stories", async () => {
    mockGetStories.mockResolvedValue({ stories: [], totalPages: 0 });

    await Home();

    expect(mockGetStories).toHaveBeenCalledWith("top", {
      page: 1,
      pageSize: 30,
    });
  });

  it("shows an empty-state message instead of a list when there are no stories", async () => {
    mockGetStories.mockResolvedValue({ stories: [], totalPages: 0 });

    render(await Home());

    expect(screen.getByText(/no stories right now/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders the stories in order as an ordered list", async () => {
    const stories = [makeStory(1), makeStory(2), makeStory(3)];
    mockGetStories.mockResolvedValue({ stories, totalPages: 1 });

    render(await Home());

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    items.forEach((item, i) => {
      expect(
        within(item).getByRole("heading", { level: 2, name: stories[i].title }),
      ).toBeInTheDocument();
    });
  });
});
