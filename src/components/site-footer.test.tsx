import { render, screen } from "@testing-library/react";

import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("credits the Hacker News API with an external link", () => {
    render(<SiteFooter />);

    const link = screen.getByRole("link", { name: "Hacker News API" });
    expect(link).toHaveAttribute("href", "https://github.com/HackerNews/API");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("credits HN Search by Algolia with an external link", () => {
    render(<SiteFooter />);

    const link = screen.getByRole("link", { name: "HN Search by Algolia" });
    expect(link).toHaveAttribute("href", "https://hn.algolia.com/api");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
