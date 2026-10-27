import { render, screen, within } from "@testing-library/react";

import StoryPage, { generateMetadata } from "@/app/story/[id]/page";
import { type CommentNode, getCommentTree } from "@/lib/hn/comments";
import type { HNItem } from "@/lib/hn/types";

jest.mock("next/cache", () => ({ cacheLife: jest.fn() }));
jest.mock("@/lib/hn/comments", () => ({ getCommentTree: jest.fn() }));

const mockGetCommentTree = jest.mocked(getCommentTree);

const story: HNItem = {
  id: 7,
  type: "story",
  by: "pg",
  time: 1_768_467_600, // 2026-01-15T09:00:00Z
  title: "A story",
  url: "https://example.com/a",
  score: 12,
  descendants: 2,
};

const comment = (
  id: number,
  overrides: Partial<CommentNode> = {},
): CommentNode => ({
  id,
  author: `user${id}`,
  publishedAt: new Date("2026-01-15T10:00:00Z"),
  text: `Comment ${id}`,
  replies: [],
  ...overrides,
});

const props = (id: string) => ({
  params: Promise.resolve({ id }),
  searchParams: Promise.resolve({}),
});

describe("StoryPage", () => {
  beforeEach(() => mockGetCommentTree.mockReset());

  it("shows the story and nests replies inside their parent thread", async () => {
    mockGetCommentTree.mockResolvedValue({
      story,
      comments: [comment(1, { replies: [comment(2)] })],
    });

    render(await StoryPage(props("7")));

    expect(mockGetCommentTree).toHaveBeenCalledWith(7);
    expect(
      screen.getByRole("heading", { level: 1, name: "A story" }),
    ).toBeInTheDocument();
    const thread = screen.getByText("Comment 1").closest("details");
    expect(within(thread!).getByText("Comment 2")).toBeInTheDocument();
  });

  it("falls back to a generic heading when HN omits the title", async () => {
    mockGetCommentTree.mockResolvedValue({
      story: { ...story, title: undefined },
      comments: [],
    });

    render(await StoryPage(props("7")));

    expect(
      screen.getByRole("heading", { level: 1, name: "Story" }),
    ).toBeInTheDocument();
  });

  it("renders comment text as plain text, never as HTML", async () => {
    mockGetCommentTree.mockResolvedValue({
      story,
      comments: [comment(1, { text: "<b>bold</b>" })],
    });

    render(await StoryPage(props("7")));

    expect(screen.getByText("<b>bold</b>")).toBeInTheDocument();
  });

  it("links to the HN discussion when the cap hid some comments", async () => {
    mockGetCommentTree.mockResolvedValue({
      story: { ...story, descendants: 250 },
      comments: [comment(1)],
    });

    render(await StoryPage(props("7")));

    expect(
      screen.getByRole("link", { name: /full discussion on hacker news/i }),
    ).toHaveAttribute("href", "https://news.ycombinator.com/item?id=7");
  });

  it("shows every comment without a HN link when nothing was cut", async () => {
    mockGetCommentTree.mockResolvedValue({
      story: { ...story, descendants: 1 },
      comments: [comment(1)],
    });

    render(await StoryPage(props("7")));

    expect(
      screen.queryByRole("link", { name: /full discussion/i }),
    ).not.toBeInTheDocument();
  });

  it("says so when a story has no comments", async () => {
    mockGetCommentTree.mockResolvedValue({
      story: { ...story, descendants: 0 },
      comments: [],
    });

    render(await StoryPage(props("7")));

    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it.each([
    ["a non-numeric ID", "abc"],
    ["a partly numeric ID", "12abc"],
  ])("is not found for %s, without calling HN", async (_label, id) => {
    await expect(StoryPage(props(id))).rejects.toThrow(/NEXT_HTTP_ERROR/);

    expect(mockGetCommentTree).not.toHaveBeenCalled();
  });

  it("is not found when the ID isn't a live story", async () => {
    mockGetCommentTree.mockResolvedValue(null);

    await expect(StoryPage(props("7"))).rejects.toThrow(/NEXT_HTTP_ERROR/);
  });
});

describe("generateMetadata", () => {
  beforeEach(() => mockGetCommentTree.mockReset());

  it("falls back to a generic title when HN omits the story's title", async () => {
    mockGetCommentTree.mockResolvedValue({
      story: { ...story, title: undefined },
      comments: [],
    });

    await expect(generateMetadata(props("7"))).resolves.toEqual({
      title: "Story · Tech News",
    });
  });

  it("titles the page after the story", async () => {
    mockGetCommentTree.mockResolvedValue({ story, comments: [] });

    await expect(generateMetadata(props("7"))).resolves.toEqual({
      title: "A story · Tech News",
    });
  });
});
