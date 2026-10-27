import { act, fireEvent, render, screen } from "@testing-library/react";

import { SavedStories } from "@/app/saved/saved-stories";
import { toggleBookmark } from "@/lib/bookmarks";
import type { Story } from "@/lib/hn/types";

function makeStory(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    url: `https://example.com/${id}`,
    domain: "example.com",
    author: "pg",
    score: 10,
    commentsCount: 3,
    publishedAt: new Date("2026-01-15T09:00:00Z"),
    commentsUrl: `https://news.ycombinator.com/item?id=${id}`,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SavedStories", () => {
  it("shows an empty state that points back to the feed when nothing is saved", () => {
    render(<SavedStories />);

    expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "feed" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists saved stories, newest save first, without a TL;DR button", () => {
    toggleBookmark({ ...makeStory(1), commentsCount: 45 });
    toggleBookmark(makeStory(2));

    render(<SavedStories />);

    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Story 2", "Story 1"]);
    expect(
      screen.queryByRole("button", { name: "TL;DR" }),
    ).not.toBeInTheDocument();
  });

  it("drops a story from the list when it is unsaved", () => {
    toggleBookmark(makeStory(1));
    toggleBookmark(makeStory(2));
    render(<SavedStories />);

    fireEvent.click(screen.getByRole("button", { name: "Save Story 1" }));

    expect(
      screen.queryByRole("heading", { level: 2, name: "Story 1" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Story 2" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state once the last story is unsaved", () => {
    toggleBookmark(makeStory(1));
    render(<SavedStories />);

    fireEvent.click(screen.getByRole("button", { name: "Save Story 1" }));

    expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it("picks up a story saved elsewhere on the page", () => {
    render(<SavedStories />);

    act(() => toggleBookmark(makeStory(1)));

    expect(
      screen.getByRole("heading", { level: 2, name: "Story 1" }),
    ).toBeInTheDocument();
  });
});
