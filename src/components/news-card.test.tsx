import { render, screen } from "@testing-library/react";

import { NewsCard } from "@/components/news-card";
import type { Story } from "@/lib/hn/types";

const now = new Date("2026-01-15T12:00:00Z");

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

describe("NewsCard", () => {
  it("links the title heading to the story URL in a new tab", () => {
    render(<NewsCard story={story} now={now} />);

    expect(
      screen.getByRole("heading", { level: 2, name: story.title }),
    ).toBeInTheDocument();
    const title = screen.getByRole("link", { name: story.title });
    expect(title).toHaveAttribute("href", story.url);
    expect(title).toHaveAttribute("target", "_blank");
    expect(title).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the domain, score, author and relative time", () => {
    render(<NewsCard story={story} now={now} />);

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("123 points")).toBeInTheDocument();
    expect(screen.getByText("by pg")).toBeInTheDocument();
    expect(screen.getByText("3 hours ago")).toHaveAttribute(
      "dateTime",
      story.publishedAt.toISOString(),
    );
  });

  it("links the domain badge to more stories from that site", () => {
    render(<NewsCard story={story} now={now} />);

    const badge = screen.getByRole("link", {
      name: "More stories from example.com",
    });
    expect(badge).toHaveAttribute("href", "/search?site=example.com");
    expect(badge).toHaveTextContent("example.com");
    expect(badge).not.toHaveAttribute("target");
  });

  it("shows a domain that can't be searched, like example.com., as plain text", () => {
    render(<NewsCard story={{ ...story, domain: "example.com." }} now={now} />);

    expect(screen.getByText("example.com.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /more stories from/i }),
    ).not.toBeInTheDocument();
  });

  it("links the comment count to the HN discussion", () => {
    render(<NewsCard story={story} now={now} />);

    const comments = screen.getByRole("link", { name: "45 comments" });
    expect(comments).toHaveAttribute("href", story.commentsUrl);
    expect(comments).toHaveAttribute("target", "_blank");
    expect(comments).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses the singular for one point and one comment", () => {
    render(
      <NewsCard story={{ ...story, score: 1, commentsCount: 1 }} now={now} />,
    );

    expect(screen.getByText("1 point")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1 comment" })).toBeInTheDocument();
  });

  it("links an Ask HN story to HN and shows no domain badge", () => {
    const askHn: Story = {
      ...story,
      title: "Ask HN: What are you working on?",
      url: story.commentsUrl,
      domain: null,
    };
    const { container } = render(<NewsCard story={askHn} now={now} />);

    expect(screen.getByRole("link", { name: askHn.title })).toHaveAttribute(
      "href",
      "https://news.ycombinator.com/item?id=1",
    );
    expect(screen.queryByText("example.com")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="badge"]'),
    ).not.toBeInTheDocument();
  });
});
