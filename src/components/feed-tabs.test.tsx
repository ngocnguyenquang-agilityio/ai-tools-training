import { render, screen, within } from "@testing-library/react";

import { FeedTabs } from "@/components/feed-tabs";

describe("FeedTabs", () => {
  it("links to each feed, without a page param", () => {
    render(<FeedTabs feed="top" />);

    const nav = screen.getByRole("navigation", { name: "Feeds" });
    expect(within(nav).getByRole("link", { name: "Top" })).toHaveAttribute(
      "href",
      "/?feed=top",
    );
    expect(within(nav).getByRole("link", { name: "New" })).toHaveAttribute(
      "href",
      "/?feed=new",
    );
    expect(within(nav).getByRole("link", { name: "Best" })).toHaveAttribute(
      "href",
      "/?feed=best",
    );
  });

  it("marks only the active feed with aria-current", () => {
    render(<FeedTabs feed="new" />);

    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Top" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Best" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
