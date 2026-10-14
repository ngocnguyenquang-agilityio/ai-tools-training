import { render, screen } from "@testing-library/react";

import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("renders the site name as the page heading, linking home", () => {
    render(<SiteHeader />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tech News" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tech News" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
