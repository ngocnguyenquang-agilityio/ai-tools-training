import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the site heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tech News" }),
    ).toBeInTheDocument();
  });
});
