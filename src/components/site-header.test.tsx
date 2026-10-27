import { render, screen } from "@testing-library/react";

import { SiteHeader } from "@/components/site-header";

jest.mock("next/form", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"form">) => <form {...props} />,
}));

describe("SiteHeader", () => {
  it("has the story search form", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("search")).toHaveAttribute("action", "/search");
  });

  it("links to the saved stories", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute(
      "href",
      "/saved",
    );
  });

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
