import { render, screen, within } from "@testing-library/react";

import { SortTabs } from "@/components/sort-tabs";

describe("SortTabs", () => {
  it("links each sort for the same query, without a page param", () => {
    render(<SortTabs query={{ site: "lwn.net" }} sort="relevance" />);

    const nav = screen.getByRole("navigation", { name: "Sort" });
    expect(
      within(nav).getByRole("link", { name: "Relevance" }),
    ).toHaveAttribute("href", "/search?site=lwn.net");
    expect(within(nav).getByRole("link", { name: "Newest" })).toHaveAttribute(
      "href",
      "/search?site=lwn.net&sort=date",
    );
  });

  it("marks only the active sort with aria-current", () => {
    render(<SortTabs query={{ q: "rust" }} sort="date" />);

    expect(screen.getByRole("link", { name: "Newest" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Relevance" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
