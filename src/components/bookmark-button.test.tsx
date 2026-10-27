import { fireEvent, render, screen } from "@testing-library/react";

import { BookmarkButton } from "@/components/bookmark-button";
import { getBookmarks } from "@/lib/bookmarks";
import type { Story } from "@/lib/hn/types";

const story: Story = {
  id: 1,
  title: "Show HN: A tiny news reader",
  url: "https://www.example.com/post",
  domain: "example.com",
  author: "pg",
  score: 123,
  commentsCount: 45,
  publishedAt: new Date("2026-01-15T09:00:00Z"),
  commentsUrl: "https://news.ycombinator.com/item?id=1",
};

const otherStory: Story = { ...story, id: 2, title: "Another story" };

beforeEach(() => {
  window.localStorage.clear();
});

describe("BookmarkButton", () => {
  it("starts unsaved, with a label that names the story", () => {
    render(<BookmarkButton story={story} />);

    expect(
      screen.getByRole("button", { name: `Save ${story.title}` }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("saves the story when clicked and removes it on a second click", () => {
    render(<BookmarkButton story={story} />);
    const button = screen.getByRole("button", { name: `Save ${story.title}` });

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(getBookmarks()).toEqual([story]);

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(getBookmarks()).toEqual([]);
  });

  it("shows a story that was saved earlier as pressed", () => {
    const { unmount } = render(<BookmarkButton story={story} />);
    fireEvent.click(screen.getByRole("button", { name: /^Save / }));
    unmount();

    render(<BookmarkButton story={story} />);

    expect(screen.getByRole("button", { name: /^Save / })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps every button for the same story in step, and leaves other stories alone", () => {
    render(
      <>
        <BookmarkButton story={story} />
        <BookmarkButton story={story} />
        <BookmarkButton story={otherStory} />
      </>,
    );
    const [first, second, other] = screen.getAllByRole("button");

    fireEvent.click(first);

    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(other).toHaveAttribute("aria-pressed", "false");
  });
});
